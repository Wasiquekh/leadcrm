"use client";
import Image from "next/image";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaGreaterThan } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { MdOutlineCall } from "react-icons/md";
import { LiaArrowCircleDownSolid } from "react-icons/lia";
import { MdRemoveRedEye } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import AxiosProvider from "../../provider/AxiosProvider";
import { RiAccountCircleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import StorageManager from "../../provider/StorageManager";
import { AppContext } from "../AppContext";
//import CustomerViewDetails from "../component/CustomerViewDetails";
import LeftSideBar from "../component/LeftSideBar";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DesktopHeader from "../component/DesktopHeader";
import { FaEllipsisVertical } from "react-icons/fa6";
import { strict } from "assert";
import { Tooltip } from "react-tooltip";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const axiosProvider = new AxiosProvider();

interface FilterData {
  name: string;
  mobilephonenumber?: string;
  birthdate?: string;
}

// ALL LEADS
interface Lead {
  id: string;
  lead_number: string;
  owner_name: string | null;
  account_manager: string | null;
  best_time_to_call: string | null;

  lead_source: string | null;
  debt_consolidation_status: string | null;
  consolidated_credit_status: string | null;
  whatsapp_status: string | null;
  loan_application_status: string | null;

  full_name: string;
  email: string | null;
  phone: string | null;

  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  };

  lead_score: number | null;
  lead_quality: string | null;

  agent: {
    id: string;
    name: string;
  } | null;

  created_at: string;
  updated_at: string;

  lead_age_days: number;
  lead_age_label: string;
}
//CREATE LEADS
type CreateLead = {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  lead_score?: number;
  lead_quality?: string;
  best_time_to_call?: string;
  lead_source_id: string; // UUID
  debt_consolidation_status_id?: string;
};

export default function Home() {
  // const isChecking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [data, setData] = useState<Lead[]>([]);
  //console.log("DATAAAAA", data);
  const [page, setPage] = useState<number>(1);
  const [filterPage, setFilterPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPagesFilter, setTotalPagesFilter] = useState<number>(1);
  const [filterData, setFilterData] = useState<FilterData>({
    name: "",
    mobilephonenumber: "",
  });
  //console.log("TTTTTTTTTTTTTTTTTTTTTTTT", filterData);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null);
  const [isCreateLeads, setIsCreateLeads] = useState<boolean>(false);
  const [isBulkLeads, setIsBulkLeads] = useState<boolean>(false);
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [isEditLead, setIsEditLead] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<Lead | null>(null);
  const [hitApi, setHitApi] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [editLeadData, setEditLeadData] = useState<CreateLead | null>(null);
  console.log("EEEEEEEEEEDITTTTTT", editLeadData);
  //console.log("SELECTED DATA", selectedData);
  const storage = new StorageManager();
  const accessToken = storage.getAccessToken();

  //console.log("Get all user Data", data);
  const router = useRouter();

  const handleClick = async (customer: Lead) => {
    // console.log('Object customer data',customer.id)
    router.push(`/leadsdetails?id=${customer.id}`);
  };
  const LeadSchema = Yup.object({
    first_name: Yup.string().trim().required("First name is required"),
    last_name: Yup.string().trim().required("Last name is required"),
    full_name: Yup.string().trim().required("Full name is required"),
    email: Yup.string()
      .trim()
      .email("Enter a valid email")
      .required("Email is required"),
    phone: Yup.string()
      .trim()
      .required("Phone number is required") // ✅ make phone required
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
    address_line1: Yup.string().optional(),
    address_line2: Yup.string().optional(),
    city: Yup.string().optional(),
    state: Yup.string().optional(),
    postal_code: Yup.string().optional(),
    country: Yup.string().optional(),
    lead_score: Yup.number()
      .transform((v, o) => (o === "" ? undefined : v))
      .optional(),
    lead_quality: Yup.string().optional(),
    best_time_to_call: Yup.string().optional(),
    lead_source_id: Yup.string().optional(),
    debt_consolidation_status_id: Yup.string().optional(),
  });

  const handleCreateLead = async (value: CreateLead) => {
    setIsLoading(true);
    // setIsFilter(false);
    setFlyoutOpen(false);

    try {
      await axiosProvider.post("/leads", value);
      toast.success("Lead is Creatted");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead is not Creatted");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!excelFile) return toast.error("Please select a file");

    const formEl = e.currentTarget;

    try {
      setIsLoading(true);
      setFlyoutOpen(false);
      const fd = new FormData();
      fd.append("file", excelFile as File); // key = "file"

      const res = await fetch(
        "https://manageleadcrmbackend.dynsimulation.com/api/v1/managelead/leads/bulk/upload",
        { method: "POST", body: fd }
      );

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();
      if (!res.ok)
        throw new Error(
          (payload && payload.message) || payload || `HTTP ${res.status}`
        );

      toast.success("Bulk Lead is uploaded");
      setHitApi(!hitApi);
      setExcelFile(null);
      formEl.reset();
    } catch (err: any) {
      toast.error(err?.message || "Bulk Lead is not uploaded");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Directly set date input value, as it is already in YYYY-MM-DD format
    // const formattedValue = name === 'birthdate' ? value : value;

    setFilterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const filterDataValue = () => {
    const filters: string[] = [];
    if (filterData.name) filters.push(`Name: ${filterData.name}`);
    if (filterData.mobilephonenumber)
      filters.push(`Phone: ${filterData.mobilephonenumber}`);
    setAppliedFilters(filters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // filterDataValue();
    // setIsFilter(true);
    // toggleFilterFlyout();
    // const filteredData = Object.fromEntries(
    //   Object.entries(filterData).filter(([_, value]) => value !== "")
    // );
    // if (Object.keys(filteredData).length === 0) {
    //   setPage(1);
    //   fetchData(page);
    // } else {
    //   userFilterData(filteredData, filterPage);
    // }
  };
  // const userFilterData = async (data: any, page: number) => {
  //   setIsFilter(true);
  //   setIsLoading(true);
  //   try {
  //     const response = await axiosProvider.post(
  //       `/filter?page=${page}&pageSize=${pageSize}`,
  //       data
  //     );
  //     const result = response.data.data;
  //     // console.log("VVVVVVVVVVVVVVVVV", result);
  //     setData(result.customers);
  //     setTotalPagesFilter(result.totalPages);
  //   } catch (error: any) {
  //     setData([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const createLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(true);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
  };
  const bulkLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(true);
    setIsFilter(false);
    setIsEditLead(false);
  };
  const filterLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(true);
    setIsEditLead(false);
  };
  const editLead = (editData: CreateLead) => {
    setEditLeadData(editData);
    setFlyoutOpen(true);
    setIsEditLead(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
  };

  const fetchData = async () => {
    setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await axiosProvider.get(
        `/alleads?page=${page}&pageSize=${pageSize}`
      );
      // console.log(
      //   "KKKKKKKKKKKKKKKKK",
      //   response.data.data.pagination.totalPages
      // );
      setTotalPages(response.data.data.pagination.totalPages);
      const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
      setData(result);
    } catch (error: any) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, hitApi]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const hadleClear = () => {
    setFilterData({ ...filterData, name: "", mobilephonenumber: "" });
  };
  // const handlePageChangeFilter = (newPage: number) => {
  //   if (newPage > 0 && newPage <= totalPagesFilter) {
  //     setFilterPage(newPage);
  //     userFilterData(newPage, filterPage);
  //   }
  // };

  const test = (id: string) => {
    console.log("IDDDDDDDDDDDDDDDDDDDDDD", id);
    router.push(`/leadsdetails?id=${id}`);
  };
  // if (isChecking) {
  //   return (
  //     <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
  //       <Image
  //         src="/images/orizonIcon.svg"
  //         alt="Loading"
  //         width={150}
  //         height={150}
  //         className="animate-pulse rounded"
  //       />
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center">
        <Image
          src="/images/orizonIcon.svg"
          alt="Table image"
          width={500}
          height={500}
          style={{ width: "150px", height: "auto" }}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  // Removed duplicate setExcelFile function to fix identifier conflict.

  return (
    <>
      <LeftSideBar />
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <div className=" ml-[97px] w-full md:w-[90%] m-auto bg-[#fff] min-h-[500px]  rounded p-4 mt-0 ">
          {/* left section top row */}
          <DesktopHeader />
          {/* Main content middle section */}
          {/* ----------------Table----------------------- */}
          <div className="relative overflow-x-auto shadow-lastTransaction rounded-xl sm:rounded-3xl px-1 py-6 md:p-6 !bg-white  z-10">
            {/* Search and filter table row */}
            <div className=" flex justify-end items-center mb-6  w-full mx-auto">
              <div className=" flex justify-center items-center gap-4">
                <div
                  className=" flex justify-center gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                  onClick={() => createLeads()}
                >
                  <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Create Leads
                  </p>
                </div>
                <div
                  className=" flex justify-center  gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                  onClick={() => bulkLeads()}
                >
                  <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Bulk Leads
                  </p>
                </div>
                <div
                  className=" flex justify-center  gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                  onClick={() => filterLeads()}
                >
                  <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Filter Leads
                  </p>
                </div>
              </div>
            </div>
            {/* End search and filter row */}
            {/* Show Applied Filters */}

            {/* ---------------- Table--------------------------- */}
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <thead className="text-xs text-[#999999] bg-white">
                  <tr className="border border-tableBorder">
                    {/* Name - Birth Date: Always Visible */}
                    <th
                      scope="col"
                      className="px-3 py-3 md:p-3 border border-tableBorder"
                    >
                      <div className="flex items-center gap-2">
                        <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className=" font-semibold text-secondBlack text-lg sm:text-base">
                          Full Name
                        </span>
                      </div>
                    </th>

                    {/* Other columns: Hidden on mobile, visible from md: */}
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-secondBlack text-lg sm:text-base">
                          Email
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-secondBlack text-lg sm:text-base">
                          Phone
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <SiHomeassistantcommunitystore className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-secondBlack text-lg sm:text-base">
                          Address
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <LiaArrowCircleDownSolid className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-secondBlack text-lg sm:text-base">
                          Action
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {!data || data.length === 0 || isError ? (
                    <tr>
                      <td colSpan={8} className="text-center text-xl mt-5">
                        <div className="mt-5">Data not found</div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item: any, index: number) => (
                      <tr
                        key={item?.id ?? index}
                        className="border border-tableBorder bg-white hover:bg-primary-100"
                      >
                        {/* Full name */}
                        <td className="px-1 py-2 md:px-3 md:py-2 border-tableBorder flex items-center gap-2">
                          <div className="flex gap-2">
                            <div className="md:hidden">
                              <FaEllipsisVertical
                                data-tooltip-id="my-tooltip"
                                data-tooltip-html={`<div>
                  <strong>Name:</strong> <span style="text-transform: capitalize;">${
                    item?.full_name ?? "-"
                  }</span><br/>
                  <strong>Email:</strong> ${item?.email ?? "-"}<br/>
                  <strong>Phone:</strong> ${item?.phone ?? "-"}<br/>
                  <strong>Owner:</strong> ${item?.owner_name ?? "-"}<br/>
                  <strong>Account Manager:</strong> ${
                    item?.account_manager ?? "-"
                  }
                </div>`}
                                className="text-black leading-normal relative top-[5.3px] capitalize"
                              />
                              <Tooltip
                                id="my-tooltip"
                                place="right"
                                float
                                className="box"
                              />
                            </div>
                            <div>
                              <p className="text-[#232323] text-sm sm:text-base font-medium leading-normal capitalize">
                                {item?.full_name ?? "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                          <span className="text-[#232323] text-sm sm:text-base">
                            {item?.email ?? "-"}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                          <span className="text-[#232323] text-sm sm:text-base">
                            {item?.phone ?? "-"}
                          </span>
                        </td>

                        {/* Owner */}
                        <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                          <span className="text-[#232323] text-sm sm:text-base capitalize">
                            {item?.address.country ?? "-"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-3 py-2 border border-tableBorder md:table-cell">
                          <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                            <button
                              onClick={() => test(item.id)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                View Details
                              </span>
                            </button>
                            <button
                              onClick={() => editLead(item)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                Edit
                              </span>
                            </button>
                            <button
                              onClick={() => test(item.id)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                Delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ----------------End table------------------------ */}
          </div>
          {/* Pagination Controls */}
          {isFilter ? (
            <div className="flex justify-center items-center my-10 relative">
              <button
                //onClick={() => handlePageChangeFilter(filterPage - 1)}
                disabled={filterPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#232323] text-sm">
                Page {filterPage} of {totalPagesFilter}
              </span>
              <button
                // onClick={() => handlePageChangeFilter(filterPage + 1)}
                disabled={filterPage === totalPagesFilter}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#717171] text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
          )}
          {/* ----------------End prgination--------------------------- */}

          {/* <div className="w-full h-24 bg-header-gradient opacity-20 absolute top-0 left-0 right-0 "></div> */}
        </div>
      </div>

      {/*  FLYOUT */}
      {isFlyoutOpen && (
        <div
          className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => {
            setFlyoutOpen(!isFlyoutOpen);
          }}
        ></div>
      )}

      <>
        <div className={`flyout ${isFlyoutOpen ? "open" : ""}`}>
          {isCreateLeads && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Create Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}

              <Formik
                initialValues={{
                  first_name: "",
                  last_name: "",
                  full_name: "",
                  email: "",
                  phone: "",
                  address_line1: "",
                  address_line2: "",
                  city: "",
                  state: "",
                  postal_code: "",
                  country: "",
                  lead_score: undefined as number | undefined,
                  lead_quality: "",
                  best_time_to_call: "",
                  lead_source_id: "",
                  debt_consolidation_status_id: "",
                }}
                validationSchema={LeadSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  const value: CreateLead = {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone || undefined,
                    address_line1: values.address_line1 || undefined,
                    address_line2: values.address_line2 || undefined,
                    city: values.city || undefined,
                    state: values.state || undefined,
                    postal_code: values.postal_code || undefined,
                    country: values.country || undefined,
                    lead_score: values.lead_score ?? undefined,
                    lead_quality: values.lead_quality || undefined,
                    best_time_to_call: values.best_time_to_call || undefined,
                    lead_source_id: values.lead_source_id || undefined,
                    debt_consolidation_status_id:
                      values.debt_consolidation_status_id || undefined,
                    id: "",
                  };

                  handleCreateLead(value);
                  setSubmitting(false);
                  resetForm(); // ✅ clears after submit
                }}
              >
                {({ handleSubmit, isSubmitting }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="w-full">
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* First Name */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            First Name
                          </p>
                          <Field
                            type="text"
                            name="first_name"
                            placeholder="Alexandre"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="first_name"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Last Name
                          </p>
                          <Field
                            type="text"
                            name="last_name"
                            placeholder="Dumas"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="last_name"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Full Name */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Full Name
                          </p>
                          <Field
                            type="text"
                            name="full_name"
                            placeholder="Alexandre Dumas"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="full_name"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Email */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Email
                          </p>
                          <Field
                            type="email"
                            name="email"
                            placeholder="alexandre@example.com"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Phone */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Phone
                          </p>
                          <Field
                            type="text"
                            name="phone"
                            placeholder="+91 9XXXXXXXXX"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Address Line 1 */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            Address Line 1
                          </p>
                          <Field
                            type="text"
                            name="address_line1"
                            placeholder="Street, House no."
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="address_line1"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Address Line 2 */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Address Line 2
                          </p>
                          <Field
                            type="text"
                            name="address_line2"
                            placeholder="Apartment, Suite, etc."
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="address_line2"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* City */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            City
                          </p>
                          <Field
                            type="text"
                            name="city"
                            placeholder="Mumbai"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="city"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* State */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            State
                          </p>
                          <Field
                            type="text"
                            name="state"
                            placeholder="Maharashtra"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="state"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Postal Code */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Postal Code
                          </p>
                          <Field
                            type="text"
                            name="postal_code"
                            placeholder="400071"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="postal_code"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Country */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Country
                          </p>
                          <Field
                            type="text"
                            name="country"
                            placeholder="India"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="country"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Lead Score */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Lead Score
                          </p>
                          <Field
                            type="number"
                            name="lead_score"
                            placeholder="e.g., 75"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="lead_score"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Lead Quality */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Lead Quality
                          </p>
                          <Field
                            type="text"
                            name="lead_quality"
                            placeholder="Hot / Warm / Cold"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="lead_quality"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Best Time to Call */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            Best Time to Call
                          </p>
                          <Field
                            type="text"
                            name="best_time_to_call"
                            placeholder="e.g., 3–5 PM"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="best_time_to_call"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Lead Source Id */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            Lead Source Id
                          </p>
                          <Field
                            type="text"
                            name="lead_source_id"
                            placeholder="uuid-or-text"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="lead_source_id"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        {/* Debt Consolidation Status Id */}
                        <div className="w-full">
                          <p className="text-secondBlack  text-base leading-6 mb-2">
                            Debt Consolidation Status Id
                          </p>
                          <Field
                            type="text"
                            name="debt_consolidation_status_id"
                            placeholder="optional"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="debt_consolidation_status_id"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* END FORM */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                    >
                      Create Leads
                    </button>
                  </form>
                )}
              </Formik>
            </div>
          )}
          {isBulkLeads && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Bulk Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}
              <form onSubmit={handleUploadFile}>
                <div className="w-full">
                  {/* File Upload Input */}
                  <div className="w-full mb-4">
                    <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                      Upload Excel File
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      name="file"
                      onChange={(e) =>
                        setExcelFile(e.target.files?.[0] ?? null)
                      }
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                    />
                  </div>
                </div>

                {/* END FORM */}
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                >
                  Upload File
                </button>
              </form>
            </div>
          )}
          {isFilter && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Filter Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <div className=" w-full">
                  <div className=" w-full flex gap-4 mb-4">
                    <div className=" w-full">
                      <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                        First Name
                      </p>
                      <input
                        type="text"
                        value={filterData.name}
                        name="name"
                        onChange={handleChange}
                        placeholder="Alexandre"
                        className=" hover:shadow-hoverInputShadow focus-border-primary w-full  border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                    </div>
                  </div>

                  <div className=" w-full flex flex-col md:flex-row gap-4 mb-4">
                    <div className=" w-full">
                      <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                        Phone
                      </p>
                      <input
                        type="number"
                        value={filterData.mobilephonenumber}
                        onChange={handleChange}
                        name="mobilephonenumber"
                        placeholder="1 (800) 667-6389"
                        className=" hover:shadow-hoverInputShadow focus-border-primary w-full  border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4"
                      />
                    </div>
                    <div className=" w-full">
                      <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                        Birth Date
                      </p>
                      <input
                        type="date"
                        value={filterData.birthdate}
                        onChange={handleChange}
                        disabled
                        name="birthdate"
                        placeholder=""
                        className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 cursor-not-allowed bg-[#F5F5F5] text-[#A0A0A0] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* END FORM */}

                <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center ">
                  <div
                    onClick={hadleClear}
                    className=" py-[13px] px-[26px] bg-primary-700 rounded-[4px] text-base font-medium leading-6  cursor-pointer w-full md:w-[49%] text-center text-white hover:bg-primary-500 hover:text-white "
                  >
                    Clear Data
                  </div>
                  <button
                    type="submit"
                    className=" py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full md:w-[49%] text-center hover:bg-primary-700 hover:text-white "
                  >
                    Filter Now
                  </button>
                </div>
              </form>
            </div>
          )}
          {isEditLead && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Edit Leads
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <div className=" w-full">
                  <div className=" w-full flex gap-4 mb-4">
                    <div className=" w-full">
                      <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                        First Name
                      </p>
                      <input
                        type="text"
                        value={filterData.name}
                        name="name"
                        onChange={handleChange}
                        placeholder="Alexandre"
                        className=" hover:shadow-hoverInputShadow focus-border-primary w-full  border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                    </div>
                  </div>

                  <div className=" w-full flex flex-col md:flex-row gap-4 mb-4">
                    <div className=" w-full">
                      <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                        Phone
                      </p>
                      <input
                        type="number"
                        value={filterData.mobilephonenumber}
                        onChange={handleChange}
                        name="mobilephonenumber"
                        placeholder="1 (800) 667-6389"
                        className=" hover:shadow-hoverInputShadow focus-border-primary w-full  border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4"
                      />
                    </div>
                    <div className=" w-full">
                      <p className=" text-secondBlack font-medium text-base leading-6 mb-2">
                        Birth Date
                      </p>
                      <input
                        type="date"
                        value={filterData.birthdate}
                        onChange={handleChange}
                        disabled
                        name="birthdate"
                        placeholder=""
                        className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 cursor-not-allowed bg-[#F5F5F5] text-[#A0A0A0] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* END FORM */}

                <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center ">
                  <div
                    onClick={hadleClear}
                    className=" py-[13px] px-[26px] bg-primary-700 rounded-[4px] text-base font-medium leading-6  cursor-pointer w-full md:w-[49%] text-center text-white hover:bg-primary-500 hover:text-white "
                  >
                    Clear Data
                  </div>
                  <button
                    type="submit"
                    className=" py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full md:w-[49%] text-center hover:bg-primary-700 hover:text-white "
                  >
                    Filter Now
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/sideDesign.svg"
            alt="side desgin"
            width={100}
            height={100}
            className=" w-full h-full"
          />
        </div>
      </>

      {/* FITLER FLYOUT END */}
    </>
  );
}

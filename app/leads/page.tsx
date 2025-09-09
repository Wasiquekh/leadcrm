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

const axiosProvider = new AxiosProvider();

interface FilterData {
  name: string;
  mobilephonenumber?: string;
  birthdate?: string;
}

// types/lead.ts
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


export default function Home() {
 // const isChecking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const [data, setData] = useState<Lead[]>([]);
  console.log("DATAAAAA", data);
  const [page, setPage] = useState<number>(1);
  const [filterPage, setFilterPage] = useState<number>(1);
  const [limit] = useState<number>(10);
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
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(
    null
  );
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<Lead | null>(null);
  //console.log("SELECTED DATA", selectedData);
  const storage = new StorageManager();
  const accessToken = storage.getAccessToken();
 
  //console.log("Get all user Data", data);
  const router = useRouter();

  const handleClick = async (customer: Lead) => {
    // console.log('Object customer data',customer.id)
    router.push(`/leadsdetails?id=${customer.id}`);
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
  const userFilterData = async (data: any, page: number) => {
    setIsFilter(true);
    setIsLoading(true);
    try {
      const response = await axiosProvider.post(
        `/filter?page=${page}&limit=${limit}`,
        data
      );
      const result = response.data.data;
      // console.log("VVVVVVVVVVVVVVVVV", result);
      setData(result.customers);
      setTotalPagesFilter(result.totalPages);
    } catch (error: any) {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleFlyout = () => setFlyoutOpen(!isFlyoutOpen);
  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);

  const fetchData = async () => {
    setIsLoading(true);
   // setIsFilter(false);
    try {
      const response = await axiosProvider.get(
        `/alleads?page=${page}&pageSize=${limit}`
      );
     // console.log("KKKKKKKKKKKKKKKKK", response.data.data.data);
      //setTotalPages(response.data.data.pagination.totalPages);
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
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const hadleClear = () => {
    setFilterData({ ...filterData, name: "", mobilephonenumber: "" });
  };
  const handlePageChangeFilter = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPagesFilter) {
      setFilterPage(newPage);
      userFilterData(newPage, filterPage);
    }
  };

  const test = () => {
    router.push("/leadsdetails");
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
                  className=" flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                  onClick={toggleFilterFlyout}
                >
                  <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Filter
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
                          Name - Birth Date
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
                          Birth Country
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
                          Gender
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
                          Country of Residence
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <MdOutlineCall className="w-5 h-5 sm:w-6 sm:h-6" />
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
                        <MdOutlineCall className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-secondBlack text-lg sm:text-base">
                          Status
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
{(!data || data.length === 0 || isError) ? (
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
                  <strong>Name:</strong> <span style="text-transform: capitalize;">${item?.full_name ?? "-"}</span><br/>
                  <strong>Email:</strong> ${item?.email ?? "-"}<br/>
                  <strong>Phone:</strong> ${item?.phone ?? "-"}<br/>
                  <strong>Owner:</strong> ${item?.owner_name ?? "-"}<br/>
                  <strong>Account Manager:</strong> ${item?.account_manager ?? "-"}
                </div>`}
              className="text-black leading-normal relative top-[5.3px] capitalize"
            />
            <Tooltip id="my-tooltip" place="right" float className="box" />
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
          {item?.owner_name ?? "-"}
        </span>
      </td>

      {/* Account Manager */}
      <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
        <span className="text-[#232323] text-sm sm:text-base capitalize">
          {item?.account_manager ?? "-"}
        </span>
      </td>

      {/* Action */}
      <td className="px-3 py-2 border border-tableBorder md:table-cell">
        <button
         // onClick={() => test(item)}
          className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-[4px]"
        >
          <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
          <span className="text-xs sm:text-sm text-white hover:text-white">
            View Details
          </span>
        </button>
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
                onClick={() => handlePageChangeFilter(filterPage - 1)}
                disabled={filterPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#232323] text-sm">
                Page {filterPage} of {totalPagesFilter}
              </span>
              <button
                onClick={() => handlePageChangeFilter(filterPage + 1)}
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

      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <>
          <div
            className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
            onClick={() => {
              setFlyoutFilterOpen(!isFlyoutFilterOpen);
            }}
          ></div>
          <div
            className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}
          >
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  User Details
                </p>
                <IoCloseOutline
                  onClick={toggleFilterFlyout}
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
      )}
      {/* FITLER FLYOUT END */}
    </>
  );
}

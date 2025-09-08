"use client";
import Image from "next/image";
import Tabs from "../../component/Tabs";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { PiArrowCircleUp } from "react-icons/pi";
import LeftSideBar from "../../component/LeftSideBar";
import AxiosProvider from "../../../provider/AxiosProvider";
import { useEffect, useState } from "react";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import DesktopHeader from "../../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { SiGoogleadsense } from "react-icons/si";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import StorageManager from "../../../provider/StorageManager";
import { toast } from "react-toastify";
import { MdRemoveRedEye } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import Swal from "sweetalert2";
import UserActivityLogger from "../../../provider/UserActivityLogger";
import { useAuthRedirect } from "../../component/hooks/useAuthRedirect";
const activityLogger = new UserActivityLogger();

const axiosProvider = new AxiosProvider();

interface TotalLeads {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  primary_address_street: string;
  primary_address_city: string;
  primary_address_country: string;
  primary_address_postalcode: string;
  phone_mobile: string;
  description: string;
  assigned_user_id: string;
  assigned_user_name: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  website: string;
}
interface FormValues {
  user_id: string;
  first_name: string;
  last_name: string;
  primary_address_street: string;
  primary_address_city: string;
  primary_address_country: string;
  primary_address_postalcode: string;
  phone_mobile: string;
  description: string;
}
interface EditFormValues {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  primary_address_street: string;
  primary_address_city: string;
  primary_address_country: string;
  primary_address_postalcode: string;
  phone_mobile: string;
  description: string;
  website: string;
}
export default function Home() {
  const isChecking = useAuthRedirect();
  const [data, setData] = useState<TotalLeads[]>([]);
  //console.log("total accounts data 000000000000 ", data);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [openForAdd, setOpenForAdd] = useState<boolean>(false);
  const [openForEdit, setOpenForEdit] = useState<boolean>(false);
  const [editAccount, setEditAccount] = useState<any | null>(null);
  //console.log("FFFFFFFFFFFFFFF", editAccount);

  const toggleFilterFlyout = () => {
    setFlyoutOpen(!isFlyoutOpen);
    setOpenForAdd(true);
    setOpenForEdit(false);
  };
  const openEditFlyout = (item: any) => {
    setFlyoutOpen(!isFlyoutOpen);
    setOpenForAdd(false);
    setOpenForEdit(true);
    setEditAccount(item);
  };

  const fetchData = async () => {
    setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await axiosProvider.get(
        `/gettotalleads?page=${page}&limit=${limit}`
      );
      //console.log("total accounts data", response.data.data.accounts);
      setTotalPages(response.data.data.totalPages);
      const result = response.data.data.leads;
      //console.log("total leads", result);
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
  const storage = new StorageManager();
  const user_id = storage.getUserId();

  const initialValues: FormValues = {
    user_id,
    first_name: "",
    last_name: "",
    primary_address_street: "",
    primary_address_city: "",
    primary_address_country: "",
    primary_address_postalcode: "",
    phone_mobile: "",
    description: "",
  };
  const EditInitialValues: EditFormValues = {
    id: editAccount?.id || "",
    user_id,
    first_name: editAccount?.first_name || "",
    last_name: editAccount?.last_name || "",
    primary_address_street: editAccount?.primary_address_street || "",
    primary_address_city: editAccount?.primary_address_city || "",
    primary_address_country: editAccount?.primary_address_country || "",
    primary_address_postalcode: editAccount?.primary_address_postalcode || "",
    phone_mobile: editAccount?.phone_mobile || "",
    description: editAccount?.description || "",
    website: "",
  };
  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    primary_address_street: Yup.string().required("Street address is required"),
    primary_address_city: Yup.string().required("City is required"),
    primary_address_country: Yup.string().required("Country is required"),
    primary_address_postalcode: Yup.string().required(
      "Postal code is required"
    ),
    phone_mobile: Yup.string().required("Mobile number is required"),
    description: Yup.string(),
  });
  const handleSubmit = async (values: FormValues) => {
    try {
      const response = await axiosProvider.post("/createlead", values);
      console.log("Product created:", response.data);
      toast.success("Product added");
      setFlyoutOpen(false);
      fetchData();
      const activity = "Created CRM Lead";
      const moduleName = "Lead";
      const type = "Create";
      await activityLogger.crmAdd(
        response.data.data.id,
        activity,
        moduleName,
        type
      );
    } catch (error: any) {
      console.error("Failed to create product:", error);
    }
  };
  const handleEditSubmit = async (values: FormValues) => {
    try {
      const response = await axiosProvider.post("/updatelead", values);
      //console.log("Product created:", response.data);
      toast.success("Lead Updated");
      setFlyoutOpen(false);
      fetchData();
      const activity = "Updated CRM Lead";
      const moduleName = "Lead";
      const type = "Update";
      await activityLogger.crmUpdate(
        editAccount?.id || "",
        activity,
        moduleName,
        type
      );
    } catch (error: any) {
      console.error("Failed to create product:", error);
    }
  };
  // DELETE DATA
  const deleteUserData = async (item: TotalLeads) => {
    const userID = item.id;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#FFCCD0",
      cancelButtonColor: "#A3000E",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosProvider.post("/deletelead", { id: userID });
          toast.success("Successfully Deleted");
          fetchData();
          const activity = "Deleted CRM Lead";
          const moduleName = "Lead";
          const type = "Delete";
          await activityLogger.crmDelete(userID, activity, moduleName, type);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };
  if (isChecking) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center bg-white">
        <Image
          src="/images/orizonIcon.svg"
          alt="Loading"
          width={150}
          height={150}
          className="animate-pulse rounded"
        />
      </div>
    );
  }
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
    <div className=" flex justify-end  min-h-screen">
      {/* Left sidebar */}
      <LeftSideBar />
      {/* Main content right section */}
      <div className="w-full md:w-[83%] bg-[#F5F7FA] min-h-[500px] rounded p-4 mt-0 relative">
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/sideDesign.svg"
            alt="side desgin"
            width={100}
            height={100}
            className=" w-full h-full"
          />
        </div>
        {/* Right section top row */}
        {/* <div className="w-full flex justify-end items-center  p-4"> */}
        <DesktopHeader />
        {/* </div> */}
        <div className="w-full bg-[#F5F7FA] flex justify-center p-0 md:p-0">
          <div className="rounded-3xl shadow-lastTransaction bg-white px-1 py-6 md:p-6 relative min-h-[600px] z-10 w-full">
            <div className="relative overflow-x-auto  sm:rounded-lg">
              {/* Search and filter table row */}
              <div className=" flex justify-end items-center mb-6  w-full mx-auto">
                <div className=" flex justify-center items-center gap-4">
                  <div
                    className=" flex items-center gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 group hover:bg-primary-600"
                    onClick={toggleFilterFlyout}
                  >
                    <SiGoogleadsense className=" w-4 h-4 text-white group-hover:text-white" />
                    <p className=" text-white  text-base font-medium group-hover:text-white">
                      Add Leads
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* ----------------Table----------------------- */}
            <div className="relative overflow-x-auto  sm:rounded-[12px] custom-scrollbar">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th
                      scope="col"
                      className="p-2 py-0 border border-tableBorder"
                    >
                      <div className="flex items-center gap-2 p-3">
                        <div className="font-medium text-firstBlack text-base leading-normal whitespace-nowrap">
                          First Name
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-firstBlack text-base leading-normal whitespace-nowrap">
                          Last Name
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-firstBlack text-base leading-normal whitespace-nowrap">
                          Full Name
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-firstBlack text-base leading-normal whitespace-nowrap">
                          Phone mobile
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-firstBlack text-base leading-normal whitespace-nowrap">
                          Description
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-0 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-firstBlack text-base leading-normal whitespace-nowrap">
                          Action
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isError ? (
                    <tr>
                      <td colSpan={6} className="text-center text-xl mt-5">
                        <div className="mt-5">Data not found</div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr
                        className="border border-tableBorder bg-white hover:bg-primary-100"
                        key={index}
                      >
                        <td className="p-4  flex items-center gap-2">
                          <div className="md:hidden">
                            <FaEllipsisVertical
                              data-tooltip-id="my-tooltip"
                              data-tooltip-html={`<div>
                                  <strong>Description:</strong> <span style="text-transform: capitalize;">${item.first_name}</span><br/>
                                  <strong>Transaction id:</strong> ${item.last_name}<br/>
                                   <strong>Type:</strong> ${item.full_name}<br/>
                                    <strong>Card:</strong> ${item.primary_address_street}<br/>
                                   <strong>Date:</strong> ${item.primary_address_city}<br/>
                                    <strong>Date:</strong> ${item.primary_address_country}<br/>
                                     <strong>Date:</strong> ${item.primary_address_postalcode}<br/>
                                      <strong>Date:</strong> ${item.phone_mobile}<br/>
                                       <strong>Date:</strong> ${item.description}<br/>
                                        <strong>Date:</strong> ${item.assigned_user_id}<br/>
                                         <strong>Date:</strong> ${item.assigned_user_name}<br/>
                                    
                                </div>`}
                              className="text-black leading-normal capitalize"
                            />
                            <Tooltip id="my-tooltip" place="right" float />
                          </div>
                          <div>
                            <p className="text-[#232323] text-base leading-normal">
                              {item.first_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-0 border border-tableBorder hidden md:table-cell">
                          <p className="text-[#232323] text-base leading-normal">
                            {item.last_name}
                          </p>
                        </td>
                        <td className="px-2 py-0 border border-tableBorder hidden md:table-cell whitespace-nowrap">
                          <p className="text-[#232323] text-base leading-normal">
                            {item.full_name}
                          </p>
                        </td>
                        <td className="px-2 py-0 border border-tableBorder hidden md:table-cell">
                          <div className="flex gap-1.5">
                            <p className="text-[#232323] text-base leading-normal">
                              {item.phone_mobile}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-0 border border-tableBorder hidden md:table-cell">
                          <div className="flex gap-1.5">
                            <p className="text-[#232323] text-base leading-normal">
                              {item.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-1 border border-tableBorder">
                          <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                            {/* View Button */}
                            <button
                              onClick={() => openEditFlyout(item)}
                              className="py-[4px] px-3 bg-primary-600 hover:bg-primary-800 active:bg-primary-900 group flex gap-1 items-center rounded-xl text-xs md:text-sm"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 group-hover:text-white" />
                              <p className="text-white hidden md:block group-hover:text-white">
                                View
                              </p>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => deleteUserData(item)}
                              className="py-[4px] px-3 bg-black flex gap-1 items-center rounded-full text-xs md:text-sm group hover:bg-primary-600"
                            >
                              <RiDeleteBin6Line className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block">
                                Delete
                              </p>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* ----------------End table--------------------------- */}
          </div>
        </div>
        {/* PAGINATION */}
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
        {/* END PAGINATION */}
        {/* FITLER FLYOUT */}
        {isFlyoutOpen && (
          <>
            {/* DARK BG SCREEN */}
            <div
              className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
              onClick={() => setFlyoutOpen(!isFlyoutOpen)}
            ></div>
            {/* NOW MY FLYOUT */}
            {openForAdd && (
              <div
                className={`filterflyout ${isFlyoutOpen ? "filteropen" : ""}`}
              >
                <div className="w-full min-h-auto">
                  {/* Header */}
                  <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
                    <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                      Add Leads
                    </p>
                    <IoCloseOutline
                      onClick={toggleFilterFlyout}
                      className="h-7 sm:h-8 w-7 sm:w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer"
                    />
                  </div>
                  <div className="w-full border-b border-[#E7E7E7] mb-4 sm:mb-6"></div>
                  <div className="w-full p-0">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      <Form>
                        <Field type="hidden" name="user_id" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              First Name
                            </p>
                            <Field
                              type="text"
                              name="first_name"
                              placeholder="Enter first name"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="first_name"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Last Name */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Last Name
                            </p>
                            <Field
                              type="text"
                              name="last_name"
                              placeholder="Enter last name"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="last_name"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Street */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Street Address
                            </p>
                            <Field
                              type="text"
                              name="primary_address_street"
                              placeholder="Enter street address"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_street"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* City */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              City
                            </p>
                            <Field
                              type="text"
                              name="primary_address_city"
                              placeholder="Enter city"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_city"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Country */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Country
                            </p>
                            <Field
                              type="text"
                              name="primary_address_country"
                              placeholder="Enter country"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_country"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Postal Code */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Postal Code
                            </p>
                            <Field
                              type="text"
                              name="primary_address_postalcode"
                              placeholder="Enter postal code"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_postalcode"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Mobile */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Mobile Number
                            </p>
                            <Field
                              type="text"
                              name="phone_mobile"
                              placeholder="Enter mobile number"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="phone_mobile"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Description (Full Width) */}
                          <div className="w-full md:col-span-2 relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Description
                            </p>
                            <Field
                              as="textarea"
                              name="description"
                              rows={3}
                              placeholder="Enter description"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] p-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="description"
                              component="div"
                              className="text-red-500 text-xs absolute top-full mt-1"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                          <button
                            type="submit"
                            className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                          >
                            Submit
                          </button>
                        </div>
                      </Form>
                    </Formik>
                  </div>
                </div>
              </div>
            )}
            {openForEdit && (
              <div
                className={`filterflyout ${isFlyoutOpen ? "filteropen" : ""}`}
              >
                <div className="w-full min-h-auto">
                  {/* Header */}
                  <div className="flex justify-between mb-4 sm:mb-6 md:mb-8">
                    <p className="text-primary-600 text-[22px] sm:text-[24px] md:text-[26px] font-bold leading-8 sm:leading-9">
                      Edit Leads
                    </p>
                    <IoCloseOutline
                      onClick={toggleFilterFlyout}
                      className="h-7 sm:h-8 w-7 sm:w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer"
                    />
                  </div>
                  <div className="w-full border-b border-[#E7E7E7] mb-4 sm:mb-6"></div>
                  <div className="w-full p-0">
                    <Formik
                      initialValues={EditInitialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleEditSubmit}
                    >
                      <Form>
                        <Field type="hidden" name="user_id" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              First Name
                            </p>
                            <Field
                              type="text"
                              name="first_name"
                              placeholder="Enter first name"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="first_name"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Last Name */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Last Name
                            </p>
                            <Field
                              type="text"
                              name="last_name"
                              placeholder="Enter last name"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="last_name"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Street */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Street Address
                            </p>
                            <Field
                              type="text"
                              name="primary_address_street"
                              placeholder="Enter street address"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_street"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* City */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              City
                            </p>
                            <Field
                              type="text"
                              name="primary_address_city"
                              placeholder="Enter city"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_city"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Country */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Country
                            </p>
                            <Field
                              type="text"
                              name="primary_address_country"
                              placeholder="Enter country"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_country"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Postal Code */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Postal Code
                            </p>
                            <Field
                              type="text"
                              name="primary_address_postalcode"
                              placeholder="Enter postal code"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="primary_address_postalcode"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Mobile */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Mobile Number
                            </p>
                            <Field
                              type="text"
                              name="phone_mobile"
                              placeholder="Enter mobile number"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="phone_mobile"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>
                          {/* Website */}
                          <div className="w-full relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Website
                            </p>
                            <Field
                              type="text"
                              name="website"
                              placeholder="Enter Website"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="website"
                              component="div"
                              className="text-red-500 text-xs absolute top-[100%]"
                            />
                          </div>

                          {/* Description (Full Width) */}
                          <div className="w-full md:col-span-2 relative mb-3">
                            <p className="text-[#232323] text-base leading-normal mb-2">
                              Description
                            </p>
                            <Field
                              as="textarea"
                              name="description"
                              rows={3}
                              placeholder="Enter description"
                              className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2]
                  rounded-[4px] text-[15px] placeholder-[#718EBF] p-4 mb-2 text-firstBlack"
                            />
                            <ErrorMessage
                              name="description"
                              component="div"
                              className="text-red-500 text-xs absolute top-full mt-1"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                          <button
                            type="submit"
                            className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                          >
                            Submit
                          </button>
                        </div>
                      </Form>
                    </Formik>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import Image from "next/image";
import Tabs from "../component/Tabs";
import { CiSettings } from "react-icons/ci";
import {
  IoIosCall,
  IoIosMail,
  IoIosNotificationsOutline,
  IoMdClose,
} from "react-icons/io";
import { SetStateAction, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaNotesMedical, FaRegEye, FaStar, FaTasks } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import LeftSideBar from "../component/LeftSideBar";
import UserActivityLogger from "../../provider/UserActivityLogger";
import { MdLocationPin, MdVerified } from "react-icons/md";
import { TbActivity, TbTopologyStarRing2 } from "react-icons/tb";
import { PiMapPinLight, PiNotepadLight } from "react-icons/pi";
import { HiChevronDoubleLeft } from "react-icons/hi";
import { HiChevronDoubleRight } from "react-icons/hi";
import AxiosProvider from "../../provider/AxiosProvider";
//import CustomerViewDetails from "../component/CustomerViewDetails";
import ReactPlayer from "react-player";
import DesktopHeader from "../component/DesktopHeader";
import { Tooltip } from "react-tooltip";
import { FaEllipsisVertical } from "react-icons/fa6";
import { AppContext } from "../AppContext";
import { GrPowerReset } from "react-icons/gr";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StorageManager from "../../provider/StorageManager";
import OtpInput from "react-otp-input";
import { FiFilter } from "react-icons/fi";
import { LuSquareActivity } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";
import AppCalendar from "../component/AppCalendar";
import { useSearchParams } from "next/navigation";
import { AiOutlineSearch } from "react-icons/ai";

interface Lead {
  id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  full_name?: string; // optional because API may or may not return it
  email: string;
  phone: string;
  whatsapp_number?: string | null;

  address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };

  agent: {
    id: string | null;
    name: string | null;
  };

  best_time_to_call?: string | null;
  consolidated_credit_status?: string | null;
  debt_consolidation_status?: string | null;

  lead_quality: string;
  lead_score: number;
  lead_age_days: number;
  lead_age_label: string;

  lead_source?: string | null;
  owner_name?: string | null;

  created_at: string; // ISO string
  updated_at: string; // ISO string
}
interface LeadActivity {
  id: string;
  disposition: string;
  disposition_id: string;
  conversation: string;
  occurred_at: string; // ISO date string
  agent_name: string;
  agent_id: string;
}
interface Disposition {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string | null; // can be null
}
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
interface CreateLeadsActivityForm {
  conversation: string;
  createdAt: string; // optional
  disposition: string; // id
  agent: string; // optional id
}
export interface LeadActivityData {
  id: string;
  disposition: string;
  disposition_id: string;
  conversation: string;
  occurred_at: string; // ISO date string
  created_at: string; // ISO date string
  agent_name: string;
  agent_id: string;
}
export default function Home() {
  const [isFlyoutFilterOpen, setFlyoutFilterOpen] = useState<boolean>(false);
  const isChecking = useAuthRedirect();
  const storage = new StorageManager();

  const [isCustomerViewDetailOpen, setIsCustomerViewDetailOpen] =
    useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalOpenVideo, setIsModalOpenVideo] = useState<boolean>(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [hitApi, setHitApi] = useState<boolean>(true);
  //console.log('BBBBBBBBBBBBB',isModalOpenVideo)
  const [modalImage, setModalImage] = useState<string>("");
  //const [isLoading, setIsLoading] = useState<boolean>(false);

  const [imageKey, setImageKey] = useState(Date.now());
  const [editInfo, setEditInfo] = useState<boolean>(true);
  const [secretKey, setSecretKey] = useState<string | null>(
    storage.getDecryptedUserSecretKey()
  );
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id") ?? undefined;
  const [totp, setTotp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isTotpPopupOpen, setIsTotpPopupOpen] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [leadActivityData, setLeadActivityData] = useState<LeadActivity>();
  const [disposition, setDisposition] = useState<Disposition[]>([]);
  const [agent, setAgent] = useState<Agent[]>([]);
  const [activity, setActivity] = useState<boolean>(false);
  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [fetchLeadActivityData, setFetchLeadaActivityData] = useState<
    LeadActivityData[]
  >([]);

  // console.log("lead activity",fetchLeadActivityData)
  //  FOR CREATE ACTIVITY LEAD
  // ✅ Validation
  const CreateLeadsActivitySchema = Yup.object({
    conversation: Yup.string()
      .trim()
      .max(500, "Max 500 characters")
      .required("Conversation is required"),
    createdAt: Yup.string().nullable(), // optional
    disposition_id: Yup.string().required("Disposition is required"),
    agent: Yup.string().nullable(), // optional
  });
  // ✅ Initial Values
  const INITIAL_VALUES = {
    lead_id: leadId,
    conversation: "",
    occurred_at: "",
    disposition_id: "",
    agent_id: "",
  };
  // ✅ Submit handler
  const CreateLeadsActivity = async (n: typeof INITIAL_VALUES) => {
    // console.log("Submitted values:", n);

    try {
      await AxiosProvider.post("/leads/activities/create", n);
      toast.success("Lead activity is created");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead activity is created");
    }
    // 👉 Replace with your API call
    // await AxiosProvider.post("/leads/activity/create", n);
  };
  //  END CREATE ACTIVITY LEAD
  const fetchData = async () => {
    if (!leadId) return;
    try {
      const res = await AxiosProvider.post("/leads/get", {
        lead_id: leadId,
      });

      //console.log("lead data", res.data.data);
      setData(res.data.data); // <-- if you want to store in state
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leadId]);

  const fetchLeadActivity = async () => {
    if (!leadId) return;
    try {
      const res = await AxiosProvider.post(
        `/leads/activities/list?page=${page}&pageSize=${pageSize}`,
        {
          lead_id: leadId,
        }
      );

      // console.log("Lead Activity", res.data.data.activities);
      console.log(
        "Lead Activity pagination",
        res.data.data.pagination.totalPages
      );
      setFetchLeadaActivityData(res.data.data.activities);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };
  useEffect(() => {
    fetchLeadActivity();
  }, [page, leadId]);

  // FETCH DISPOSITION
  const fetchDisposition = async () => {
    try {
      const res = await AxiosProvider.get("/leads/dispositions/all");
      setDisposition(res.data.data.data);

      //console.log("fetch disposition", res.data.data.data);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };
  useEffect(() => {
    fetchDisposition();
  }, []);
  // FETCH AGENT
  const fetchAgent = async () => {
    try {
      const res = await AxiosProvider.get("/allagents");
      //setDisposition(res.data.data.data);

      //console.log("fetch agent", res.data.data.data);
      setAgent(res.data.data.data);
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };
  useEffect(() => {
    fetchAgent();
  }, []);
  const openActivityFlyout = () => {
    setFlyoutFilterOpen(true);
    setActivity(true);
  };
  const closeFlyOut = () => {
    setActivity(false);
    setFlyoutFilterOpen(false);
  };
  const handleChangepagination = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const tabs = [
    {
      label: "Activity History",
      content: (
        <>
          {/* Tab content 3 */}
          <div className="container mx-auto p-4">
            <h2 className="text-base  font-semibold mb-4 text-secondBlack">
              Today
            </h2>
            {fetchLeadActivityData && fetchLeadActivityData.length > 0 ? (
              fetchLeadActivityData.map((activity) => (
                <div
                  key={activity.id}
                  className="w-full flex gap-8 hover:bg-primary-100 py-2 px-2 text-base rounded"
                >
                  {/* Left side date & time from occurred_at */}
                  <div className="flex gap-2">
                    <div>
                      <TbActivity className=" bg-primary-500 text-white p-1 text-2xl rounded-full " />
                    </div>
                    <div>
                      <p>
                        {activity.occurred_at
                          ? new Date(activity.occurred_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                timeZone: "Asia/Kolkata",
                              }
                            )
                          : "--"}
                      </p>
                      <p>
                        {activity.occurred_at
                          ? new Date(activity.occurred_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Kolkata",
                              }
                            )
                          : "--"}
                      </p>
                    </div>
                  </div>

                  {/* Right side details */}
                  <div>
                    <div>
                      <p>
                        <span className="text-primary-600">
                          {activity.disposition}:
                        </span>{" "}
                        {activity.conversation}
                      </p>
                      <p>
                        Added by {activity.agent_name} on{" "}
                        {activity.created_at
                          ? new Date(activity.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                timeZone: "Asia/Kolkata",
                              }
                            )
                          : "--"}{" "}
                        {activity.created_at
                          ? new Date(activity.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Kolkata",
                              }
                            )
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No data found</p>
            )}

            {/* PAGINATION */}
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleChangepagination(page - 1)}
                disabled={page === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#717171] text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handleChangepagination(page + 1)}
                disabled={page === totalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
            {/* PAGINATION */}
          </div>

          {/* End Tab content 3 */}
        </>
      ),
      // End Tab content 2
    },
    {
      label: "Task",
      content: (
        <>
          {/* Tab content 3 */}
          <AppCalendar />;{/* End Tab content 3 */}
        </>
      ),
    },
    {
      label: "Document",
      content: (
        <>
          {/* Tab content 4 */}
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <thead className="text-xs text-[#999999] bg-white">
              <tr className="border border-tableBorder">
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Document
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Type
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Uploaded On
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Status
                </th>
                <th className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack">
                  Owner
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Company Profile.pdf
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PDF
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-06
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                    Verified
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Naafis
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  GST Certificate.pdf
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PDF
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-07
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700">
                    Under Review
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Aamir
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PAN Card.png
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Image
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-05
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Sarim
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Proposal_v2.docx
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  DOCX
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-04
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-rose-100 text-rose-700">
                    Rejected
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Danish
                </td>
              </tr>

              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PO_#2025-0911.pdf
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  PDF
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  2025-09-08
                </td>
                <td className="px-3 py-2 border border-tableBorder">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    In Review
                  </span>
                </td>
                <td className="px-3 py-2 border border-tableBorder text-[#232323]">
                  Ismail
                </td>
              </tr>
            </tbody>
          </table>

          {/* End Tab content 4 */}
        </>
      ),
    },
  ];
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
  const handleSubmit = async () => {};
  return (
    <>
      <div className=" flex justify-end  min-h-screen">
        {/* Main content right section */}
        <div className="ml-[97px]  w-full md:w-[90%] m-auto bg-[#fff] min-h-[500px]  rounded p-4 mt-0 ">
          <LeftSideBar />
          {/* left section top row */}
          <DesktopHeader />
          {/* right section top row */}
          {/* </div> */}
          <div className=" w-full   bg-[#F5F7FA] flex justify-center relative">
            <div className="w-full md:w-full min-h-[600px] bg-white !rounded-3xl  shadow-lastTransaction">
              <div className="py-4 px-2 md:p-6">
                {/* Buttons */}

                <div className="flex justify-end items-center mb-6 w-full gap-2">
                  <div className="flex justify-center items-center gap-4 ">
                    <div
                      className="flex gap-2 py-3 px-0 justify-center rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group min-w-32"
                      onClick={() => openActivityFlyout()}
                    >
                      <LuSquareActivity className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Activity
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group min-w-32"
                      onClick={toggleFilterFlyout}
                    >
                      <FaNotesMedical className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Task
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group min-w-32"
                      onClick={toggleFilterFlyout}
                    >
                      <FaTasks className="w-5 h-5 text-white group-hover:text-white" />
                      <p className="text-white text-base font-medium group-hover:text-white">
                        Document
                      </p>
                    </div>
                  </div>
                </div>
                <div className=" grid grid-cols-[30%_70%]  gap-4">
                  <div className="  w-full">
                    {/* LEAD */}
                    <div className="w-full rounded bg-primary-600 px-4 py-6 mb-6">
                      <div className=" flex text-white  gap-2 mb-5">
                        <FaStar />
                        <div>
                          <p className=" text-base font-medium leading-none">
                            {data?.full_name || "-"}
                          </p>
                          {data?.address.country || "-"}
                        </div>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <IoIosMail />
                        <p className=" text-sm font-medium leading-none">
                          {data?.email || "-"}
                        </p>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <IoIosCall />
                        <p className=" text-sm font-medium leading-none">
                          {data?.phone || "-"}
                        </p>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <MdLocationPin />
                        <p className=" text-sm font-medium leading-none">
                          {data?.address.line1 || "-"}{" "}
                          {data?.address.line2 || "-"}{" "}
                          {data?.address.city || "-"}{" "}
                          {data?.address.state || "-"}
                        </p>
                      </div>
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <AiOutlineSearch />
                        <p className=" text-sm font-medium leading-none">
                          {data?.address.postal_code || "-"}
                        </p>
                      </div>
                    </div>
                    {/* LEAD PROPERTIES */}
                    <div className="w-full">
                      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
                        <thead className="text-xs text-[#999999] bg-white">
                          <tr className="border border-tableBorder">
                            <th
                              scope="col"
                              className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack text-base"
                              colSpan={2}
                            >
                              Lead Properties
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Number
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.lead_number || "-"}
                            </td>
                          </tr>

                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Owner Name
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.owner_name || "-"}
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Best time to call
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.best_time_to_call || "-"}
                            </td>
                          </tr>

                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Source
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.lead_source || "-"}
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Debt Consolidation Status
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.debt_consolidation_status || "-"}
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              Lead Score
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.lead_score || "-"}
                            </td>
                          </tr>
                          <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                            <td className="text-sm text-[#78829D] py-4 px-4">
                              WHATSAPP
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.whatsapp_number || "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className=" md:flex relative w-full">
                    <Tabs tabs={tabs} />
                    <GrPowerReset
                      onClick={() => setHitApi(!hitApi)}
                      className=" absolute -top-5 -right-1 md:top-2 md:right-1 cursor-pointer text-lg md:text-2xl text-[#4B5675] hover:text-tabHoverColor active:text-tabActiveColor"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <CustomerViewDetails
        isCustomerViewDetailOpen={isCustomerViewDetailOpen}
        setIsEditFlyoutOpen={setIsCustomerViewDetailOpen}
        customer={customer}
        selectedButton={selectedButton}
        setFaceImageFromChild={setFaceImageFromChild}
        setIdEctoFromChild={setIdEctoFromChild}
        setIdVersoFromChild={setIdVersoFromChild}
        setUserSignatureFromChild={setUserSignatureFromChild}
        setUserVideoFromChild={setUserVideoFromChild}
        hitApi={hitApi}
        setHitApi={setHitApi}
      /> */}
      {/* FITLER FLYOUT */}
      {isFlyoutFilterOpen && (
        <div
          className=" min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={() => {
            closeFlyOut();
          }}
        ></div>
      )}

      <div className={`filterflyout ${isFlyoutFilterOpen ? "filteropen" : ""}`}>
        {activity && (
          <div className=" w-full min-h-auto">
            {/* Flyout content here */}
            <div className=" flex justify-between mb-4">
              <p className=" text-primary-600 text-[26px] font-bold leading-9">
                Create Lead Activity
              </p>
              <IoCloseOutline
                onClick={toggleFilterFlyout}
                className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* FORM */}
            <Formik
              initialValues={INITIAL_VALUES}
              validationSchema={CreateLeadsActivitySchema}
              onSubmit={async (values, { setSubmitting }) => {
                const n = values;
                await CreateLeadsActivity(n);
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                isSubmitting,
                isValid,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  {/* GRID: 2 inputs per row */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                    {/* Conversation (required) */}
                    <div className="w-full relative">
                      <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                        Conversation
                      </p>
                      <input
                        type="text"
                        name="conversation"
                        value={values.conversation}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("conversation", true)}
                        placeholder="Enter conversation"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                      {touched.conversation && (errors as any).conversation ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).conversation}
                        </p>
                      ) : null}
                    </div>

                    {/* Occurred At (optional) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Created At
                      </p>
                      <DatePicker
                        selected={
                          values.occurred_at
                            ? new Date(values.occurred_at)
                            : null
                        }
                        onChange={(date: Date | null) =>
                          setFieldValue(
                            "occurred_at",
                            date ? date.toISOString() : ""
                          )
                        }
                        onBlur={() => setFieldTouched("occurred_at", true)}
                        name="occurred_at"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="yyyy-mm-dd"
                        className="hover:shadow-hoverInputShadow focus-border-primary 
              !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
              font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                        popperClassName="custom-datepicker"
                        dayClassName={(date) => {
                          const today = new Date().toDateString();
                          const selectedDate = values.occurred_at
                            ? new Date(values.occurred_at).toDateString()
                            : null;
                          if (today === date.toDateString())
                            return "bg-[#FFF0F1] text-[#A3000E]";
                          if (selectedDate === date.toDateString())
                            return "bg-[#A3000E] text-white";
                          return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                        }}
                      />
                      {touched.occurred_at && (errors as any).occurred_at ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).occurred_at}
                        </p>
                      ) : null}
                    </div>

                    {/* Disposition (required) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Disposition
                      </p>
                      <Select
                        value={
                          (disposition || []).find(
                            (opt: any) => opt.id === values.disposition_id
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "disposition_id",
                            selectedOption ? selectedOption.id : ""
                          )
                        }
                        onBlur={() => setFieldTouched("disposition_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => opt.id}
                        options={disposition}
                        placeholder="Select Disposition"
                        isClearable
                        classNames={{
                          control: ({ isFocused }) =>
                            `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                              isFocused
                                ? "!border-primary-500"
                                : "!border-[#DFEAF2]"
                            }`,
                        }}
                        styles={{
                          menu: (base) => ({
                            ...base,
                            borderRadius: "4px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            backgroundColor: "#fff",
                          }),
                          option: (base, { isFocused, isSelected }) => ({
                            ...base,
                            backgroundColor: isSelected
                              ? "var(--primary-500)"
                              : isFocused
                              ? "var(--primary-100)"
                              : "#fff",
                            color: isSelected ? "#fff" : "#333",
                            cursor: "pointer",
                          }),
                        }}
                      />
                      {touched.disposition_id &&
                      (errors as any).disposition_id ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).disposition_id}
                        </p>
                      ) : null}
                    </div>

                    {/* Agent (optional) */}
                    <div className="w-full">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Agent
                      </p>
                      <Select
                        value={
                          (agent || []).find(
                            (opt: any) => opt.id === values.agent_id
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "agent_id",
                            selectedOption ? selectedOption.id : ""
                          )
                        }
                        onBlur={() => setFieldTouched("agent_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => opt.id}
                        options={agent}
                        placeholder="Select Agent"
                        isClearable
                        classNames={{
                          control: ({ isFocused }) =>
                            `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                              isFocused
                                ? "!border-primary-500"
                                : "!border-[#DFEAF2]"
                            }`,
                        }}
                        styles={{
                          menu: (base) => ({
                            ...base,
                            borderRadius: "4px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            backgroundColor: "#fff",
                          }),
                          option: (base, { isFocused, isSelected }) => ({
                            ...base,
                            backgroundColor: isSelected
                              ? "var(--primary-500)"
                              : isFocused
                              ? "var(--primary-100)"
                              : "#fff",
                            color: isSelected ? "#fff" : "#333",
                            cursor: "pointer",
                          }),
                        }}
                      />
                      {touched.agent_id && (errors as any).agent_id ? (
                        <p className="text-[#A3000E] text-sm mt-1">
                          {(errors as any).agent_id}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center ">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className=" py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full  text-center hover:bg-primary-700 hover:text-white "
                    >
                      Create Lead Activity
                    </button>
                  </div>
                </form>
              )}
            </Formik>

            {/* {END FORM} */}
          </div>
        )}
      </div>

      {/* FITLER FLYOUT END */}
    </>
  );
}

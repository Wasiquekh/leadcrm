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
import { tasks } from "firebase-functions/v2";
import { format, parse, isValid as isValidDate } from "date-fns";

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
interface LeadActivityData {
  id: string;
  disposition: string;
  disposition_id: string;
  conversation: string;
  occurred_at: string; // ISO date string
  created_at: string; // ISO date string
  agent_name: string;
  agent_id: string;
}
export interface LeadDocument {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number; // bytes
  storage_path: string; // e.g. "/uploads/doc/xxxx.png"
  is_image: boolean;
  created_at: string; // ISO datetime
}
export interface ActivityHistory {
  id: string;
  agent_id: string;
  agent_name: string;
  disposition_id: string;
  disposition: string;
  conversation: string;
  occurred_at: string; // ISO datetime (e.g. "2025-09-13T18:30:00.000Z")
  created_at: string; // ISO datetime
}
const UPDATE_ACTIVITY_URL = "/leads/update/activity"; // <-- set your real update endpoint

type UpdateActivityPayload = {
  id: string;
  lead_id?: string;
  conversation?: string;
  occurred_at?: string;
  disposition_id?: string;
  agent_id?: string;
};

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
  const [task, setTask] = useState<boolean>(false);
  const [document, setDocument] = useState<boolean>(false);
  const [updateAcitivityHistory, setUpdateActivityHistory] =
    useState<boolean>(false);
  const toggleFilterFlyout = () => setFlyoutFilterOpen(!isFlyoutFilterOpen);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [fetchLeadActivityData, setFetchLeadaActivityData] = useState<
    LeadActivityData[]
  >([]);
  //console.log("INTERFACE", fetchLeadActivityData);
  const [reloadKey, setReloadKey] = useState(0);
  const [docs, setDocs] = useState<LeadDocument[]>([]); // start empty
  const [activityHistoryData, setActivityHistoryData] =
    useState<ActivityHistory>(null);
  console.log("lead activity edit data", activityHistoryData);
  // console.log("lead activity",fetchLeadActivityData)
  //  FOR CREATE ACTIVITY LEAD
  // ✅ Validation
  const CreateTaskSchema = Yup.object({
    lead_id: Yup.string().trim().required("Lead is required."),
    assigned_agent_id: Yup.string().trim().required("Agent is required."),
    details: Yup.string()
      .trim()
      .min(3, "Details must be at least 3 characters.")
      .required("Details are required."),
    due_at_text: Yup.string().trim().required("Due date is required."),
  });
  const CreateLeadsActivitySchema = Yup.object({
    conversation: Yup.string()
      .trim()
      .max(500, "Max 500 characters")
      .required("Conversation is required"),
    createdAt: Yup.string().nullable(), // optional
    disposition_id: Yup.string().required("Disposition is required"),
    agent_id: Yup.string().required("Agent is required"), // optional
  });
  async function UpdateLeadsActivity(payload: UpdateActivityPayload) {
    console.log("UpdateLeadsActivity → payload:", payload);
    const res = await AxiosProvider.post(UPDATE_ACTIVITY_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("UpdateLeadsActivity → response:", res.data);
    return res.data;
  }
  // ✅ Initial Values
  const INITIAL_VALUES = {
    lead_id: leadId,
    conversation: "",
    occurred_at: "",
    disposition_id: "",
    agent_id: "",
  };
  const formInitialValues = activityHistoryData
    ? {
        id: activityHistoryData.id,
        lead_id: leadId,
        conversation: activityHistoryData.conversation ?? "",
        occurred_at: activityHistoryData.occurred_at ?? "",
        disposition_id: activityHistoryData.disposition_id ?? "",
        agent_id: activityHistoryData.agent_id ?? "",
      }
    : { id: "", ...INITIAL_VALUES };
  const InitialValuesForCreateTask = {
    lead_id: leadId,
    assigned_agent_id: "",
    details: "",
    due_at_text: "",
  };
  const CreateTaskActivity = async (n: typeof InitialValuesForCreateTask) => {
    // console.log("Submitted task values:", n);
    try {
      await AxiosProvider.post("/leads/tasks/create", n);
      toast.success("Lead task is created");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead task is not created");
    }
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
  const openTaskFlyout = () => {
    setFlyoutFilterOpen(true);
    setTask(true);
  };
  const openDocumentFlyout = () => {
    setFlyoutFilterOpen(true);
    setDocument(true);
  };
  const openActivityHistoryFlyout = (activity: ActivityHistory) => {
    setFlyoutFilterOpen(true);
    setUpdateActivityHistory(true);
    setActivityHistoryData(activity);
  };
  const closeFlyOut = () => {
    setActivity(false);
    setTask(false);
    setFlyoutFilterOpen(false);
    setDocument(false);
    setUpdateActivityHistory(false);
  };
  const handleChangepagination = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const UPLOAD_URL = "/leads/documents/upload"; // 👈 your final endpoint

  const handleSubmitDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!leadId) return;
    const userID = storage.getUserId();
    if (!userID) return;

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement; // 👈 'file'
    const file = fileInput?.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.set("lead_id", String(leadId));
    fd.set("uploaded_by", String(userID));
    fd.set("file", file); // 👈 actual file blob

    try {
      await AxiosProvider.post(UPLOAD_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully");
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    }
  };
  const fetchLeadDocumentData = async () => {
    if (!leadId) return;
    try {
      const res = await AxiosProvider.post("/leads/documents/list", {
        lead_id: leadId,
      });

      //console.log("lead document data", res.data.data.data);
      setDocs(res.data.data.data); // <-- if you want to store in state
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    fetchLeadDocumentData();
  }, [leadId]);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""; // if storage_path is relative
  const url = (p: string) => (p?.startsWith("http") ? p : `${baseUrl}${p}`);
  const fmtSize = (b: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0,
      n = b;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(1)} ${units[i]}`;
  };
  const fileExt = (name: string) =>
    (name?.split(".").pop() || "").toUpperCase();
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
              fetchLeadActivityData.map((activity) => {
                const occurred = activity.occurred_at
                  ? new Date(activity.occurred_at)
                  : null;
                const created = activity.created_at
                  ? new Date(activity.created_at)
                  : null;

                const occurredDate =
                  occurred?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "Asia/Kolkata",
                  }) ?? "--";
                const occurredTime =
                  occurred?.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  }) ?? "--";

                const createdDate =
                  created?.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  }) ?? "--";
                const createdTime =
                  created?.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  }) ?? "--";

                return (
                  <div
                    key={activity.id}
                    className="w-full flex items-center justify-between gap-4 hover:bg-primary-100 py-2 px-2 rounded"
                  >
                    {/* Left: icon + occurred date/time */}
                    <div className="flex items-center gap-2 shrink-0">
                      <TbActivity className="bg-primary-500 text-white p-1 text-2xl rounded-full" />
                      <div className="leading-5 text-sm">
                        <p>{occurredDate}</p>
                        <p>{occurredTime}</p>
                      </div>
                    </div>

                    {/* Middle: details */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        <span className="text-primary-600">
                          {activity.disposition}:
                        </span>{" "}
                        {activity.conversation}
                      </p>
                      <p className="text-xs text-gray-500">
                        Added by {activity.agent_name} on {createdDate}{" "}
                        {createdTime}
                      </p>
                    </div>

                    {/* Right: Edit button */}
                    <button
                      type="button"
                      onClick={() => openActivityHistoryFlyout(activity)}
                      className="shrink-0 py-1.5 px-3 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                    >
                      Edit
                    </button>
                  </div>
                );
              })
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

          <AppCalendar leadId={leadId} reloadKey={reloadKey} />
          {/* End Tab content 3 */}
        </>
      ),
    },
    {
      label: "Document",
      content: (
        <>
          {/* Tab content 4 */}
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-sm text-gray-500">No documents found</p>
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 border border-[#DFEAF2] rounded-[6px] p-3"
                >
                  {d.is_image ? (
                    <img
                      src={url(d.storage_path)}
                      alt={d.file_name}
                      className="h-14 w-14 object-cover rounded"
                    />
                  ) : (
                    <div className="h-14 w-14 flex items-center justify-center rounded bg-gray-100 text-gray-600 text-xs">
                      {fileExt(d.file_name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-firstBlack truncate">
                      {d.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {d.mime_type} · {fmtSize(d.file_size)} ·{" "}
                      {new Date(d.created_at).toLocaleString()}
                    </p>
                  </div>

                  <a
                    href={url(d.storage_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-primary-500 text-white rounded text-sm"
                  >
                    View
                  </a>
                  <a
                    href={url(d.storage_path)}
                    download
                    className="py-2 px-3 border border-[#DFEAF2] rounded text-sm"
                  >
                    Download
                  </a>
                </div>
              ))
            )}
          </div>

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
                      onClick={() => openTaskFlyout()}
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
                      onClick={() => openDocumentFlyout()}
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
                      <div className=" flex text-white items-center  gap-2 mb-3">
                        <AiOutlineSearch />
                        <p className=" text-sm font-medium leading-none">
                          {data?.address.state || "-"}
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
                setReloadKey((k) => k + 1);
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

                    {/* Agent  */}
                    <div className="w-full relative">
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
                        <p className="text-red-500 absolute top-[85px] text-xs">
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
        {task && (
          <div className=" w-full min-h-auto">
            {/* Flyout content here */}
            <div className=" flex justify-between mb-4">
              <p className=" text-primary-600 text-[26px] font-bold leading-9">
                Create Lead Task
              </p>
              <IoCloseOutline
                onClick={toggleFilterFlyout}
                className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* FORM */}
            <Formik
              initialValues={InitialValuesForCreateTask}
              validationSchema={CreateTaskSchema}
              onSubmit={async (values, { setSubmitting }) => {
                await CreateTaskActivity(values); // { lead_id, assigned_agent_id, details, due_at_text }
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
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                    {/* Agent (react-select) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Agent
                      </p>
                      <Select
                        value={
                          (agent || []).find(
                            (opt: any) =>
                              String(opt.id) ===
                              String(values.assigned_agent_id)
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "assigned_agent_id",
                            selectedOption ? selectedOption.id : ""
                          )
                        }
                        onBlur={() =>
                          setFieldTouched("assigned_agent_id", true)
                        }
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => String(opt.id)}
                        options={agent}
                        placeholder="Select Agent"
                        isClearable
                        classNames={{
                          control: ({ isFocused }: any) =>
                            `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                              isFocused
                                ? "!border-primary-500"
                                : "!border-[#DFEAF2]"
                            }`,
                        }}
                        styles={{
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "4px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            backgroundColor: "#fff",
                          }),
                          option: (
                            base: any,
                            { isFocused, isSelected }: any
                          ) => ({
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
                      {touched.assigned_agent_id &&
                      (errors as any).assigned_agent_id ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).assigned_agent_id}
                        </p>
                      ) : null}
                    </div>

                    {/* Detail */}
                    <div className="w-full relative">
                      <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                        Detail
                      </p>
                      <input
                        type="text"
                        name="details"
                        value={values.details}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("details", true)}
                        placeholder="Enter details"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                      {touched.details && (errors as any).details ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).details}
                        </p>
                      ) : null}
                    </div>

                    {/* Due At (DatePicker) */}
                    {/* Due At (DatePicker) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Due At
                      </p>
                      <DatePicker
                        selected={
                          values.due_at_text
                            ? (() => {
                                const d = parse(
                                  values.due_at_text,
                                  "yyyy-MM-dd h:mmaaa",
                                  new Date()
                                );
                                return isValidDate(d) ? d : null; // ✅ now it's the date-fns function
                              })()
                            : null
                        }
                        onChange={(date: Date | null) => {
                          const formatted = date
                            ? format(date, "yyyy-MM-dd h:mmaaa").toLowerCase()
                            : "";
                          setFieldValue("due_at_text", formatted);
                        }}
                        onBlur={() => setFieldTouched("due_at_text", true)}
                        name="due_at_text"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="yyyy-mm-dd"
                        className="hover:shadow-hoverInputShadow focus-border-primary 
      !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
      font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                        popperClassName="custom-datepicker"
                        dayClassName={(date) => {
                          const today = new Date().toDateString();
                          const selectedDate = values.due_at_text
                            ? parse(
                                values.due_at_text,
                                "yyyy-MM-dd h:mmaaa",
                                new Date()
                              ).toDateString()
                            : null;
                          if (today === date.toDateString())
                            return "bg-[#FFF0F1] text-[#A3000E]";
                          if (selectedDate === date.toDateString())
                            return "bg-[#A3000E] text-white";
                          return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                        }}
                      />
                      {touched.due_at_text && (errors as any).due_at_text ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).due_at_text}
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
                      Create Task Activity
                    </button>
                  </div>
                </form>
              )}
            </Formik>

            {/* {END FORM} */}
          </div>
        )}
        {document && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Create Document
              </p>
              <IoCloseOutline
                onClick={toggleFilterFlyout}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

            <form onSubmit={handleSubmitDocument} encType="multipart/form-data">
              <div className="w-full">
                <div className="w-full relative">
                  <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                    Document
                  </p>
                  <input
                    type="file"
                    name="file" // 👈 matches backend ("file")
                    required
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
                    className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-white"
                  />
                </div>
              </div>

              <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center ">
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                >
                  Submit Document
                </button>
              </div>
            </form>
          </div>
        )}
        {updateAcitivityHistory && (
          <div className=" w-full min-h-auto">
            {/* Flyout content here */}
            <div className=" flex justify-between mb-4">
              <p className=" text-primary-600 text-[26px] font-bold leading-9">
                Update Lead Activity
              </p>
              <IoCloseOutline
                onClick={toggleFilterFlyout}
                className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* FORM */}

            <Formik
              enableReinitialize
              initialValues={formInitialValues}
              validationSchema={CreateLeadsActivitySchema}
              onSubmit={async (values, { setSubmitting }) => {
                console.log("Formik values (raw):", values);
                const payload: UpdateActivityPayload = {
                  id: values.id, // required for update
                  lead_id: values.lead_id,
                  conversation: values.conversation,
                  occurred_at: values.occurred_at || undefined,
                  disposition_id: values.disposition_id || undefined,
                  agent_id: values.agent_id || undefined,
                };
                console.log("Update payload:", payload);
                try {
                  await UpdateLeadsActivity(payload);
                  setReloadKey((k) => k + 1);
                } catch (e) {
                  console.error("API error:", e);
                } finally {
                  setSubmitting(false);
                }
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
                            (opt: any) =>
                              String(opt.id) === String(values.disposition_id)
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "disposition_id",
                            selectedOption ? String(selectedOption.id) : ""
                          )
                        }
                        onBlur={() => setFieldTouched("disposition_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => String(opt.id)}
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

                    {/* Agent */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Agent
                      </p>
                      <Select
                        value={
                          (agent || []).find(
                            (opt: any) =>
                              String(opt.id) === String(values.agent_id)
                          ) || null
                        }
                        onChange={(selectedOption: any) =>
                          setFieldValue(
                            "agent_id",
                            selectedOption ? String(selectedOption.id) : ""
                          )
                        }
                        onBlur={() => setFieldTouched("agent_id", true)}
                        getOptionLabel={(opt: any) => opt.name}
                        getOptionValue={(opt: any) => String(opt.id)}
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
                        <p className="text-red-500 absolute top-[85px] text-xs">
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
                      Update Lead Activity
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

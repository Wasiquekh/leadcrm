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
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FaCity,
  FaNotesMedical,
  FaRegEye,
  FaStar,
  FaTasks,
} from "react-icons/fa";
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
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  isValid as isValidDate,
  startOfToday,
  isToday,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
} from "date-fns";
import { compressIfImage } from "../component/imageCompression";
import Swal from "sweetalert2";

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
  note:string;
}
interface LeadActivity {
  id: string;
  disposition: string;
  disposition_id: string;
  conversation: string;
  //occurred_at: string; // ISO date string
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
type UpdateLead = {
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
  lead_source_id: string;
  debt_consolidation_status_id: string;
  whatsapp_number: string;
  consolidated_credit_status_id?: string;
};
export interface LeadDocument {
  id: string;
  file_name: string;
  mime_type: string;
  notes: string;
  file_size: number; // bytes
  storage_path: string; // e.g. "/uploads/doc/xxxx.png"
  is_image: boolean;
  created_at: string; // ISO datetime
  url: string;
  download: string;
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
export interface Consolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
export interface DebtConsolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
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
  lead_source_id: string;
  debt_consolidation_status_id: string;
  whatsapp_number: string;
  consolidated_credit_status_id?: string;
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
  // console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL", leadId);
  const [totp, setTotp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isTotpPopupOpen, setIsTotpPopupOpen] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  console.log("LEAD SINGLE DATA", data);
  const [leadActivityData, setLeadActivityData] = useState<LeadActivity>();
  const [disposition, setDisposition] = useState<Disposition[]>([]);
  const [agent, setAgent] = useState<Agent[]>([]);
    const [consolidationData, setConsolidationData] = useState<Consolidation[]>([]);
  const [debtConsolidation, setDebtConsolidation] = useState<DebtConsolidation[]>([]);
 
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
 // console.log("fetched single lead data", fetchLeadActivityData);
  const [reloadKey, setReloadKey] = useState(0);
  const [docs, setDocs] = useState<LeadDocument[]>([]); // start empty
  console.log("DDDDDDDDDDDDOOOOOOOOOOOOOOCCCCCCCCSSSSSS",docs)
  const [activityHistoryData, setActivityHistoryData] =
    useState<ActivityHistory>(null);
  const [isEditFirstLead, setIsEditFirstLead] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedDropDownTaskValue, setSelectedDropDownTaskValue] =
    useState("");
  // console.log("VVVVVVVVVVVVVVVVVVVVVVVVVV", selectedDropDownTaskValue);
  const hiddenLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [isActivityFilter, setIsActvityFilter] = useState<boolean>(false);
  const [isTaskFilter, setIsTaskFilter] = useState<boolean>(false);
  const [isDocumentFilter, setIsDocumentFilter] = useState<boolean>(false);
  const [fileteredTaskData, setFilteredTasKData] = useState<[]>([]);
 // console.log("DDDDDDDDDDDDDDDDDDLLLLLLLLLLLLLLLL", fileteredTaskData);
 const [isleadPropertyEdit, setIsLeadPropertyEdit] = useState<boolean>(true)


  //console.log("", documentName);
  // console.log("lead activity edit data", activityHistoryData);
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
    // console.log("UpdateLeadsActivity → response:", res.data);
    toast.success("Activity updated successfully");
    setHitApi(!hitApi);
    closeFlyOut();
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
    lead_id: leadId, // required
    assigned_agent_id: "", // will hold agent id
    details: "", // task details
    subject: "", // new field
    task_type: "", // new field (e.g., followup, meeting, etc.)
    start_at_text: "", // new field (datetime string)
    end_at_text: "", // new field (datetime string)
    location: "", // required
    description: "", // optional
  };

  const CreateTaskActivity = async (n: typeof InitialValuesForCreateTask) => {
    const { description, ...rest } = n;
    const payload = {
      ...rest,
      lead_id: leadId, // ✅ now included
    };

    console.log("Submitted task values:", payload);

    try {
      await AxiosProvider.post("/leads/tasks/create", n);
      toast.success("Lead task is created");
      setHitApi(!hitApi);
      closeFlyOut();
    } catch (error: any) {
      toast.error("Lead task is not created");
    }
  };

  // ✅ Submit handler
  const CreateLeadsActivity = async (n: typeof INITIAL_VALUES) => {
    // console.log("Submitted values:", n);

    const { occurred_at, ...payload } = n; // removes occurred_at
    console.log("Payload without occurred_at:", payload);
    try {
      await AxiosProvider.post("/leads/activities/create", payload);
      toast.success("Lead activity is created");
      setHitApi(!hitApi);
      closeFlyOut();
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
  }, [leadId, hitApi]);

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
  }, [page, leadId, hitApi]);

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
  // FETCH AGENT CONSILATION AND DEBT CONSILATION
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
    const consolidationStatus = async () => {
    try {
      const response = await AxiosProvider.get("/getconsolidation");
      //  console.log("KKKKKKKKMMMMMMM", response.data.data.data);
      setConsolidationData(response.data.data.data);

      // const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    consolidationStatus();
  }, []);

  const debtConsolidationStatus = async () => {
    try {
      const response = await AxiosProvider.get("/leaddebtstatuses");
      //  console.log("GGGGGGGGGGGGGGGG", response.data.data.data);
      setDebtConsolidation(response.data.data.data);

      // const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    debtConsolidationStatus();
  }, []);

    // END ETCH AGENT CONSILATION AND DEBT CONSILATION and lead source
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
  const openLeadActivityFlyOut = () => {
    setFlyoutFilterOpen(true);
    setIsActvityFilter(true);
  };
  const openLeadTaskInFlyout = () => {
    setFlyoutFilterOpen(true);
    setIsTaskFilter(true);
  };
  const openLeadDocumentInFlyOut = () => {
    setFlyoutFilterOpen(true);
    setIsDocumentFilter(true);
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
    setIsActvityFilter(false);
    setIsTaskFilter(false);
    setIsDocumentFilter(false);
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
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    // Compress only if it's an image
    const compressed = await compressIfImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.72,
      mimeType: "image/jpeg", // use "image/webp" if your backend supports it
      compressIfLargerThanBytes: 400 * 1024,
    });

    const fd = new FormData();
    fd.set("lead_id", String(leadId));
    fd.set("uploaded_by", String(userID));
    fd.set("file", compressed); // 👈 use the (maybe) compressed file
    fd.set("notes", documentName);

    try {
      await AxiosProvider.post(UPLOAD_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        maxBodyLength: Infinity, // safe guard for large files
      });
      toast.success("Document uploaded successfully");
      closeFlyOut();
      setHitApi(!hitApi);
      setDocumentName("");
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

   console.log("lead document data", res.data.data.data);
      setDocs(res.data.data.data); // <-- if you want to store in state
    } catch (error: any) {
      console.error("Error fetching lead:", error);
    }
  };

  useEffect(() => {
    fetchLeadDocumentData();
  }, [leadId, hitApi]);
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
// ----------------- DOWNLOAD IMAGE

const downloadDocument = (src: string | Blob, fileName = "image.jpg") => {
  if (typeof src === "string") {
    // case 1: URL string
    const a = window.document.createElement("a");
    a.href = src;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    // case 2: Blob object
    const url = URL.createObjectURL(src);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = fileName;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};
// -----------------------END DOWNLOAD IMAGE


  const deleteActivityHistory = async (deleteId: ActivityHistory) => {
    const activityHistoryId = deleteId.id;
    console.log("ACTIVITY HISTORY DELETE ID", activityHistoryId);
    //return;
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
          await AxiosProvider.post("/leads/activities/soft-delete", {
            id: activityHistoryId,
          });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };
  const deleteDocument = async (deleteId: LeadDocument) => {
    const documentId = deleteId.id;
    console.log("ACTIVITY HISTORY DELETE ID", documentId);
    //return;
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
          await AxiosProvider.post("/leads/documents/soft-delete", {
            id: deleteId.id,
          });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };
  const handleSelect = (item: string) => {
    setSelectedDropDownTaskValue(item); // save value in state
    openTaskFlyout(); // your existing function
  };

  const tabs = [
    {
      label: "Activity History",
      content: (
        <>
          {/* Tab content 3 */}
          <div className="container mx-auto p-4">
            <button
              onClick={() => openLeadActivityFlyOut()}
              className="bg-primary-600 hover:bg-primary-700 py-3 px-4 rounded-[4px] text-sm font-medium text-white mb-2"
            >
              Filter Activity
            </button>
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
                        <p>{createdDate}</p>
                        <p>{createdTime}</p>
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
                    <button
                      type="button"
                      onClick={() => deleteActivityHistory(activity)}
                      className="shrink-0 py-1.5 px-3 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                    >
                      Delete
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

          <AppCalendar
            leadId={leadId}
            reloadKey={reloadKey}
            hitApi={hitApi}
            setHitApi={setHitApi}
            openLeadTaskInFlyout={openLeadTaskInFlyout}
            incomingTasks={fileteredTaskData}
            //filteredTaskData={fileteredTaskData}
          />
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
            <button
              onClick={() => openLeadDocumentInFlyOut()}
              className="bg-primary-600 hover:bg-primary-700 py-3 px-4 rounded-[4px] text-sm font-medium text-white mb-2"
            >
              Filter Document
            </button>
            {docs.length === 0 ? (
              <p className="text-sm text-gray-500">No documents found</p>
            ) : (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-[30%_70%] gap-4 border border-[#DFEAF2] rounded-[6px] p-3"
                >
                  {/* Left Column: Notes */}
                  <div className="flex items-start">
                    <p className="text-base text-secondBlack whitespace-pre-wrap capitalize">
                      {d.notes || "—"}
                    </p>
                  </div>

                  {/* Right Column: File Info */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-firstBlack truncate">
                        {d.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {d.mime_type} · {fmtSize(d.file_size)} ·{" "}
                        {new Date(d.created_at).toLocaleString()}
                      </p>
                    </div>

                    <a 
                    href={d.download} download
                 
                 //  href={`${d.url}?download=${d.download}`}
                 //  onClick={() => downloadDocument(d.url,"forest.jpg")}
                      className="py-2 px-3 border border-[#DFEAF2] rounded text-sm cursor-pointer hover:underline"
                      
                    >
                      Download
                    </a>

                   
                    <a
                      onClick={() => deleteDocument(d)}
                      className="py-2 px-3 border border-[#DFEAF2] rounded text-sm cursor-pointer hover:underline"
                    >
                      Delete
                   
                    </a>
                  </div>
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
  // Round a date up to the next 5-minute tick
  const roundUpToNext5 = (d: Date) => {
    const remainder = d.getMinutes() % 5;
    return remainder === 0 ? d : addMinutes(d, 5 - remainder);
  };
  // --------------------------- DATE
  // helpers
  const roundToNext5 = (d = new Date()) => {
    const copy = new Date(d);
    const mins = copy.getMinutes();
    const add = (5 - (mins % 5)) % 5;
    copy.setMinutes(mins + add, 0, 0);
    return copy;
  };

  const addMinutes = (d: Date, mins: number) => {
    const copy = new Date(d);
    copy.setMinutes(copy.getMinutes() + mins);
    return copy;
  };

  const formatDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    let h = d.getHours();
    const m = pad(d.getMinutes());
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd} ${pad(h)}:${m}${ampm}`;
  };

  const defaultStart = roundToNext5();
  const defaultEnd = addMinutes(defaultStart, 30); // still 30 min gap

  // helpers (put inside the component)
const findById = (list: any[], id: string | number) =>
  list?.find((o: any) => String(o.id) === String(id)) || null;

const getIdFromName = (list: any[], name?: string | null) => {
  if (!name) return "";
  const item = list?.find((o: any) => String(o.name) === String(name));
  return item ? item.id : "";
};

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
                  {/* TASK */}
                  <div className="flex justify-center items-center gap-4">
                    <div className="relative group">
                      {/* Main Button */}
                      <div
                        className="flex gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 min-w-32"
                        // onClick={() => openTaskFlyout()}
                      >
                        <FaNotesMedical className="w-5 h-5 text-white" />
                        <p className="text-white text-base font-medium">Task</p>
                      </div>

                      {/* Dropdown */}
                      <div className="absolute left-0 mt-2 w-40 rounded-[4px] border border-[#E7E7E7] bg-white shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <ul className="flex flex-col">
                          {["meeting", "followup", "phonecall"].map((item) => (
                            <li
                              key={item}
                              onClick={() => handleSelect(item)}
                              className="px-4 py-2 text-gray-700 hover:bg-primary-100 hover:text-primary-700 cursor-pointer text-sm capitalize"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* END TASK */}
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
                    {isEditFirstLead ? (
                      /* ---------- VIEW MODE (unchanged) ---------- */
                      <div className="w-full rounded bg-primary-600 px-4 py-6 mb-6">
                        <div className=" flex text-white  gap-2 mb-5 capitalize">
                          <FaStar />
                          <div>
                            <p className=" text-base font-medium leading-none">
                              {data?.first_name || "-"} {data?.last_name || "-"}
                            </p>
                            {data?.address?.country || "-"}
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
                            {data?.address?.line1 || "-"}{" "}
                            {data?.address?.line2 || "-"}{" "}
                            {data?.address?.city || "-"}{" "}
                            {data?.address?.state || "-"}
                          </p>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <FaCity />
                          <p className=" text-sm font-medium leading-none">
                            {data?.address?.postal_code || "-"}
                          </p>
                        </div>

                        <div className=" flex text-white items-center  gap-2 mb-3">
                          <MdLocationPin />
                          <p className=" text-sm font-medium leading-none">
                            {data?.address?.state || "-"}
                          </p>
                        </div>
                                                <div className=" flex text-white items-center  gap-2 mb-3">
                         <p className="text-sm font-medium leading-none">Note:</p>
                          <p className=" text-sm font-medium leading-none">
                            {data?.note || "-"}
                          </p>
                        </div>

                        {/* ✅ Edit button */}
                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => setIsEditFirstLead(false)} // flip state
                            className="px-4 py-2 rounded-[4px] bg-white text-secondBlack text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ---------- EDIT MODE (Formik form) ---------- */
                      /* ---------- EDIT MODE (Formik form) ---------- */
                      <div className="w-full rounded bg-white px-4 py-6 mb-6">
                         <Formik
    enableReinitialize
    initialValues={{
      first_name: data?.first_name ?? "",
      last_name: data?.last_name ?? "",
      country: data?.address?.country ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      address_line1: data?.address?.line1 ?? "",
      address_line2: data?.address?.line2 ?? "",
      city: data?.address?.city ?? "",
      state: data?.address?.state ?? "",
      note: data?.note ?? "", // ✅ Added note
    }}
    validationSchema={Yup.object({
      first_name: Yup.string().trim().required("First name is required"),
      last_name: Yup.string().trim().required("Last name is required"),
      email: Yup.string()
        .trim()
        .email("Invalid email")
        .required("Email is required"),
      phone: Yup.string().trim().required("Mobile is required"),
      country: Yup.string().trim().nullable(),
      address_line1: Yup.string().trim().nullable(),
      address_line2: Yup.string().trim().nullable(),
      city: Yup.string().trim().nullable(),
      state: Yup.string().trim().nullable(),
      note: Yup.string().trim().nullable(), // ✅ Optional note
    })}
    onSubmit={async (values, { setSubmitting }) => {
      try {
        const payload = {
          id: data?.id,
          ...values, // ✅ includes note
        };

        await AxiosProvider.post("/leads/update", payload);
        toast.success("Lead updated successfully");
        setIsEditFirstLead(true);
        setHitApi(!hitApi);
      } catch (e) {
        console.error(e);
        toast.error("Failed to update lead");
      } finally {
        setSubmitting(false);
      }
    }}
  >
    {({ isSubmitting }) => (
      <Form className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondBlack mb-1">
              First Name *
            </label>
            <Field
              name="first_name"
              type="text"
              className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
              placeholder="Enter first name"
            />
            <ErrorMessage
              name="first_name"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondBlack mb-1">
              Last Name *
            </label>
            <Field
              name="last_name"
              type="text"
              className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
              placeholder="Enter last name"
            />
            <ErrorMessage
              name="last_name"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondBlack mb-1">
              Email *
            </label>
            <Field
              name="email"
              type="email"
              className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
              placeholder="name@example.com"
            />
            <ErrorMessage
              name="email"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondBlack mb-1">
              Mobile *
            </label>
            <Field
              name="phone"
              type="text"
              className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
              placeholder="Enter mobile number"
            />
            <ErrorMessage
              name="phone"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-secondBlack mb-1">
            Country
          </label>
          <Field
            name="country"
            type="text"
            className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
            placeholder="Country"
          />
          <ErrorMessage
            name="country"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* Address lines */}
        <div>
          <label className="block text-sm font-medium text-secondBlack mb-1">
            Address Line 1
          </label>
          <Field
            name="address_line1"
            type="text"
            className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
            placeholder="House / Street / Area"
          />
          <ErrorMessage
            name="address_line1"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondBlack mb-1">
            Address Line 2
          </label>
          <Field
            name="address_line2"
            type="text"
            className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
            placeholder="Landmark / Apartment"
          />
          <ErrorMessage
            name="address_line2"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* City / State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondBlack mb-1">
              City
            </label>
            <Field
              name="city"
              type="text"
              className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
              placeholder="City"
            />
            <ErrorMessage
              name="city"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondBlack mb-1">
              State
            </label>
            <Field
              name="state"
              type="text"
              className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
              placeholder="State"
            />
            <ErrorMessage
              name="state"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* ✅ Note field */}
        <div>
          <label className="block text-sm font-medium text-secondBlack mb-1">
            Note
          </label>
          <Field
            as="textarea"
            name="note"
            rows={3}
            className="w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-6 px-3 py-2 focus:outline-none"
            placeholder="Enter notes here"
          />
          <ErrorMessage
            name="note"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsEditFirstLead(true)}
            className="px-4 py-2 rounded-[4px] border border-[#DFEAF2] text-secondBlack text-sm font-medium bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-[4px] bg-primary-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    )}
  </Formik>
                      </div>
                    )}

                    {/* LEAD PROPERTIES */}
                   {isleadPropertyEdit ? 
                   ( 
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
                               <th
                               onClick={()=>setIsLeadPropertyEdit(!isleadPropertyEdit)}
                              scope="col"
                              className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack text-base"
                              colSpan={2}
                            >
                              Edit
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
                              Agent Name
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.agent.name || "-"}
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
                               Consolidation Status
                            </td>
                            <td className="text-sm font-medium text-[#252F4A]  py-4 px-4">
                              {data?.consolidated_credit_status || "-"}
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
                    )
                    : 
                    // LEAD PROPERTIES EDIT FORM
                    (
                     <>
                     <div className="w-full">
  <Formik
    enableReinitialize
    initialValues={{
      id:leadId,
      agent_id: data?.agent?.id ?? "",
      debt_consolidation_status_id:
        data?.debt_consolidation_status_id ??
        getIdFromName(debtConsolidation, data?.debt_consolidation_status) ??
        "",
      consolidated_credit_status_id:
        data?.consolidated_credit_status_id ??
        getIdFromName(consolidationData, data?.consolidated_credit_status) ??
        "",
      best_time_to_call: data?.best_time_to_call ?? "",
      whatsapp_number: data?.whatsapp_number ?? "",
    }}
    validationSchema={Yup.object({
      agent_id: Yup.string().nullable(),
      debt_consolidation_status_id: Yup.string().nullable(),
      consolidated_credit_status_id: Yup.string().nullable(),
      best_time_to_call: Yup.string().trim().nullable(),
      whatsapp_number: Yup.string().trim().nullable(),
    })}
    onSubmit={async (values) => {
      console.log("Lead Properties (edit) submit:", values);

      try {
      await AxiosProvider.post("/leads/update", values);
      toast.success("Lead is Updated");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    }
    }}
  >
    {({ setFieldValue, setFieldTouched, values, isSubmitting }) => {
      const findById = (list: any[], id: string | number) =>
        list?.find((o: any) => String(o.id) === String(id)) || null;

      const agentValue = findById(agent, values.agent_id);
      const debtConsValue = findById(
        debtConsolidation,
        values.debt_consolidation_status_id
      );
      const consValue = findById(
        consolidationData,
        values.consolidated_credit_status_id
      );

      return (
        <Form>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-[#999999] bg-white">
              <tr className="border border-tableBorder">
                <th
                  scope="col"
                  className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack text-base"
                  colSpan={2}
                >
                  Lead Properties (Edit)
                </th>
                <th
                  scope="col"
                  onClick={() => setIsLeadPropertyEdit(!isleadPropertyEdit)}
                  className="px-3 py-3 md:p-3 border border-tableBorder font-semibold text-secondBlack text-base cursor-pointer"
                  colSpan={2}
                >
                  Close
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Agent -> Dropdown */}
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="text-sm text-[#78829D] py-4 px-4">Agent Name</td>
                <td className="py-4 px-4">
                  <Select
                    value={agentValue}
                    onChange={(selected: any) =>
                      setFieldValue("agent_id", selected ? selected.id : "")
                    }
                    onBlur={() => setFieldTouched("agent_id", true)}
                    getOptionLabel={(opt: any) => opt.name}
                    getOptionValue={(opt: any) => String(opt.id)}
                    options={agent}
                    placeholder="Select Agent"
                    isClearable
                    classNames={{
                      control: ({ isFocused }: any) =>
                        `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                          isFocused ? "!border-primary-500" : "!border-[#DFEAF2]"
                        }`,
                    }}
                    styles={{
                      menu: (base: any) => ({
                        ...base,
                        borderRadius: "4px",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff",
                      }),
                      option: (base: any, { isFocused, isSelected }: any) => ({
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
                </td>
              </tr>

              {/* Best time to call -> Input */}
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="text-sm text-[#78829D] py-4 px-4">
                  Best time to call
                </td>
                <td className="py-4 px-4">
                  <Field
                    name="best_time_to_call"
                    type="text"
                    className="w-full border border-[#DFEAF2] rounded-[4px] text-sm px-3 py-2 focus:outline-none"
                    placeholder="Enter best time to call"
                  />
                  <ErrorMessage
                    name="best_time_to_call"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </td>
              </tr>

              {/* Debt Consolidation Status -> Dropdown */}
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="text-sm text-[#78829D] py-4 px-4">
                  Debt Consolidation Status
                </td>
                <td className="py-4 px-4">
                  <Select
                    value={debtConsValue}
                    onChange={(selected: any) =>
                      setFieldValue(
                        "debt_consolidation_status_id",
                        selected ? selected.id : ""
                      )
                    }
                    onBlur={() =>
                      setFieldTouched("debt_consolidation_status_id", true)
                    }
                    getOptionLabel={(opt: any) => opt.name}
                    getOptionValue={(opt: any) => String(opt.id)}
                    options={debtConsolidation}
                    placeholder="Select Debt Consolidation Status"
                    isClearable
                    classNames={{
                      control: ({ isFocused }: any) =>
                        `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                          isFocused ? "!border-primary-500" : "!border-[#DFEAF2]"
                        }`,
                    }}
                    styles={{
                      menu: (base: any) => ({
                        ...base,
                        borderRadius: "4px",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff",
                      }),
                      option: (base: any, { isFocused, isSelected }: any) => ({
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
                </td>
              </tr>

              {/* Consolidation Status -> Dropdown */}
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="text-sm text-[#78829D] py-4 px-4">
                  Consolidation Status
                </td>
                <td className="py-4 px-4">
                  <Select
                    value={consValue}
                    onChange={(selected: any) =>
                      setFieldValue(
                        "consolidated_credit_status_id",
                        selected ? selected.id : ""
                      )
                    }
                    onBlur={() =>
                      setFieldTouched("consolidated_credit_status_id", true)
                    }
                    getOptionLabel={(opt: any) => opt.name}
                    getOptionValue={(opt: any) => String(opt.id)}
                    options={consolidationData}
                    placeholder="Select Consolidation Status"
                    isClearable
                    classNames={{
                      control: ({ isFocused }: any) =>
                        `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
                          isFocused ? "!border-primary-500" : "!border-[#DFEAF2]"
                        }`,
                    }}
                    styles={{
                      menu: (base: any) => ({
                        ...base,
                        borderRadius: "4px",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff",
                      }),
                      option: (base: any, { isFocused, isSelected }: any) => ({
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
                </td>
              </tr>

              {/* WhatsApp -> Input */}
              <tr className="border border-tableBorder bg-white hover:bg-primary-100 transition-colors">
                <td className="text-sm text-[#78829D] py-4 px-4">WHATSAPP</td>
                <td className="py-4 px-4">
                  <Field
                    name="whatsapp_number"
                    type="text"
                    className="w-full border border-[#DFEAF2] rounded-[4px] text-sm px-3 py-2 focus:outline-none"
                    placeholder="Enter WhatsApp number"
                  />
                  <ErrorMessage
                    name="whatsapp_number"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsLeadPropertyEdit(false)}
              className="px-4 py-2 rounded-[4px] border border-[#DFEAF2] text-secondBlack text-sm font-medium bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-[4px] bg-primary-600 text-white text-sm font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </Form>
      );
    }}
  </Formik>

</div>
                     </>
                    )
                    }
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
      {/* START FLY OUT */}
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
                onClick={()=>  closeFlyOut()}
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
                {/* ===== Row 1: Disposition + Agent (side-by-side) ===== */}

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
          `onHoverBoxShadow !w/full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
            isFocused ? "!border-primary-500" : "!border-[#DFEAF2]"
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
    {touched.disposition_id && (errors as any).disposition_id ? (
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
        (agent || []).find((opt: any) => opt.id === values.agent_id) || null
      }
      onChange={(selectedOption: any) =>
        setFieldValue("agent_id", selectedOption ? selectedOption.id : "")
      }
      onBlur={() => setFieldTouched("agent_id", true)}
      getOptionLabel={(opt: any) => opt.name}
      getOptionValue={(opt: any) => opt.id}
      options={agent}
      placeholder="Select Agent"
      isClearable
      classNames={{
        control: ({ isFocused }) =>
          `onHoverBoxShadow !w/full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
            isFocused ? "!border-primary-500" : "!border-[#DFEAF2]"
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


{/* ===== Row 2: Conversation (full width textarea) ===== */}
<div className="w-full relative mt-4 col-span-2">
  <p className="text-secondBlack font-medium text-base leading-6 mb-2">
    Conversation
  </p>
  <textarea
    name="conversation"
    value={values.conversation}
    onChange={handleChange}
    onBlur={() => setFieldTouched("conversation", true)}
    placeholder="Enter conversation"
    className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
    rows={5} // height without changing your classes
  />
  {touched.conversation && (errors as any).conversation ? (
    <p className="text-red-500 absolute top-[85px] text-xs">
      {(errors as any).conversation}
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
                onClick={()=>  closeFlyOut()}
                className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* TASK FORM */}
            <Formik
              initialValues={{
                owner: data?.agent.id || "",
                associated_lead: data?.first_name + " " + data?.last_name || "",
                subject:
                  (selectedDropDownTaskValue
                    ? selectedDropDownTaskValue + ": "
                    : "") +
                  (data?.first_name || "") +
                  " " +
                  (data?.last_name || ""),
                location: "",
                description: "",
                start_at: defaultStart, // schedule → From
                end_at: defaultEnd, // schedule → To (auto, read-only)
              }}
              validationSchema={Yup.object({
                location: Yup.string().trim().required("Location is required"),
                description: Yup.string().trim().optional(),
                start_at: Yup.date().required("Start date is required"),
                end_at: Yup.date()
                  .required("End date is required")
                  .test("after", "End must be after start", function (value) {
                    const { start_at } = this.parent as {
                      start_at?: Date | null;
                    };
                    return start_at && value ? value > start_at : true;
                  }),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                const payload = {
                  lead_id: leadId,
                  assigned_agent_id: data?.agent?.id || "",
                  details: values.description || "",
                  subject: values.subject || "",
                  task_type: "followup",
                  start_at_text: values.start_at
                    ? formatDateTime(values.start_at)
                    : "",
                  end_at_text: values.end_at
                    ? formatDateTime(values.end_at)
                    : "",
                  location: values.location,
                  description: values.description || "",
                };
                await CreateTaskActivity(payload);
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                setFieldTouched,
                setFieldValue,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} noValidate>
                  {/* grid wrapper */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                    {/* Owner (readonly: submit id, display name) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Owner
                      </p>
                      <input
                        type="hidden"
                        name="owner"
                        value={data?.agent?.id}
                        readOnly
                      />
                      <input
                        type="text"
                        value={data?.agent?.name || ""}
                        readOnly
                        className="capitalize hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    {/* Associated Lead (readonly) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Associated Lead
                      </p>
                      <input
                        type="text"
                        name="associated_lead"
                        value={values.associated_lead}
                        readOnly
                        onBlur={() => setFieldTouched("associated_lead", true)}
                        className="capitalize hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    {/* Subject (readonly) */}
                    <div className="w-full relative">
                      <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                        Subject
                      </p>
                      <input
                        type="text"
                        name="subject"
                        value={values.subject}
                        readOnly
                        onBlur={() => setFieldTouched("subject", true)}
                        placeholder="Subject"
                        className="capitalize hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    {/* Location (required) */}
                    <div className="w-full relative">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Location
                      </p>
                      <input
                        type="text"
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("location", true)}
                        placeholder="Enter location"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                      {touched.location && (errors as any).location ? (
                        <p className="text-red-500 absolute top-[85px] text-xs">
                          {(errors as any).location}
                        </p>
                      ) : null}
                    </div>

                    {/* ===== Schedule (stacked: From, To-readonly) ===== */}
                    <div className="w-full md:col-span-2">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-3">
                        Schedule
                      </p>

                      {/* From */}
                      <div className="w-full relative mb-4">
                        <p className="text-[#0A0A0A] font-medium text-sm leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={values.start_at}
                          onChange={(date: Date | null) => {
                            setFieldValue("start_at", date);
                            if (date)
                              setFieldValue("end_at", addMinutes(date, 30)); // 🔄 +30 min
                          }}
                          onBlur={() => setFieldTouched("start_at", true)}
                          name="start_at"
                          showTimeSelect
                          timeFormat="h:mm aa"
                          timeIntervals={5}
                          dateFormat="yyyy-MM-dd h:mm aa"
                          placeholderText="yyyy-mm-dd hh:mm am/pm"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
                !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
                font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.start_at
                              ? new Date(values.start_at).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                        />
                        {touched.start_at && (errors as any).start_at ? (
                          <p className="text-red-500 absolute top-[85px] text-xs">
                            {(errors as any).start_at}
                          </p>
                        ) : null}
                      </div>

                      {/* To (read-only) */}
                      <div className="w-full relative">
                        <p className="text-[#0A0A0A] font-medium text-sm leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={values.end_at}
                          onChange={() => {}}
                          onBlur={() => setFieldTouched("end_at", true)}
                          name="end_at"
                          showTimeSelect
                          timeFormat="h:mm aa"
                          timeIntervals={5}
                          dateFormat="yyyy-MM-dd h:mm aa"
                          placeholderText="yyyy-mm-dd hh:mm am/pm"
                          disabled
                          className="hover:shadow-hoverInputShadow focus-border-primary 
                !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
                font-medium placeholder-[#717171] py-4 px-4 bg-gray-50 text-firstBlack cursor-not-allowed"
                          popperClassName="custom-datepicker"
                          dayClassName={() => "pointer-events-none"}
                        />
                        {touched.end_at && (errors as any).end_at ? (
                          <p className="text-red-500 absolute top-[85px] text-xs">
                            {(errors as any).end_at}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {/* ===== /Schedule ===== */}

                    {/* Description (optional) */}
                    <div className="w-full relative md:col-span-2">
                      <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                        Description (optional)
                      </p>
                      <textarea
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("description", true)}
                        placeholder="Add description (optional)"
                        rows={4}
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-5 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack resize-y"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
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
                onClick={()=>  closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

            <form onSubmit={handleSubmitDocument} encType="multipart/form-data">
              <div className="w-full">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                  {/* Conversation (required) */}
                  <div className="w-full">
                    <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                      Document name
                    </p>
                    <input
                      type="text"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Enter notes"
                      required
                      className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                    />
                  </div>
                  <div className="w-full">
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
              onClick={()=>  closeFlyOut()}
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
        {isActivityFilter && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Filter Activity
              </p>
              <IoCloseOutline
               onClick={()=>  closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* ✅ Drop this Formik block inside your existing component (uses your local `disposition` and `agent` vars). */}
            <Formik<{
              conversation: string;
              disposition_id: string;
              agent_id: string;
              startDate: string; // yyyy-MM-dd or ""
              endDate: string; // yyyy-MM-dd or ""
              lead_id: string;
            }>
              initialValues={{
                conversation: "",
                disposition_id: "",
                agent_id: "",
                startDate: "",
                endDate: "",
                lead_id: leadId,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                if (
                  !values.conversation &&
                  !values.disposition_id &&
                  !values.agent_id &&
                  !values.startDate &&
                  !values.endDate
                ) {
                  toast.error("At least 1 field is required");
                } else {
                  try {
                    const res = await AxiosProvider.post(
                      "/lead/activity/filter",
                      values
                    );
                    //  toast.success("Task Completed");
                    console.log("--------------", res.data.data.activities);
                    //setHitApi(!hitApi);
                    //  setData()
                    setFetchLeadaActivityData(res.data.data.activities);
                  } catch (error) {
                    console.error("Error deleting user:", error);
                    toast.error("Task not Completed");
                  }
                  console.log("Filter Activity payload:", values);
                }
                setSubmitting(false);
              }}
            >
              {(formik) => {
                // keep helpers/types INSIDE Formik
                type Option = { id: string; name: string };
                const fmt = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };

                const {
                  values,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                } = formik;

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* -------- Date Range (From / To) -------- */}
                    <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-4 sm:mb-6">
                      {/* From */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={
                            values.startDate ? new Date(values.startDate) : null
                          }
                          onChange={(date: Date | null) =>
                            setFieldValue("startDate", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("startDate", true)}
                          name="startDate"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
               !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
               font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.startDate
                              ? new Date(values.startDate).toDateString()
                              : null;

                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]"; // Current date
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white"; // Selected date
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]"; // Hover effect
                          }}
                          isClearable
                        />
                      </div>

                      {/* To */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={
                            values.endDate ? new Date(values.endDate) : null
                          }
                          onChange={(date: Date | null) =>
                            setFieldValue("endDate", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("endDate", true)}
                          name="endDate"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
               !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
               font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.endDate
                              ? new Date(values.endDate).toDateString()
                              : null;

                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]"; // Current date
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white"; // Selected date
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]"; // Hover effect
                          }}
                          isClearable
                        />
                      </div>
                    </div>

                    {/* -------- Other Fields (keep UI/CSS same) -------- */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                      {/* Conversation */}
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
                      </div>

                      {/* Disposition */}
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
                          onChange={(selected: Option | null) =>
                            setFieldValue(
                              "disposition_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() => setFieldTouched("disposition_id", true)}
                          getOptionLabel={(opt: Option) => opt.name}
                          getOptionValue={(opt: Option) => opt.id}
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
                      </div>

                      {/* Agent */}
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
                          onChange={(selected: Option | null) =>
                            setFieldValue(
                              "agent_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() => setFieldTouched("agent_id", true)}
                          getOptionLabel={(opt: Option) => opt.name}
                          getOptionValue={(opt: Option) => opt.id}
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
                      </div>
                    </div>

                    {/* -------- Submit -------- */}
                    <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center ">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700"
                      >
                        Filter Lead Activity
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
        {isTaskFilter && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Filter Task
              </p>
              <IoCloseOutline
                onClick={()=>  closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

            {/* 🔎 Filter Tasks Formik — drop inside your existing component (uses your local leadId, agent list, etc.). 
    No Yup. Same UI/CSS patterns. Two date pickers: From / To (yyyy-MM-dd). 
    Endpoint: "/leads/tasks/fliter". Sends only non-empty fields. */}

            <Formik<{
              lead_id: string;
              details: string;
              from: string; // yyyy-MM-dd or ""
              to: string; // yyyy-MM-dd or ""
              subject: string;
              date: string; // yyyy-MM-dd or ""
              location: string;
              task_type: string;
              status: string;
              assigned_agent_id: string;
            }>
              initialValues={{
                lead_id: leadId, // ✅ from your local var
                details: "",
                from: "",
                to: "",
                subject: "",
                date: "",
                location: "",
                task_type: "",
                status: "",
                assigned_agent_id: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                // require at least one filter (besides lead_id)
                const { lead_id, ...rest } = values;
                const allEmpty = Object.values(rest).every((v) => !v);
                if (allEmpty) {
                  toast.error("At least 1 field is required");
                  setSubmitting(false);
                  return;
                }

                // date consistency (optional guard)
                if (values.from && values.to) {
                  const s = new Date(values.from);
                  const e = new Date(values.to);
                  if (e < s) {
                    toast.error("To date cannot be earlier than From date");
                    setSubmitting(false);
                    return;
                  }
                }

                // send only non-empty fields
                const payload = Object.fromEntries(
                  Object.entries(values).filter(
                    ([_, v]) => v !== "" && v != null
                  )
                );

                try {
                  const res = await AxiosProvider.post(
                    "/leads/tasks/filter",
                    payload
                  );
                  console.log(
                    "DDDDDDDDDDDDDDDDDDD1111111111111111",
                    res.data.data.task
                  );
                  setFilteredTasKData(res.data.data.task);
                } catch (err) {
                  console.error("Filter Task error:", err);
                  //  toast.error("Failed to filter tasks");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {(formik) => {
                // helpers INSIDE Formik
                type Option = { id: string; name: string };

                const fmt = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };

                const {
                  values,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                } = formik;

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* ===== Lead (readonly) ===== */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Lead ID
                        </p>
                        <input
                          type="text"
                          name="lead_id"
                          value={values.lead_id}
                          readOnly
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack bg-gray-50 cursor-not-allowed"
                        />
                      </div>

                      {/* Assigned Agent */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Assigned Agent
                        </p>
                        <Select
                          value={
                            (agent || []).find(
                              (opt: any) => opt.id === values.assigned_agent_id
                            ) || null
                          }
                          onChange={(selected: Option | null) =>
                            setFieldValue(
                              "assigned_agent_id",
                              selected ? selected.id : ""
                            )
                          }
                          onBlur={() =>
                            setFieldTouched("assigned_agent_id", true)
                          }
                          getOptionLabel={(opt: Option) => opt.name}
                          getOptionValue={(opt: Option) => opt.id}
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
                      </div>
                    </div>

                    {/* ===== Date Range (From / To) ===== */}
                    <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-4 sm:mb-6">
                      {/* From */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={values.from ? new Date(values.from) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("from", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("from", true)}
                          name="from"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
               !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
               font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.from
                              ? new Date(values.from).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          maxDate={values.to ? new Date(values.to) : undefined}
                          isClearable
                        />
                      </div>

                      {/* To */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={values.to ? new Date(values.to) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("to", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("to", true)}
                          name="to"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
               !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
               font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.to
                              ? new Date(values.to).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          minDate={
                            values.from ? new Date(values.from) : undefined
                          }
                          isClearable
                        />
                      </div>
                    </div>

                    {/* ===== Single Date (optional) ===== */}
                    <div className="w-full mb-4 sm:mb-6">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        On Date
                      </p>
                      <DatePicker
                        selected={values.date ? new Date(values.date) : null}
                        onChange={(date: Date | null) =>
                          setFieldValue("date", date ? fmt(date) : "")
                        }
                        onBlur={() => setFieldTouched("date", true)}
                        name="date"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="yyyy-mm-dd"
                        className="hover:shadow-hoverInputShadow focus-border-primary 
             !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
             font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                        popperClassName="custom-datepicker"
                        dayClassName={(date) => {
                          const today = new Date().toDateString();
                          const selectedDate = values.date
                            ? new Date(values.date).toDateString()
                            : null;
                          if (today === date.toDateString())
                            return "bg-[#FFF0F1] text-[#A3000E]";
                          if (selectedDate === date.toDateString())
                            return "bg-[#A3000E] text-white";
                          return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                        }}
                        isClearable
                      />
                    </div>

                    {/* ===== Text Filters ===== */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:justify-between mb-4 sm:mb-6">
                      {/* Subject */}
                      <div className="w-full">
                        <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                          Subject
                        </p>
                        <input
                          type="text"
                          name="subject"
                          value={values.subject}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("subject", true)}
                          placeholder="Subject contains…"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Details */}
                      <div className="w-full">
                        <p className="text-secondBlack font-medium text-base leading-6 mb-2">
                          Details
                        </p>
                        <input
                          type="text"
                          name="details"
                          value={values.details}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("details", true)}
                          placeholder="Details contain…"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Location */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Location
                        </p>
                        <input
                          type="text"
                          name="location"
                          value={values.location}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("location", true)}
                          placeholder="Location contains…"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Task Type */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Task Type
                        </p>
                        <input
                          type="text"
                          name="task_type"
                          value={values.task_type}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("task_type", true)}
                          placeholder="e.g., meeting / followup / phonecall"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>

                      {/* Status */}
                      <div className="w-full">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          Status
                        </p>
                        <input
                          type="text"
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          onBlur={() => setFieldTouched("status", true)}
                          placeholder="e.g., open / completed / overdue"
                          className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                        />
                      </div>
                    </div>

                    {/* ===== Actions ===== */}
                    <div className="mt-10 w-full flex flex-col gap-y-4 md:flex-row justify-between items-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700"
                      >
                        Filter Tasks
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
        {isDocumentFilter && (
          <div className="w-full min-h-auto">
            <div className="flex justify-between mb-4">
              <p className="text-primary-600 text-[26px] font-bold leading-9">
                Filter Document
              </p>
              <IoCloseOutline
               onClick={()=>  closeFlyOut()}
                className="h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
              />
            </div>
            <div className="w-full border-b border-[#E7E7E7] mb-4"></div>
            <Formik<{
              lead_id: string;
              notes: string;
              from: string; // yyyy-MM-dd or ""
              to: string; // yyyy-MM-dd or ""
            }>
              initialValues={{
                lead_id: leadId, // 👈 dynamic
                notes: "",
                from: "",
                to: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                // Require at least one filter besides lead_id
                const { lead_id, ...rest } = values;
                if (Object.values(rest).every((v) => !v)) {
                  alert("At least 1 field is required");
                } else {
                  console.log("Filter Document payload:", values);
                  try {
                    const res = await AxiosProvider.post(
                      "/leads/documents/filter",
                      values
                    );
                    // console.log(
                    //   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
                    //   res.data.data.data
                    // );
                    setDocs(res.data.data.data);
                  } catch (err) {
                    console.error("Filter Task error:", err);
                    //  toast.error("Failed to filter tasks");
                  }

                  // 🔧 If/when you want to call the API:
                  // const payload = Object.fromEntries(Object.entries(values).filter(([_, v]) => v !== "" && v != null));
                  // AxiosProvider.post("/leads/documents/filter", payload)
                  //   .then(res => console.log("Filter Document result:", res.data))
                  //   .catch(err => console.error("Filter Document error:", err));
                }
                setSubmitting(false);
              }}
            >
              {(formik) => {
                const {
                  values,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                } = formik;

                const fmt = (d: Date) => {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                };

                return (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Lead ID (readonly) */}
                    <div className="mb-4">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Lead ID
                      </p>
                      <input
                        type="text"
                        name="lead_id"
                        value={values.lead_id}
                        readOnly
                        className="hover:shadow-hoverInputShadow focus-border-primary 
              w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
              font-medium placeholder-[#717171] py-4 px-4 text-firstBlack 
              bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                        Notes
                      </p>
                      <input
                        type="text"
                        name="notes"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched("notes", true)}
                        placeholder="Enter notes"
                        className="hover:shadow-hoverInputShadow focus-border-primary 
              w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
              font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                      />
                    </div>

                    {/* Date Range (From / To) */}
                    <div className="w-full flex flex-col md:flex-row gap-4 md:justify-between mb-6">
                      {/* From */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          From
                        </p>
                        <DatePicker
                          selected={values.from ? new Date(values.from) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("from", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("from", true)}
                          name="from"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
                !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
                font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.from
                              ? new Date(values.from).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          maxDate={values.to ? new Date(values.to) : undefined}
                          isClearable
                        />
                      </div>

                      {/* To */}
                      <div className="w-full md:w-[49%]">
                        <p className="text-[#0A0A0A] font-medium text-base leading-6 mb-2">
                          To
                        </p>
                        <DatePicker
                          selected={values.to ? new Date(values.to) : null}
                          onChange={(date: Date | null) =>
                            setFieldValue("to", date ? fmt(date) : "")
                          }
                          onBlur={() => setFieldTouched("to", true)}
                          name="to"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="yyyy-mm-dd"
                          className="hover:shadow-hoverInputShadow focus-border-primary 
                !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
                font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"
                          popperClassName="custom-datepicker"
                          dayClassName={(date) => {
                            const today = new Date().toDateString();
                            const selectedDate = values.to
                              ? new Date(values.to).toDateString()
                              : null;
                            if (today === date.toDateString())
                              return "bg-[#FFF0F1] text-[#A3000E]";
                            if (selectedDate === date.toDateString())
                              return "bg-[#A3000E] text-white";
                            return "hover:bg-[#FFCCD0] hover:text-[#A3000E]";
                          }}
                          minDate={
                            values.from ? new Date(values.from) : undefined
                          }
                          isClearable
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] 
              text-base font-medium leading-6 text-white 
              hover:bg-primary-700 w-full text-center"
                      >
                        Filter Document
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
      </div>

      {/* FITLER FLYOUT END */}
    </>
  );
}


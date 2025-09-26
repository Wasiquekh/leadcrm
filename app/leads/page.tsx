"use client";
import Image from "next/image";
import { SetStateAction, useContext, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import {
  IoIosCloseCircleOutline,
  IoIosNotificationsOutline,
} from "react-icons/io";
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
import Select from "react-select";
import Swal from "sweetalert2";
import Tabs from "../component/Tabs";
import page from "../page";

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
export interface LeadSource {
  id: string;
  name: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
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
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
type FilterValues = {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  lead_number: string;
  city: string;
  state: string;
  agent_id: string;
  lead_source_id: string;
  debt_consolidation_status_id: string;
  consolidated_credit_status_id: string;
};
type LeadSourceOption = { id: string | number; name: string };

export default function Home() {
  // const isChecking = useAuthRedirect();
  const [isFlyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [notAssignData, setNotAssignData] = useState<Lead[]>([]);
 // console.log("NOT ASSIGN DATAAAAAAAAA",notAssignData)
 const [assignLeadData, setAssignLeadData] = useState<Lead[]>([]);
 //console.log(" ASSIGN DATAAAAAAAAA",assignLeadData)
  //console.log("DATAAAAA", data);
  // PAGINATION USE STATES
    const [globalPageSize] = useState<number>(10)
    const [unAssignPage, setUnAssignPage] = useState<number>(1);
    const [unAssignTotalPages, setUsAssignTotalPages] = useState<number>(1)

    const [assignPage, setAssignPage] = useState<number>(1);
    const [assignTotalPages, setassignTotalPages] = useState<number>(1)

    const [UnAssignPageFilter, setUnAssignPageFilter] = useState<number>(1);
    const [UnAssignTotalPagesFilter, setUnAssignTotalPagesFilter] = useState<number>(1)

    const [assignPageFilter, setAssignPageFilter] = useState<number>(1);
    const [assignTotalPagesFilter, setAssignTotalPagesFilter] = useState<number>(1)

    const [unAssignFilterPagination, setUnAssignFilterPagination] = useState<boolean>(false)
    const [assignFilterPagination, setAssignFilterPagination] = useState<boolean>(false)

    // END PAGINATION USE STATES

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
  const [editLeadData, setEditLeadData] = useState(null);
  //console.log("555555555555555555555", editLeadData);
  const [leadSourceData, setLeadSourceData] = useState<LeadSource[]>([]);
  const [consolidationData, setConsolidationData] = useState<Consolidation[]>(
    []
  );
  const [debtConsolidation, setDebtConsolidation] = useState<
    DebtConsolidation[]
  >([]);
  const [isAgent, setIsAgent] = useState<boolean>(false);
  const [isAgentBulkCheckAssign, setIsagentBulkCehckAssign] = useState<boolean>(false)
  const [agentList, setAgentList] = useState<Agent[]>([]);
  //console.log("ALL AGENTS",agentList)
  // 👉 holds the selected agent from dropdown
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  //console.log("DDDAAANISHHHH", agentFetchedData);
  const [currentLeadId, setCurrentLeadId] = useState<string>(null);
  const [leadSourceDisplay, setLeadSourceDisplay] = useState<any>(null);
  const [clearFilter, setClearFilter] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

const toggleRow = (id: string, checked: boolean) => {
  setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(x => x !== id)));
};

// keep selection clean if the data changes
useEffect(() => {
  if (!notAssignData?.length) {
    setSelectedIds([]);
    return;
  }
  const valid = new Set(notAssignData.map((x: any) => x.id));
  setSelectedIds(prev => prev.filter(id => valid.has(id)));
}, [notAssignData]);

// --- action click ---
   const handleBulkAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) {
      toast.error("Please select an agent");
      return;
    }
    setFlyoutOpen(false);
    //return;
    try {
      await AxiosProvider.post("/leads/assigned/bulk", {
        lead_ids: selectedIds,
        agent_id: selectedAgent.id,
      });
      toast.success("Lead is Updated");
      setHitApi(!hitApi);
      setSelectedAgent(null);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    }
    // console.log("✅ Selected Agent Name:", selectedAgent.name);
    //  console.log("✅ Selected Agent ID:", selectedAgent.id);

    // Example: post to API
    // await AxiosProvider.post("/assign-agent", { agent_id: selectedAgent.id });
  };

  //  console.log("Debt Conolidation", debtConsolidation);
  //console.log("SELECTED DATA", selectedData);
  const storage = new StorageManager();
  const userRole = storage.getUserRole();
  //console.log("user role", userRole);
  const accessToken = storage.getAccessToken();

  //console.log("Get all user Data", data);
  const router = useRouter();

  const handleClick = async (customer: Lead) => {
    // console.log('Object customer data',customer.id)
    router.push(`/leadsdetails?id=${customer.id}`);
  };
  const LeadSchema = Yup.object({
    full_name: Yup.string().trim().required("Full name is required"),
    email: Yup.string()
      .trim()
      .email("Enter a valid email")
      .required("Email is required"),
    phone: Yup.string()
      .trim()
      .required("Phone number is required")
      .matches(
        /^(\+91)?[6-9][0-9]{9}$/,
        "Enter a valid phone number (with or without +91)"
      ),

    address_line1: Yup.string().nullable().notRequired(),
    address_line2: Yup.string().nullable().notRequired(),
    city: Yup.string().nullable().notRequired(),
    state: Yup.string().nullable().notRequired(),
    postal_code: Yup.string().nullable().notRequired(),
    country: Yup.string().nullable().notRequired(),

    lead_score: Yup.number()
      .transform((v, o) => (o === "" ? undefined : v))
      .typeError("Lead score must be a number")
      .nullable()
      .notRequired(),

    lead_quality: Yup.string().nullable().notRequired(),
    best_time_to_call: Yup.string().nullable().notRequired(),

    // Optional dropdown: show name, store id (can be empty)
    lead_source_id: Yup.string().nullable().notRequired(),
    debt_consolidation_status_id: Yup.string().nullable().notRequired(),
  });

  const handleCreateLead = async (value: CreateLead) => {
    setIsLoading(true);
    // setIsFilter(false);
    setFlyoutOpen(false);
    // console.log("4444444444444444", value);

    try {
      await AxiosProvider.post("/leads", value);
      toast.success("Lead is Creatted");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead is not Creatted");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateLead = async (value: CreateLead) => {
    setIsLoading(true);
    // setIsFilter(false);
    setFlyoutOpen(false);
    console.log("@@@@@@@@@@@@@", value);

    try {
      await AxiosProvider.post("/leads/update", value);
      toast.success("Lead is Updated");
      setHitApi(!hitApi);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!excelFile) return toast.error("Please select a file");

    // If lead source is mandatory, uncomment:
    // if (!leadSourceDisplay?.id) return toast.error("Please select a Lead Source");

    const formEl = e.currentTarget;

    try {
      setIsLoading(true);
      setFlyoutOpen(false);

      const fd = new FormData();
      fd.append("file", excelFile as File); // key = "file" (as before)
      if (leadSourceDisplay?.id != null) {
        fd.append("lead_source_id", String(leadSourceDisplay.id)); // add lead_source_id
      }
      // console.log("LLLLLLLLLLLLLLLLLLLL", leadSourceDisplay);

      const res = await fetch(
        "https://manageleadcrmbackend.dynsimulation.com/api/v1/managelead/leads/bulk/upload",
        {
          method: "POST",
          body: fd, // let the browser set multipart/form-data with boundary
        }
      );

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        throw new Error(
          (payload && (payload.message || payload.error)) ||
            (typeof payload === "string" ? payload : `HTTP ${res.status}`)
        );
      }

      toast.success("Bulk Lead is uploaded");
      setHitApi(!hitApi);
      setExcelFile(null);
      setLeadSourceDisplay(null);
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


  const createLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(true);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(false);
     setIsagentBulkCehckAssign(false)
  };
  const bulkLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(true);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(false);
     setIsagentBulkCehckAssign(false)
  };
  const filterLeads = () => {
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(true);
    setIsEditLead(false);
    setIsAgent(false);
     setIsagentBulkCehckAssign(false)
  };
  const editLead = (editData: CreateLead) => {
    setEditLeadData(editData);
    setFlyoutOpen(true);
    setIsEditLead(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsAgent(false);
     setIsagentBulkCehckAssign(false)
  };
  const assignAgent = (leadId: string) => {
    setCurrentLeadId(leadId);
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(true);
    setIsagentBulkCehckAssign(false)
  };
  const assignCheckBulklead = ()=>{
    //setCurrentLeadId(leadId);
    setFlyoutOpen(true);
    setIsCreateLeads(false);
    setIsBulkLeads(false);
    setIsFilter(false);
    setIsEditLead(false);
    setIsAgent(false);
    setIsagentBulkCehckAssign(true)
  }

  const unAssignfetchData = async () => {
    setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await AxiosProvider.get(
        `/leads/notassigned?page=${unAssignPage}&pageSize=${globalPageSize}`
      );
      // console.log("KKKKKKKKKKKKKKKKK", response.data.data.data);
      setUsAssignTotalPages(response.data.data.pagination.totalPages);
      const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
      setNotAssignData(result);
    } catch (error: any) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    unAssignfetchData();
  }, [unAssignPage, hitApi]);

    const assignfetchData = async () => {
   // setIsLoading(true);
    // setIsFilter(false);
    try {
      const response = await AxiosProvider.get(
        `/leads/assigned?page=${assignPage}&pageSize=${globalPageSize}`
      );
      // console.log("KKKKKKKKKKKKKKKKK", response.data.data.data);
      setassignTotalPages(response.data.data.pagination.totalPages);
      const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
      setAssignLeadData(result);
    } catch (error: any) {
      setIsError(true);
    }
  };

  useEffect(() => {
    assignfetchData();
  }, [assignPage, hitApi]);


  const leadSource = async () => {
    try {
      const response = await AxiosProvider.get("/leadsources");
      // console.log("KKKKKKKKMMMMMMM", response.data.data.data);
      setLeadSourceData(response.data.data.data);

      // const result = response.data.data.data;
      // console.log("ALL CRM USER", result);
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    leadSource();
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
  window.open(`/leadsdetails?id=${id}`, "_blank"); // "_blank" = new tab
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
  // fetch agents
  const fetchAgent = async () => {
    try {
      const res = await AxiosProvider.get("/allagents");
      // adjust this if your payload differs
      const list: Agent[] = res.data?.data?.data ?? [];
      setAgentList(list);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      setAgentList([]);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);
  const handleSubmitAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) {
      toast.error("Please select an agent");
      return;
    }
    setFlyoutOpen(false);
    //return;
    try {
      await AxiosProvider.post("/assignlead", {
        lead_id: currentLeadId,
        agent_id: selectedAgent.id,
      });
      toast.success("Lead is Updated");
      setHitApi(!hitApi);
      setSelectedAgent(null);
    } catch (error: any) {
      toast.error("Lead is not Updated");
    }
    // console.log("✅ Selected Agent Name:", selectedAgent.name);
    //  console.log("✅ Selected Agent ID:", selectedAgent.id);

    // Example: post to API
    // await AxiosProvider.post("/assign-agent", { agent_id: selectedAgent.id });
  };

  const deleteUserLead = async (deleteId: CreateLead) => {
    const userID = deleteId;
    console.log("LEAD DELETE ID", userID);

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
          await AxiosProvider.post("/leads/soft-delete", { id: userID });

          toast.success("Successfully Deleted");
          setHitApi(!hitApi);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user");
        }
      }
    });
  };
  const toCleanFilter = (raw: FilterValues) => {
    const out: Record<string, any> = {};
    Object.entries(raw).forEach(([k, v]) => {
      const t = String(v ?? "").trim();
      if (t !== "") out[k] = t;
    });
    return out;
  };


  // const handleNotAssign = async (values: FilterValues) => {
  //   console.log("FITLER VALUE NOT CLEAN", values);
   
  // };
  // you handle API/state with this
  // const handleAssign = async (values: FilterValues) => {
  //    console.log("FITLER VALUE NOT CLEAN", values);
    
  // };
  const clickedFilterClear = () => {
    setClearFilter(false);
    setHitApi(!hitApi);
       setUnAssignFilterPagination(false)
    setAssignFilterPagination(false)
    
  };
  // PAGINATION HANDLE CHANGES

      const handleUnAssignPagination = (newPage: number) => {
      
    if (newPage > 0 && newPage <= unAssignTotalPages) {
      setUnAssignPage(newPage);
    }
  };
        const handleUnAssignPaginationFilter = (newPage: number) => {
    if (newPage > 0 && newPage <= UnAssignTotalPagesFilter) {
      setUnAssignPageFilter(newPage);
    }
  };

      const handleAssignPagination = (newPage: number) => {
    if (newPage > 0 && newPage <= assignTotalPages) {
      setAssignPage(newPage);
    }
  };
      const handleAssignPaginationFilter = (newPage: number) => {
    if (newPage > 0 && newPage <= assignTotalPages) {
      setAssignPage(newPage);
    }
  };

    // END PAGINATION HANDLE CHANGES

    const provinceOptions = [
  { id: "alberta", name: "Alberta" },
  { id: "british-columbia", name: "British Columbia" },
  { id: "manitoba", name: "Manitoba" },
  { id: "new-brunswick", name: "New Brunswick" },
  { id: "newfoundland-labrador", name: "Newfoundland and Labrador" },
  { id: "northwest-territories", name: "Northwest Territories" },
  { id: "nova-scotia", name: "Nova Scotia" },
  { id: "nunavut", name: "Nunavut" },
  { id: "ontario", name: "Ontario" },
  { id: "prince-edward-island", name: "Prince Edward Island" },
  { id: "quebec", name: "Quebec" },
  { id: "saskatchewan", name: "Saskatchewan" },
  { id: "yukon", name: "Yukon" },
];

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

  //   function setFieldValue(arg0: string, arg1: any) {
  //     throw new Error("Function not implemented.");
  //   }

  // Removed duplicate setExcelFile function to fix identifier conflict.
  const tabs = [
    
    {
      label: "Unassign Leads",
      content: (
        <>
          {/* Tab content 3 */}
                       <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <thead className="text-xs text-[#999999] bg-white">
                  <tr className="border border-tableBorder">
                    <th
                      scope="col"
                      className="px-3 py-3 md:p-3 border border-tableBorder"
                    >
                      <div className="flex items-center gap-2">
                        <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className=" font-semibold text-secondBlack text-lg sm:text-base">
                          Select
                        </span>
                      </div>
                    </th>
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
                  {!notAssignData || notAssignData.length === 0 || isError ? (
                    <tr>
                      <td colSpan={8} className="text-center text-xl mt-5">
                        <div className="mt-5">Data not found</div>
                      </td>
                    </tr>
                  ) : (
                    notAssignData.map((item: any, index: number) => (
                      <tr
                        key={item?.id ?? index}
                        className="border border-tableBorder bg-white hover:bg-primary-100"
                      >
                        <td className="px-3 py-2 border border-tableBorder text-center">
  <input
    type="checkbox"
    className="accent-primary-600"
   checked={selectedIds.includes(item.id)}
   onChange={(e) => toggleRow(item.id, e.target.checked)}
  />
</td>
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
                            {/* <button
                              onClick={() => test(item.id)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                View Details
                              </span>
                            </button> */}
                            <button
                              onClick={() => editLead(item)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                Edit
                              </span>
                            </button>
                            {userRole === "Admin" && (
                              <button
                                onClick={() => assignAgent(item.id)}
                                className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                              >
                                <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                                <span className="text-xs sm:text-sm text-white hover:text-white">
                                  Assign to agent
                                </span>
                              </button>
                            )}
                            {userRole === "Admin" && (
                              <button
                                onClick={() => deleteUserLead(item.id)}
                                className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                              >
                                <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                                <span className="text-xs sm:text-sm text-white hover:text-white">
                                  Delete
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          {/* End Tab content 3 */}
          {/* UNASSIGN PAGINATION */}
          {unAssignFilterPagination ? 
     (   
          <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleUnAssignPaginationFilter(UnAssignPageFilter - 1)}
                disabled={UnAssignPageFilter === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#232323] text-sm">
                Page {UnAssignPageFilter} of {UnAssignTotalPagesFilter}
              </span>
              <button
                 onClick={() => handleUnAssignPaginationFilter(UnAssignPageFilter + 1)}
                disabled={UnAssignPageFilter === UnAssignTotalPagesFilter}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
          )
        :
                  (   
          <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleUnAssignPagination(unAssignPage - 1)}
                disabled={unAssignPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#232323] text-sm">
                Page {unAssignPage} of {unAssignTotalPages}
              </span>
              <button
                 onClick={() => handleUnAssignPagination(unAssignPage + 1)}
                disabled={unAssignPage === unAssignTotalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
            )
        }

          {/* END PAGINATION */}
        </>
      ),
      // End Tab content 2
    },
    {
      label: "Assign Leads",
      content: (
        <>
          {/* Tab content 3 */}

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
                      className="px-3 py-2 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <SiHomeassistantcommunitystore className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="font-semibold text-secondBlack text-lg sm:text-base">
                          Agent
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
                  {!assignLeadData || assignLeadData.length === 0 || isError ? (
                    <tr>
                      <td colSpan={8} className="text-center text-xl mt-5">
                        <div className="mt-5">Data not found</div>
                      </td>
                    </tr>
                  ) : (
                    assignLeadData.map((item: any, index: number) => (
                      <tr
                        key={item?.id ?? index}
                        className="border border-tableBorder bg-white hover:bg-primary-100"
                      >
                        {/* Full name */}
                        <td className="px-1 py-2 md:px-3 md:py-2 border-tableBorder flex items-center gap-2  bg-primary-500">
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
                            <div className="cursor-pointer"
                              onClick={() => test(item.id)}>
                              <p
                              className="text-white text-sm sm:text-base font-medium leading-normal capitalize">
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
                        <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                          <span className="text-[#232323] text-sm sm:text-base capitalize">
                            {item?.agent.name ?? "-"}
                          </span>
                        </td>
                        {/* Action */}
                        <td className="px-3 py-2 border border-tableBorder md:table-cell">
                          <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                            {/* <button
                              onClick={() => test(item.id)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                View Details
                              </span>
                            </button> */}
                            <button
                              onClick={() => editLead(item)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                Edit
                              </span>
                            </button>

                            {userRole === "Admin" && (
                              <button
                                onClick={() => deleteUserLead(item.id)}
                                className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                              >
                                <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                                <span className="text-xs sm:text-sm text-white hover:text-white">
                                  Delete
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

          {/* End Tab content 3 */}
          {assignFilterPagination ?
           ( 
           <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleAssignPaginationFilter(assignPageFilter - 1)}
                disabled={assignPageFilter === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#232323] text-sm">
                Page  {assignPageFilter} of {assignTotalPagesFilter}
              </span>
              <button
                 onClick={() => handleAssignPaginationFilter(assignPageFilter + 1)}
                disabled={assignPageFilter === assignTotalPagesFilter}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>
            ):
          (   
                     <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => handleAssignPagination(assignPage - 1)}
                disabled={assignPage === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className=" w-6 h-auto" />
              </button>
              <span className="text-[#232323] text-sm">
                Page  {assignPage} of {assignTotalPages}
              </span>
              <button
                 onClick={() => handleAssignPagination(assignPage + 1)}
                disabled={assignPage === assignTotalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className=" w-6 h-auto" />
              </button>
            </div>)
        }

        </>
      ),
    },
  ];
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
            <div className=" flex justify-between items-center mb-6  w-full mx-auto">
            <div>
                {selectedIds.length > 0 && (
                 <div className=" flex items-center ">
              {/* <button
                onClick={()=>assignCheckBulklead()}
                className="flex justify-center gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                title="Perform bulk action"
              >
                Bulk Checked Assign to Agent ({selectedIds.length})
              </button> */}
              {/* <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span> */}
             <div
                  className=" flex justify-center gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                 onClick={()=>assignCheckBulklead()}
                >
                  <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                  <p className=" text-white text-base font-medium group-hover:text-white">
                    Assign Agent Bulk ({selectedIds.length})
                  </p>

                </div>
            </div>
)}
              </div>
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

                {userRole === "Admin" && (
                  <div
                    className=" flex justify-center  gap-2 py-3 px-6 rounded-[4px] border border-[#E7E7E7] cursor-pointer bg-primary-600 items-center hover:bg-primary-500 active:bg-primary-700 group"
                    onClick={() => bulkLeads()}
                  >
                    <FiFilter className=" w-5 h-5 text-white group-hover:text-white" />
                    <p className=" text-white text-base font-medium group-hover:text-white">
                      Bulk Leads
                    </p>
                  </div>
                )}

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
                 <div className="w-full overflow-x-auto custom-scrollbar">
              {clearFilter && (
                <button
                  type="button"
                  onClick={() => clickedFilterClear()}
                  className="flex items-center gap-2 text-primary-600 text-sm font-medium transition-colors p-1 border border-primary-500 rounded mb-2"
                >
                  <span>Clear Filter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

            </div>
            {/* Show Applied Filters */}
            {userRole === "Admin" && (
    <Tabs tabs={tabs} />
            )}
        {userRole === "Agent" && 
        (
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
                  {!assignLeadData || assignLeadData.length === 0 || isError ? (
                    <tr>
                      <td colSpan={8} className="text-center text-xl mt-5">
                        <div className="mt-5">Data not found</div>
                      </td>
                    </tr>
                  ) : (
                    assignLeadData.map((item: any, index: number) => (
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
                            <div 
                             onClick={() => test(item.id)}
                            >
                              <p className="text-[#232323] text-sm sm:text-base font-medium leading-normal capitalize cursor-pointer">
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
                            {/* <button
                              onClick={() => test(item.id)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                View Details
                              </span>
                            </button> */}
                             {/* <button
                              onClick={() => assignAgent(item.id)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                Assign to agent
                              </span>
                            </button> */}
                            <button
                              onClick={() => editLead(item)}
                              className="py-1 px-3 bg-black hover:bg-viewDetailHover active:bg-viewDetailPressed flex gap-2 items-center rounded-xl"
                            >
                              <MdRemoveRedEye className="text-white w-4 h-4 hover:text-white" />
                              <span className="text-xs sm:text-sm text-white hover:text-white">
                                Edit
                              </span>
                            </button>

                           
                      
                            
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
        )

        }
       {userRole === "Agent" && (
        <>
        {assignFilterPagination ? (
      <div className="flex justify-center items-center my-10 relative">
        <button
          onClick={() => handleAssignPaginationFilter(assignPageFilter - 1)}
          disabled={assignPageFilter === 1}
          className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiChevronDoubleLeft className="w-6 h-auto" />
        </button>
        <span className="text-[#232323] text-sm">
          Page {assignPageFilter} of {assignTotalPagesFilter}
        </span>
        <button
          onClick={() => handleAssignPaginationFilter(assignPageFilter + 1)}
          disabled={assignPageFilter === assignTotalPagesFilter}
          className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiChevronDoubleRight className="w-6 h-auto" />
        </button>
      </div>
    ) : (
      <div className="flex justify-center items-center my-10 relative">
        <button
          onClick={() => handleAssignPagination(assignPage - 1)}
          disabled={assignPage === 1}
          className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiChevronDoubleLeft className="w-6 h-auto" />
        </button>
        <span className="text-[#232323] text-sm">
          Page {assignPage} of {assignTotalPages}
        </span>
        <button
          onClick={() => handleAssignPagination(assignPage + 1)}
          disabled={assignPage === assignTotalPages}
          className="px-2 py-2 mx-2 border rounded bg-primary-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiChevronDoubleRight className="w-6 h-auto" />
        </button>
      </div>
    )}
  </>
)}

            {/* ---------------- Table--------------------------- */}
       

            {/* ----------------End table------------------------ */}
          </div>
          {/* Pagination Controls */}

      
          {/* ----------------End prgination--------------------------- */}

          {/* <div className="w-full h-24 bg-header-gradient opacity-20 absolute top-0 left-0 right-0 "></div> */}
        </div>
      </div>
      {/* START FLYOUT */}
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
                  debt_consolidation_status_id: "", // ✅ NEW
                  whatsapp_number: "", // ✅ NEW
                    agent_id: "", // 👈 NEW
                  consolidated_credit_status_id: "",
                   

                }}
                validationSchema={LeadSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  // Use `any` to avoid TS complaints about optional fields on a "Create" type
                  const value: any /* CreateLead */ = {
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

                    // ✅ NEW fields
                    debt_consolidation_status_id:
                      values.debt_consolidation_status_id,
                    whatsapp_number: values.whatsapp_number,
                     agent_id: values.agent_id || undefined, // 👈 NEW
                    consolidated_credit_status_id:
                      values.consolidated_credit_status_id || undefined, // ✅ NEW

                    // keep whatever you already do here
                    id: "",
                  };

                  handleCreateLead(value);
                  setSubmitting(false);
                  resetForm();
                }}
              >
                {({
                  handleSubmit,
                  isSubmitting,
                  values,
                  setFieldValue,
                  setFieldTouched,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <div className="w-full">
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
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
  <p className="text-secondBlack text-base leading-6 mb-2">
    Province
  </p>
  <Select
    value={
      provinceOptions.find(
        (opt) => opt.id === values.lead_source_id
      ) || null
    }
    onChange={(selected: any) =>
      setFieldValue(
        "lead_source_id",
        selected ? selected.id : ""
      )
    }
    onBlur={() => setFieldTouched("lead_source_id", true)}
    getOptionLabel={(opt: any) => opt.name}
    getOptionValue={(opt: any) => opt.id}
    options={provinceOptions}
    placeholder="Select Province"
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
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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

                        {/* Lead Source (Dropdown) */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            Lead Source
                          </p>
                          <Select
                            value={
                              (leadSourceData || []).find(
                                (opt: any) => opt.id === values.lead_source_id
                              ) || null
                            }
                            onChange={(selected: any) =>
                              setFieldValue(
                                "lead_source_id",
                                selected ? selected.id : ""
                              )
                            }
                            onBlur={() =>
                              setFieldTouched("lead_source_id", true)
                            }
                            getOptionLabel={(opt: any) => opt.name}
                            getOptionValue={(opt: any) => opt.id}
                            options={leadSourceData}
                            placeholder="Select Lead Source"
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
                                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
                        </div>

                        {/* WhatsApp Number */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            WhatsApp Number
                          </p>
                          <Field
                            type="text"
                            name="whatsapp_number"
                            placeholder="+91 9XXXXXXXXX"
                            className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                          />
                          <ErrorMessage
                            name="whatsapp_number"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        {/* Assign to Agent */}
<div className="w-full">
  <p className="text-secondBlack text-base leading-6 mb-2">
    Assign to Agent
  </p>
  <Select
    value={(agentList || []).find((opt: any) => String(opt.id) === String(values.agent_id)) || null}
    onChange={(selected: any) => setFieldValue("agent_id", selected ? selected.id : "")}
    onBlur={() => setFieldTouched("agent_id", true)}
    getOptionLabel={(opt: any) => opt.name}
    getOptionValue={(opt: any) => String(opt.id)}
    options={agentList}
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
  <ErrorMessage
    name="agent_id"
    component="div"
    className="text-red-500 text-xs mt-1"
  />
</div>


                        {/* Debt Consolidation Status (Dropdown) */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            Debt Consolidation Status
                          </p>
                          <Select
                            value={
                              (debtConsolidation || []).find(
                                (opt: any) =>
                                  opt.id === values.debt_consolidation_status_id
                              ) || null
                            }
                            onChange={(selected: any) =>
                              setFieldValue(
                                "debt_consolidation_status_id",
                                selected ? selected.id : ""
                              )
                            }
                            onBlur={() =>
                              setFieldTouched(
                                "debt_consolidation_status_id",
                                true
                              )
                            }
                            getOptionLabel={(opt: any) => opt.name}
                            getOptionValue={(opt: any) => opt.id}
                            options={debtConsolidation}
                            placeholder="Select Debt Consolidation Status"
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
                                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
                          <ErrorMessage
                            name="debt_consolidation_status_id"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        {/* Consolidated Credit Status (Dropdown) */}
                        <div className="w-full">
                          <p className="text-secondBlack text-base leading-6 mb-2">
                            Consolidated Credit Status
                          </p>
                          <Select
                            value={
                              (consolidationData || []).find(
                                (opt: any) =>
                                  opt.id ===
                                  values.consolidated_credit_status_id
                              ) || null
                            }
                            onChange={(selected: any) =>
                              setFieldValue(
                                "consolidated_credit_status_id",
                                selected ? selected.id : ""
                              )
                            }
                            onBlur={() =>
                              setFieldTouched(
                                "consolidated_credit_status_id",
                                true
                              )
                            }
                            getOptionLabel={(opt: any) => opt.name}
                            getOptionValue={(opt: any) => opt.id}
                            options={consolidationData}
                            placeholder="Select Consolidated Credit Status"
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
                                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
                          <ErrorMessage
                            name="consolidated_credit_status_id"
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

                  {/* Lead Source Dropdown */}
                  <div className="w-full mb-4">
                    <p className="text-secondBlack text-base leading-6 mb-2">
                      Lead Source
                    </p>
                    <Select
                      value={leadSourceDisplay}
                      onChange={(selected: any) =>
                        setLeadSourceDisplay(selected)
                      }
                      getOptionLabel={(opt: any) => opt.name}
                      getOptionValue={(opt: any) => String(opt.id)}
                      options={leadSourceData}
                      placeholder="Select Lead Source"
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
                          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
             <Formik
  enableReinitialize
  initialValues={{
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    phone: "",
    lead_number: "",
    city: "",
    state: "",
    agent_id: "",
    lead_source_id: "",
    debt_consolidation_status_id: "",
    consolidated_credit_status_id: "",
  }}
  onSubmit={() => {
    // no-op: buttons handle submission separately
  }}
>
  {({ handleSubmit, values, setFieldValue, setFieldTouched, isSubmitting }) => {
    const norm = (v: any) => String(v ?? "").toLowerCase();

    const leadSourceDisplay = values.lead_source_id
      ? (leadSourceData || []).find(
          (o: any) => norm(o.id) === norm(values.lead_source_id)
        ) || null
      : null;

    const debtDisplay = values.debt_consolidation_status_id
      ? (debtConsolidation || []).find(
          (o: any) =>
            norm(o.id) === norm(values.debt_consolidation_status_id)
        ) || null
      : null;
      const agentDisplay = values.agent_id
  ? (agentList || []).find((o: any) => norm(o.id) === norm(values.agent_id)) || null
  : null;

    const creditDisplay = values.consolidated_credit_status_id
      ? (consolidationData || []).find(
          (o: any) =>
            norm(o.id) === norm(values.consolidated_credit_status_id)
        ) || null
      : null;

    // 🔹 handlers
    const handleUnassignFilter = async () => {
      console.log("NotAssign values:", values);
       const clean = toCleanFilter(values);
    if (Object.keys(clean).length === 0) {
      toast.error("Please fill at least one field before submitting.");
      return;
    }
    //console.log("FILTER VALUES (clean):", clean);
    // e.g. setFilters(clean); fetchList(1, clean);
    try {
      const response = await AxiosProvider.post(
        `/notassignedleads/filter?page=${UnAssignPageFilter}&pageSize=${globalPageSize}`,
        values
      );
      console.log("NOT ASSIGN FILTERED VALUE", response);
      setUnAssignTotalPagesFilter(response.data.data.pagination.totalPages)
     setNotAssignData(response.data.data.data)
      setFlyoutOpen(false);
      //  toast.success("Lead is Creatted");
      //setHitApi(!hitApi);
      setClearFilter(true);
      setUnAssignFilterPagination(true)
    } catch (error: any) {
      toast.error("Lead is not Created");
    } finally {
      setIsLoading(false);
    }
    };

    const handleAssignFilter = async() => {
      console.log("Assign values:", values);
     const clean = toCleanFilter(values);
    if (Object.keys(clean).length === 0) {
      toast.error("Please fill at least one field before submitting.");
      return;
    }
    //console.log("FILTER VALUES (clean):", clean);
    // e.g. setFilters(clean); fetchList(1, clean);
    try {
      const response = await AxiosProvider.post(
         `/leads/filter?page=${page}&pageSize=${pageSize}`,
       //  `/leads/filter`,
        values
      );
      console.log("FILTERED VALUE", response.data.data.data);
     setAssignLeadData(response.data.data.data)
      setFlyoutOpen(false);
      //  toast.success("Lead is Creatted");
      //setHitApi(!hitApi);
      setClearFilter(true);
      setAssignFilterPagination(true)
    } catch (error: any) {
      toast.error("Lead is not Created");
    } finally {
      setIsLoading(false);
    }
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="w-full">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

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
            </div>

            {/* Lead Number */}
            <div className="w-full">
              <p className="text-secondBlack  text-base leading-6 mb-2">
                Lead Number
              </p>
              <Field
                type="text"
                name="lead_number"
                placeholder="LN-000123"
                className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
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
            </div>

            {/* Agent ID */}
{/* Agent */}
<div className="w-full">
  <p className="text-secondBlack  text-base leading-6 mb-2">Agent</p>
  <Select
    value={agentDisplay}
    onChange={(selected: any) =>
      setFieldValue("agent_id", selected ? selected.id : "")
    }
    onBlur={() => setFieldTouched("agent_id", true)}
    getOptionLabel={(opt: any) => opt.name}
    getOptionValue={(opt: any) => String(opt.id)}
    options={agentList}
    placeholder="Select Agent"
    isClearable
    classNames={{
      control: ({ isFocused }: any) =>
        `onHoverBoxShadow !w-full !border-[0.4px] !rounded-[4px] !text-sm !leading-4 !font-medium !py-1.5 !px-1 !bg-white !shadow-sm ${
          isFocused ? "!border-primary-500" : "!border-[#DFEAF2]"}`
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
</div>


            {/* Lead Source */}
            <div className="w-full">
              <p className="text-secondBlack text-base leading-6 mb-2">
                Lead Source
              </p>
              <Select
                value={leadSourceDisplay}
                onChange={(selected: any) =>
                  setFieldValue("lead_source_id", selected ? selected.id : "")
                }
                onBlur={() => setFieldTouched("lead_source_id", true)}
                getOptionLabel={(opt: any) => opt.name}
                getOptionValue={(opt: any) => String(opt.id)}
                options={leadSourceData}
                placeholder="Select Lead Source"
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
            </div>

            {/* Debt Consolidation Status */}
            <div className="w-full">
              <p className="text-secondBlack text-base leading-6 mb-2">
                Debt Consolidation Status
              </p>
              <Select
                value={debtDisplay}
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
            </div>

            {/* Consolidated Credit Status */}
            <div className="w-full">
              <p className="text-secondBlack text-base leading-6 mb-2">
                Consolidated Credit Status
              </p>
              <Select
                value={creditDisplay}
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
                placeholder="Select Consolidated Credit Status"
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
            </div>
          </div>
        </div>

        <div className=" flex gap-2">
          {userRole === "Admin" && 
          (          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleUnassignFilter}
            className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
          >
            Filter UnAssign leads
          </button>)}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAssignFilter}
            className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
          >
            Filter Assign leads
          </button>
        </div>
      </form>
    );
  }}
</Formik>


              {/* { END FROM } */}
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
              <Formik
                enableReinitialize
                initialValues={{
                  id: editLeadData?.id ?? "",
                  full_name: editLeadData?.full_name ?? "",
                  email: editLeadData?.email ?? "",
                  phone: editLeadData?.phone ?? "",
                  whatsapp_number: editLeadData?.whatsapp_number ?? "", // same as create
                  address_line1: editLeadData?.address?.line1 ?? "",
                  address_line2: editLeadData?.address?.line2 ?? "",
                  city: editLeadData?.address?.city ?? "",
                  state: editLeadData?.address?.state ?? "",
                  postal_code: editLeadData?.address?.postal_code ?? "",
                  country: editLeadData?.address?.country ?? "",
                  lead_score:
                    typeof editLeadData?.lead_score === "number"
                      ? editLeadData.lead_score
                      : undefined,
                  lead_quality: editLeadData?.lead_quality ?? "",
                  best_time_to_call: editLeadData?.best_time_to_call ?? "",

                  // keep these EMPTY so submitting without change won't update:
                  lead_source_id: "",
                  debt_consolidation_status_id: "",
                  consolidated_credit_status_id: "",
                }}
                validationSchema={LeadSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  const value: CreateLead = {
                    id: values.id,
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone || undefined,
                    whatsapp_number: values.whatsapp_number || undefined,
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
                    consolidated_credit_status_id:
                      values.consolidated_credit_status_id || undefined,
                  };

                  handleUpdateLead(value);
                  setSubmitting(false);
                  resetForm();
                }}
              >
                {({
                  handleSubmit,
                  values,
                  setFieldValue,
                  setFieldTouched,
                  isSubmitting,
                }) =>
                  (() => {
                    const norm = (v: any) => String(v ?? "").toLowerCase();

                    // Prefill displays (show existing value until user picks something new)
                    const leadSourcePrefill = editLeadData?.lead_source; // id | name | {id,name}
                    const leadSourceDisplay = values.lead_source_id
                      ? (leadSourceData || []).find(
                          (o: any) => norm(o.id) === norm(values.lead_source_id)
                        ) || null
                      : (leadSourceData || []).find(
                          (o: any) =>
                            norm(o.id) ===
                              norm(
                                (leadSourcePrefill as any)?.id ??
                                  leadSourcePrefill
                              ) ||
                            norm(o.name) ===
                              norm(
                                (leadSourcePrefill as any)?.name ??
                                  leadSourcePrefill
                              )
                        ) || null;

                    const debtPrefill = editLeadData?.debt_consolidation_status; // id | name | {id,name}
                    const debtDisplay = values.debt_consolidation_status_id
                      ? (debtConsolidation || []).find(
                          (o: any) =>
                            norm(o.id) ===
                            norm(values.debt_consolidation_status_id)
                        ) || null
                      : (debtConsolidation || []).find(
                          (o: any) =>
                            norm(o.id) ===
                              norm((debtPrefill as any)?.id ?? debtPrefill) ||
                            norm(o.name) ===
                              norm((debtPrefill as any)?.name ?? debtPrefill)
                        ) || null;

                    const creditPrefill =
                      editLeadData?.consolidated_credit_status; // id | name | {id,name}
                    const creditDisplay = values.consolidated_credit_status_id
                      ? (consolidationData || []).find(
                          (o: any) =>
                            norm(o.id) ===
                            norm(values.consolidated_credit_status_id)
                        ) || null
                      : (consolidationData || []).find(
                          (o: any) =>
                            norm(o.id) ===
                              norm(
                                (creditPrefill as any)?.id ?? creditPrefill
                              ) ||
                            norm(o.name) ===
                              norm(
                                (creditPrefill as any)?.name ?? creditPrefill
                              )
                        ) || null;

                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="w-full">
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          


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

                            {/* WhatsApp Number */}
                            <div className="w-full">
                              <p className="text-secondBlack text-base leading-6 mb-2">
                                WhatsApp Number
                              </p>
                              <Field
                                type="text"
                                name="whatsapp_number"
                                placeholder="+91 9XXXXXXXXX"
                                className="hover:shadow-hoverInputShadow focus-border-primary w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 font-medium placeholder-[#717171] py-4 px-4 text-firstBlack"
                              />
                              <ErrorMessage
                                name="whatsapp_number"
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

                            {/* Lead Source */}
                            <div className="w-full">
                              <p className="text-secondBlack text-base leading-6 mb-2">
                                Lead Source
                              </p>
                              <Select
                                value={leadSourceDisplay}
                                onChange={(selected: any) =>
                                  setFieldValue(
                                    "lead_source_id",
                                    selected ? selected.id : ""
                                  )
                                }
                                onBlur={() =>
                                  setFieldTouched("lead_source_id", true)
                                }
                                getOptionLabel={(opt: any) => opt.name}
                                getOptionValue={(opt: any) => String(opt.id)}
                                options={leadSourceData}
                                placeholder="Select Lead Source"
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
                                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
                            </div>

                            {/* Debt Consolidation Status */}
                            <div className="w-full">
                              <p className="text-secondBlack text-base leading-6 mb-2">
                                Debt Consolidation Status
                              </p>
                              <Select
                                value={debtDisplay}
                                onChange={(selected: any) =>
                                  setFieldValue(
                                    "debt_consolidation_status_id",
                                    selected ? selected.id : ""
                                  )
                                }
                                onBlur={() =>
                                  setFieldTouched(
                                    "debt_consolidation_status_id",
                                    true
                                  )
                                }
                                getOptionLabel={(opt: any) => opt.name}
                                getOptionValue={(opt: any) => String(opt.id)}
                                options={debtConsolidation} // same as create
                                placeholder="Select Debt Consolidation Status"
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
                                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
                            </div>

                            {/* Consolidated Credit Status */}
                            <div className="w-full">
                              <p className="text-secondBlack text-base leading-6 mb-2">
                                Consolidated Credit Status
                              </p>
                              <Select
                                value={creditDisplay}
                                onChange={(selected: any) =>
                                  setFieldValue(
                                    "consolidated_credit_status_id",
                                    selected ? selected.id : ""
                                  )
                                }
                                onBlur={() =>
                                  setFieldTouched(
                                    "consolidated_credit_status_id",
                                    true
                                  )
                                }
                                getOptionLabel={(opt: any) => opt.name}
                                getOptionValue={(opt: any) => String(opt.id)}
                                options={consolidationData} // same as create
                                placeholder="Select Consolidated Credit Status"
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
                                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
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
                            </div>
                          </div>
                        </div>

                        {/* END FORM */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                        >
                          Update Leads
                        </button>
                      </form>
                    );
                  })()
                }
              </Formik>

              {/* END FORM */}
            </div>
          )}
          {isAgent && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Assign to Agent
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}
              <form onSubmit={handleSubmitAgent} className="w-full space-y-4">
                {/* Agent Dropdown */}
                <div className="w-full">
                  <p className="text-secondBlack text-base leading-6 mb-2">
                    Assign to Agent
                  </p>
                  <Select
                    value={selectedAgent} // show selected agent
                    onChange={(selected: any) => setSelectedAgent(selected)}
                    options={agentList} // list from API
                    getOptionLabel={(opt: Agent) => opt.name} // show agent name
                    getOptionValue={(opt: Agent) => String(opt.id)} // use id as value
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
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                >
                  Assign to Agent
                </button>
              </form>
              {/* END FORM */}
            </div>
          )}
          {isAgentBulkCheckAssign && (
            <div className=" w-full min-h-auto">
              {/* Flyout content here */}
              <div className=" flex justify-between mb-4">
                <p className=" text-primary-600 text-[26px] font-bold leading-9">
                  Assign to Agent
                </p>
                <IoCloseOutline
                  onClick={() => setFlyoutOpen(false)}
                  className=" h-8 w-8 border border-[#E7E7E7] text-secondBlack rounded cursor-pointer"
                />
              </div>
              <div className=" w-full border-b border-[#E7E7E7] mb-4"></div>
              {/* FORM */}
              <form onSubmit={handleBulkAction} className="w-full space-y-4">
                {/* Agent Dropdown */}
                <div className="w-full">
                  <p className="text-secondBlack text-base leading-6 mb-2">
                    Assign to Agent
                  </p>
                  <Select
                    value={selectedAgent} // show selected agent
                    onChange={(selected: any) => setSelectedAgent(selected)}
                    options={agentList} // list from API
                    getOptionLabel={(opt: Agent) => opt.name} // show agent name
                    getOptionValue={(opt: Agent) => String(opt.id)} // use id as value
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
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="py-[13px] px-[26px] bg-primary-500 rounded-[4px] text-base font-medium leading-6 text-white hover:text-dark cursor-pointer w-full text-center hover:bg-primary-700 hover:text-white"
                >
                  Assign to Agent Check Bulk
                </button>
              </form>
              {/* END FORM */}
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

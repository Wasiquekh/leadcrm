"use client";

import React, { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";

/** ====== Types ====== */
interface LeadSource {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
interface Agent {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  created_at: string;
  updated_at: string;
}
interface Consolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
interface DebtConsolidation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
interface SearchLeadProps {
  setSearchedData: React.Dispatch<React.SetStateAction<any[]>>; 
  closeFlyOut: () => void;
}
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

const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#000",
    color: "#fff",
    borderColor: "#444",
    padding: "4px",
  }),
  singleValue: (base: any) => ({ ...base, color: "#fff" }),
  input: (base: any) => ({ ...base, color: "#fff" }),
  placeholder: (base: any) => ({ ...base, color: "#bbb" }),
  menu: (base: any) => ({ ...base, backgroundColor: "#000" }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isSelected ? "#222" : isFocused ? "#333" : "#000",
    color: "#fff",
  }),
};

const SearchLead: React.FC<SearchLeadProps> = ({ setSearchedData, closeFlyOut }) => {
  const [leadSourceData, setLeadSourceData] = useState<LeadSource[]>([]);
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [debtConsolidation, setDebtConsolidation] = useState<DebtConsolidation[]>([]);
  const [consolidationData, setConsolidationData] = useState<Consolidation[]>([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ls, ag, cons, debt] = await Promise.all([
          AxiosProvider.get("/leadsources"),
          AxiosProvider.get("/allagents"),
          AxiosProvider.get("/getconsolidation"),
          AxiosProvider.get("/leaddebtstatuses"),
        ]);

        setLeadSourceData(ls?.data?.data?.data ?? []);
        setAgentList(ag?.data?.data?.data ?? []);
        setConsolidationData(cons?.data?.data?.data ?? []);
        setDebtConsolidation(debt?.data?.data?.data ?? []);
      } catch (err) {
        console.error("Dropdown fetch failed:", err);
        toast.error("Failed to load filters.");
      }
    };
    fetchAll();
  }, []);

  /** Normalize empty string -> undefined for a clean payload */
  const normalize = (obj: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (v === "") out[k] = undefined;
      else if (typeof v === "string") out[k] = v.trim() === "" ? undefined : v.trim();
      else out[k] = v;
    });
    return out;
  };

  /** -------- handleSearch: just logs to console for now -------- */
  const handleSearch = async(rawValues: any) => {
    const payload = normalize(rawValues);
    console.log("🔎 Search payload:", payload);
        try {
    const res =  await AxiosProvider.post("/leads/filter", payload);
     // toast.success("Lead is Created");
     console.log("dfdjdvjvjvjbjddj",res);

      closeFlyOut()
     // setHitApi(!hitApi);
    } catch (error: any) {
      toast.error(error.response.data.msg);
    //  console.log("lead create error",error.response.data.msg)
    } 
    // later: call your API with `payload`
  };

  // Yup: require at least one field filled
  const SearchSchema = Yup.object()
    .shape({
      full_name: Yup.string().trim().optional(),
      email: Yup.string().trim().email("Enter a valid email").optional(),
      phone: Yup.string()
        .trim()
        .matches(/^(\+91)?[0-9]{7,14}$/, "Enter a valid phone (with/without +91)")
        .optional(),
      whatsapp_number: Yup.string()
        .trim()
        .matches(/^(\+91)?[0-9]{7,14}$/, "Enter a valid WhatsApp (with/without +91)")
        .optional(),
      state: Yup.string().optional(),
      lead_source_id: Yup.string().optional(),
      agent_id: Yup.string().optional(),
      debt_consolidation_status_id: Yup.string().optional(),
      consolidated_credit_status_id: Yup.string().optional(),
    })
    .test("at-least-one", "Enter at least one field to search.", (values) => {
      if (!values) return false;
      const keys = [
        "full_name",
        "email",
        "phone",
        "whatsapp_number",
        "state",
        "lead_source_id",
        "agent_id",
        "debt_consolidation_status_id",
        "consolidated_credit_status_id",
      ];
      return keys.some((k) => {
        const v = (values as any)[k];
        return v !== undefined && v !== null && String(v).trim() !== "";
      });
    });

  return (
    <div className="w-full min-h-auto p-4 bg-black text-white rounded-md">
      <div className="flex items-center justify-between mb-4">
        <p className="text-primary-500 text-2xl font-bold leading-9">Search Leads</p>
      </div>
      <div className="w-full border-b border-gray-700 mb-4" />

      <Formik
        initialValues={{
          full_name: "",
          email: "",
          phone: "",
          whatsapp_number: "",
          state: "",
          lead_source_id: "",
          agent_id: "",
          debt_consolidation_status_id: "",
          consolidated_credit_status_id: "",
        }}
        validationSchema={SearchSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleSearch(values);     // <-- your function here
          setSubmitting(false);
        }}
      >
        {({ handleSubmit, isSubmitting, values, setFieldValue, setFieldTouched }) => (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <p className="text-white mb-2">Full Name</p>
                <Field
                  type="text"
                  name="full_name"
                  placeholder="Alexandre Dumas"
                  className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
                />
              </div>

              {/* Email */}
              <div>
                <p className="text-white mb-2">Email</p>
                <Field
                  type="email"
                  name="email"
                  placeholder="alexandre@example.com"
                  className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
                />
              </div>

              {/* Phone */}
              <div>
                <p className="text-white mb-2">Phone</p>
                <Field
                  type="text"
                  name="phone"
                  placeholder="+91 9XXXXXXXXX"
                  className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <p className="text-white mb-2">WhatsApp Number</p>
                <Field
                  type="text"
                  name="whatsapp_number"
                  placeholder="+91 9XXXXXXXXX"
                  className="w-full border border-gray-700 rounded-[4px] bg-black text-white text-sm px-4 py-3"
                />
              </div>

              {/* Province / State */}
              <div>
                <p className="text-white mb-2">Province</p>
                <Select
                  value={provinceOptions.find((opt) => opt.id === values.state) || null}
                  onChange={(selected: any) => setFieldValue("state", selected ? selected.id : "")}
                  onBlur={() => setFieldTouched("state", true)}
                  getOptionLabel={(opt: any) => opt.name}
                  getOptionValue={(opt: any) => opt.id}
                  options={provinceOptions}
                  placeholder="Select Province"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              {/* Lead Source */}
              <div>
                <p className="text-white mb-2">Lead Source</p>
                <Select
                  value={leadSourceData.find((opt) => opt.id === values.lead_source_id) || null}
                  onChange={(selected: any) =>
                    setFieldValue("lead_source_id", selected ? selected.id : "")
                  }
                  onBlur={() => setFieldTouched("lead_source_id", true)}
                  getOptionLabel={(opt: any) => opt.name}
                  getOptionValue={(opt: any) => opt.id}
                  options={leadSourceData}
                  placeholder="Select Lead Source"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              {/* Agent */}
              <div>
                <p className="text-white mb-2">Agent</p>
                <Select
                  value={agentList.find((opt) => opt.id === values.agent_id) || null}
                  onChange={(selected: any) => setFieldValue("agent_id", selected ? selected.id : "")}
                  onBlur={() => setFieldTouched("agent_id", true)}
                  getOptionLabel={(opt: any) => opt.name}
                  getOptionValue={(opt: any) => opt.id}
                  options={agentList}
                  placeholder="Select Agent"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              {/* Debt Consolidation Status */}
              <div>
                <p className="text-white mb-2">Debt Consolidation Status</p>
                <Select
                  value={
                    debtConsolidation.find(
                      (opt) => opt.id === values.debt_consolidation_status_id
                    ) || null
                  }
                  onChange={(selected: any) =>
                    setFieldValue(
                      "debt_consolidation_status_id",
                      selected ? selected.id : ""
                    )
                  }
                  onBlur={() => setFieldTouched("debt_consolidation_status_id", true)}
                  getOptionLabel={(opt: any) => opt.name}
                  getOptionValue={(opt: any) => opt.id}
                  options={debtConsolidation}
                  placeholder="Select Debt Consolidation Status"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              {/* Consolidated Credit Status */}
              <div>
                <p className="text-white mb-2">Consolidated Credit Status</p>
                <Select
                  value={
                    consolidationData.find(
                      (opt) => opt.id === values.consolidated_credit_status_id
                    ) || null
                  }
                  onChange={(selected: any) =>
                    setFieldValue(
                      "consolidated_credit_status_id",
                      selected ? selected.id : ""
                    )
                  }
                  onBlur={() => setFieldTouched("consolidated_credit_status_id", true)}
                  getOptionLabel={(opt: any) => opt.name}
                  getOptionValue={(opt: any) => opt.id}
                  options={consolidationData}
                  placeholder="Select Consolidated Credit Status"
                  isClearable
                  styles={selectStyles}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 bg-primary-500 rounded-[4px] text-white text-base font-medium hover:bg-primary-600"
              >
                {isSubmitting ? "Searching..." : "Search"}
              </button>
              <button
                type="reset"
                className="px-5 py-3 bg-gray-800 border border-gray-700 rounded-[4px] text-white text-base font-medium hover:bg-gray-700"
              >
                Clear
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {/* Tip: Enter any one field (e.g., email or phone) to run a search. */}
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SearchLead;

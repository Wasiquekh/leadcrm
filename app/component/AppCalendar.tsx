"use client";

import React, { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";
import { RxAvatar } from "react-icons/rx";
import { HiOutlineBookOpen } from "react-icons/hi";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { LiaArrowCircleDownSolid } from "react-icons/lia";

type Props = { leadId: string; reloadKey?: number; hitApi: boolean };

export interface TaskData {
  id: string;
  assigned_agent_id: string;
  associated_lead: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  details: string;
  location: string;
  organizer_name: string;
  owner_name: string;
  remaining_label: string;
  remaining_minutes: number;
  start_at: string;
  start_at_ist: string;
  end_at: string;
  end_at_ist: string;
  status: string; // just string now
  subject: string;
  timer_hours: number;
  timer_minutes: number;
  type: string; // just string now
}

export default function AppCalendar({ leadId, reloadKey = 0, hitApi }: Props) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  // console.log("TASK LIST", tasks);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await AxiosProvider.post("/leads/tasks/list", {
          lead_id: leadId,
        });
        console.log("FETCH DATA FROM API", res.data.data.task);

        setTasks(res.data.data.task);
      } catch (e) {
        console.error("Error fetching tasks:", e);
      }
    };

    if (leadId) fetchTasks();
  }, [leadId, reloadKey, hitApi]);
  // helper (place above the component or inside it)
  const statusClasses = (s?: string) => {
    const x = (s || "").toLowerCase();
    if (x === "completed" || x === "done")
      return "bg-green-100 text-green-700 border-green-200";
    if (x === "pending" || x === "due")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (x === "cancelled" || x === "canceled" || x === "failed")
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
        <thead className="text-xs text-[#999999] bg-white">
          <tr className="border border-tableBorder">
            {/* Full Name */}
            <th
              scope="col"
              className="px-3 py-3 md:p-3 border border-tableBorder"
            >
              <div className="flex items-center gap-2">
                <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className=" font-semibold text-secondBlack text-lg sm:text-base">
                  Start Date
                </span>
              </div>
            </th>

            {/* Last Name */}
            <th
              scope="col"
              className="px-3 py-2 border border-tableBorder hidden md:table-cell"
            >
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Subject
                </span>
              </div>
            </th>

            {/* Due at IST */}
            <th
              scope="col"
              className="px-3 py-2 border border-tableBorder hidden md:table-cell"
            >
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Status
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {!tasks || tasks.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-xl mt-5 py-6">
                <div className="mt-2">Data not found</div>
              </td>
            </tr>
          ) : (
            tasks.map((t, index) => (
              <tr
                key={t?.id ?? index}
                className="border border-tableBorder bg-white hover:bg-primary-100"
              >
                {/* Start Date */}
                <td className="px-1 py-2 md:px-3 md:py-2 border-tableBorder">
                  <div className="flex items-center gap-2">
                    {/* optional avatar/icon spot if you want */}
                    {/* <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" /> */}
                    <p className="text-[#232323] text-sm sm:text-base">
                      {t?.start_at_ist || "-"}
                    </p>
                  </div>
                </td>

                {/* Subject */}
                <td className="px-3 py-2 border border-tableBorder hidden md:table-cell capitalize">
                  <span className="text-[#232323] text-sm sm:text-base">
                    {t?.subject || "-"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusClasses(
                      t?.status
                    )}`}
                  >
                    {(t?.status || "-").toString().toLowerCase()}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

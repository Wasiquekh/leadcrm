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
  assigned_agent_name: string;
  details: string;
  due_at?: string; // ISO UTC (optional)
  due_at_ist?: string; // "yyyy-MM-dd hh:mm AM/PM"
  status: string;
  timer_hours: number;
  timer_minutes: number;
}

export default function AppCalendar({ leadId, reloadKey = 0, hitApi }: Props) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  console.log("TASK LIST", tasks);
  const [fname, setFname] = useState<string>("Wasique");
  const [lname, setLname] = useState<string>("khan");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await AxiosProvider.post("/leads/tasks/list", {
          lead_id: leadId,
        });
        const rows = res?.data?.data?.[0]?.task ?? [];
        const list: TaskData[] = rows
          .map((r: any) => r?.task ?? r)
          .filter(Boolean);
        setTasks(list);
      } catch (e) {
        console.error("Error fetching tasks:", e);
      } finally {
        setLoading(false);
      }
    };

    if (leadId) fetchTasks();
  }, [leadId, reloadKey, hitApi]);

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
                  First Name
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
                  Last Name
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
                  Due at IST
                </span>
              </div>
            </th>

            {/* Status */}
            <th
              scope="col"
              className="px-3 py-2 border border-tableBorder hidden md:table-cell"
            >
              <div className="flex items-center gap-2">
                <SiHomeassistantcommunitystore className="w-5 h-5 sm:w-6 sm:h-6" />
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
              <td colSpan={4} className="text-center text-xl mt-5">
                <div className="mt-5">Data not found</div>
              </td>
            </tr>
          ) : (
            tasks.map((t, index) => (
              <tr
                key={t?.id ?? index}
                className="border border-tableBorder bg-white hover:bg-primary-100"
              >
                {/* First Name */}
                <td className="px-1 py-2 md:px-3 md:py-2 border-tableBorder flex items-center gap-2">
                  <div className="flex gap-2">
                    <div>
                      <p className="text-[#232323] text-sm sm:text-base capitalize">
                        {fname || "-"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Last Name */}
                <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                  <span className="text-[#232323] text-sm sm:text-base capitalize">
                    {lname || "-"}
                  </span>
                </td>

                {/* Due at IST */}
                <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                  <span className="text-[#232323] text-sm sm:text-base">
                    {t?.due_at_ist ?? "-"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                  <span className="text-[#232323] text-sm sm:text-base capitalize">
                    {t?.status ?? "-"}
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

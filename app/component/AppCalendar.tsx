"use client";

import React, { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";
import { RxAvatar } from "react-icons/rx";
import { HiOutlineBookOpen } from "react-icons/hi";
import { toast } from "react-toastify";


type Props = {
  leadId: string;
  reloadKey?: number;
  hitApi: boolean;
  setHitApi: React.Dispatch<React.SetStateAction<boolean>>;
  openLeadTaskInFlyout: () => void;
  incomingTasks: TaskData[];
};

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
  status: string; // string for now
  subject: string;
  timer_hours: number;
  timer_minutes: number;
  type: string; // string for now
  start_at_ca:string;
}

export default function AppCalendar({
  leadId,
  reloadKey = 0,
  hitApi,
  setHitApi,
  openLeadTaskInFlyout,
  incomingTasks,
}: Props) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  //console.log("TTTTTTTTTTTTT",tasks)
  // Tracks tasks that were just marked complete in this session
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});


  useEffect(() => {
    setTasks(incomingTasks || []);
    // Initialize completedMap based on incoming status
    const init: Record<string, boolean> = {};
    (incomingTasks || []).forEach((t) => {
      if (isCompletedByStatus(t?.status)) init[t.id] = true;
    });
    setCompletedMap(init);
  }, [incomingTasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await AxiosProvider.post("/leads/tasks/list", {
          lead_id: leadId,
        });
        setTasks(res.data.data.task || []);
        console.log("AAAAAAAAAAAAAAAAAAAA",res)
        // Rebuild completedMap from API payload too
        const init: Record<string, boolean> = {};
        (res.data?.data?.task || []).forEach((t: TaskData) => {
          if (isCompletedByStatus(t?.status)) init[t.id] = true;
        });
        setCompletedMap(init);
      } catch (e) {
        console.error("Error fetching tasks:", e);
      }
    };
    if (leadId) fetchTasks();
  }, [leadId, reloadKey, hitApi]);

  // helpers
  const isCompletedByStatus = (s?: string) => {
    const x = (s || "").toLowerCase();
    return x === "completed" || x === "done";
  };

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

  const isTaskLocked = (t: TaskData) =>
    completedMap[t.id] || isCompletedByStatus(t.status);

  const completeTask = async (id: string) => {
    try {
      await AxiosProvider.post("/leads/tasks/complete", {
        lead_id: leadId,
        task_id: id,
      });
      toast.success("Task marked as completed");
      // Optimistic local lock + refresh trigger
      setCompletedMap((m) => ({ ...m, [id]: true }));
      setHitApi(!hitApi);
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Task not completed");
    }
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      {/* <button
        onClick={() => openLeadTaskInFlyout()}
        className="bg-primary-600 hover:bg-primary-700 py-3 px-4 rounded-[4px] text-sm font-medium text-white mb-2"
      >
        Filter Task
      </button> */}

      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 whitespace-nowrap">
        <thead className="text-xs text-[#999999] bg-white">
          <tr className="border border-tableBorder">
            {/* Start Date */}
            <th scope="col" className="px-3 py-3 md:p-3 border border-tableBorder">
              <div className="flex items-center gap-2">
                <RxAvatar className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Start Date
                </span>
              </div>
            </th>

            {/* Subject */}
            <th scope="col" className="px-3 py-2 border border-tableBorder hidden md:table-cell">
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Subject
                </span>
              </div>
            </th>

            {/* Status */}
            <th scope="col" className="px-3 py-2 border border-tableBorder hidden md:table-cell">
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Status
                </span>
              </div>
            </th>

            {/* Done (checkbox) */}
            <th scope="col" className="px-3 py-2 border border-tableBorder hidden md:table-cell">
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Done
                </span>
              </div>
            </th>
                        <th scope="col" className="px-3 py-2 border border-tableBorder hidden md:table-cell">
              <div className="flex items-center gap-2">
                <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-secondBlack text-lg sm:text-base">
                  Action
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {!tasks || tasks.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-xl mt-5 py-6">
                <div className="mt-2">Data not found</div>
              </td>
            </tr>
          ) : (
            tasks.map((t, index) => {
              const locked = isTaskLocked(t);
              return (
                <tr
                  key={t?.id ?? index}
                  className="border border-tableBorder bg-white hover:bg-primary-100"
                >
                  {/* Start Date */}
                  <td className="px-1 py-2 md:px-3 md:py-2 border-tableBorder">
                    <div className="flex items-center gap-2">
                      <p className="text-[#232323] text-sm sm:text-base">
                        {t?.start_at_ca || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-3 py-2 border border-tableBorder hidden md:table-cell capitalize">
                    <span className="text-[#232323] text-sm sm:text-base">
                      {t?.subject || "-"}
                    </span>
                  </td>

                  {/* Status pill */}
                  <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusClasses(
                        t?.status
                      )}`}
                    >
                      {(t?.status || "-").toString().toLowerCase()}
                    </span>
                  </td>

                  {/* Done: one-way checkbox */}
                  <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
                    <label className="inline-flex items-center gap-2 ">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary-600 cursor-pointer disabled:cursor-not-allowed text-center"
                        checked={locked}
                        disabled={locked}
                        onChange={async (e) => {
                          // Only handle first-time check
                          if (e.target.checked && !locked) {
                            await completeTask(t.id);
                          }
                        }}
                        aria-label="Mark task as completed"
                      />
                      {/* <span className="text-[#232323] text-sm sm:text-base select-none">
                        {locked ? "Completed" : "Mark done"}
                      </span> */}
                    </label>
                  </td>
                <td className="px-3 py-2 border border-tableBorder hidden md:table-cell">
              <button>Edit</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

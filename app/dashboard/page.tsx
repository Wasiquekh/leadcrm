"use client";
import Image from "next/image";
import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import { GoArrowRight } from "react-icons/go";
import { MdOutlineCall, MdOutlineCircle, MdOutlineFileDownloadDone, MdPendingActions, MdRemoveRedEye } from "react-icons/md";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import LineChartComponent from "../component/LineChartComponent";
import PieChartComponent from "../component/PieChartComponent";
import CountUp from "react-countup";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import AxiosProvider from "../../provider/AxiosProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import StorageManager from "../../provider/StorageManager";
import { RxAvatar } from "react-icons/rx";
import { LiaArrowCircleDownSolid } from "react-icons/lia";
import { LuAlarmClock } from "react-icons/lu";

export interface AgentStats {
  agent_id: string;       // Unique identifier for the agent (UUID)
  agent_name: string;     // Name of the agent
  done_today: number;     // Number of tasks completed today
  overdue: number;        // Number of overdue tasks
  pending_today: number;  // Number of tasks still pending today
  total_today: number;    // Total tasks assigned for today
}
export interface CardsData {
  overdue: number;
  today: {
    cancelled: number;
    done: number;
    pending: number;
    today_ca: string;
    total: number;
  };
  upcoming: number;
}
export interface TodayTaskList {
  id: string;
  lead_id: string;
  lead_name: string;
  start_at: string;       // ISO date string e.g. "2025-09-25T18:15:00.000Z"
  start_at_ca: string;    // formatted datetime e.g. "09-25-2025 02:15 PM"
  start_date_ca: string;  // formatted date e.g. "09-25-2025"
  status: string;         // e.g. "pending", "completed", ...
  subject: string;        // e.g. "phonecall: bhotu12"
  type: string;           // e.g. "followup"
}
export interface UpcomingTaskList {
  id: string;
  lead_id: string;
  lead_name: string;
  start_at: string;       // ISO date string e.g. "2025-09-25T18:15:00.000Z"
  start_at_ca: string;    // formatted datetime e.g. "09-25-2025 02:15 PM"
  start_date_ca: string;  // formatted date e.g. "09-25-2025"
  status: string;         // e.g. "pending", "completed"
  subject: string;        // e.g. "phonecall: bhotu12"
  type: string;           // e.g. "followup"
}
export interface OverdueTask {
  id: string;
  lead_id: string;
  lead_name: string;
  start_at: string;       // UTC ISO date string
  start_at_ca: string;    // formatted date-time
  start_date_ca: string;  // formatted date
  status: string;
  subject: string;
  type: string;
}
  const storage = new StorageManager();
  const userRole = storage.getUserRole();
export default function Home() {
  const isChecking = useAuthRedirect();
  // -------------FOR AGENT-----------
const [cards, setCards] = useState<CardsData | null>(null);
const [todayTasksListData, setTodayTasksListData] = useState<TodayTaskList[]>([]);
const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTaskList[]>([]);
const [overdueTaskData, setOverDueTaskData] = useState<OverdueTask[]>([])
  console.log("OVER DUEEEEEE",overdueTaskData)
  // -------------END FOR AGENT-----------
  const [isError, setIsError] = useState<boolean>(false);
// FOR ADMIN
const [teamTaskAdmin, setTeamTaskAdmin] = useState<AgentStats[]>([]);
// END FOR ADMIN
  // USE EFFECT AGENT
    const fetchAgentData = async () => {
    //setIsLoading(true);
    try {
      const response = await AxiosProvider.post(
        "/leads/task/agent/dashboard"
      );
      console.log('get all agent dasgboard data',response.data.data);
       //setTodayTaskAgent(response.data.data.cards.today)
      // setUpCompingAgent(response.data.data.cards.today.pending)
      setCards(response.data.data.cards)
      setTodayTasksListData(response.data.data.lists.pending_today)
      setUpcomingTasks(response.data.data.lists.upcoming)
      //setOverDueTaskData(response.data.data.lists)
       

    } catch (error) {
      console.error("Error fetching data:", error);
     // setIsError(true);
    }
    //  finally {
    //   setIsLoading(false);
    // }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  // END USE EFFECT AGENT

      const fetchAdminData = async () => {
    //setIsLoading(true);
    try {
      const response = await AxiosProvider.post(
        "/leads/admin/dashboard"
      );
      setTeamTaskAdmin(response.data.data.tables.team_tasks_by_agent);
      // console.log('get all dasgboard data admin',response.data.data.tables.team_tasks_by_agent);

    } catch (error) {
      console.error("Error fetching data:", error);
     // setIsError(true);
    }
    //  finally {
    //   setIsLoading(false);
    // }
  };


  useEffect(() => {
    fetchAdminData();
  }, []);

	 const test = (lead_id: string) => {
  window.open(`/leadsdetails?id=${lead_id}`, "_blank"); // "_blank" = new tab
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

  return (
    <>
      <div className="">
        {/* Left sidebar */}
        <LeftSideBar />
        {/* Main content right section */}
        <div className="ml-[97px] w-full md:w-[90%] m-auto bg-[#fff]  rounded p-4 mt-0 ">
          {/* Right section top row */}
          <DesktopHeader />
          {/* DASHBOARD CONTENT */}
          {userRole === "Agent" &&  (
            <><div className="w-full mt-12">
              <div className="grid grid-cols-3 gap-6">
                {/* Tab 1 */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md">
                  <p className="text-sm font-medium opacity-80">Task for Today</p>
                  <p className="mt-2 text-xl font-semibold"> {cards?.today.total ?? 0}</p>
                </div>

                {/* Tab 2 */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md">
                  <p className="text-sm font-medium opacity-80">Upcoming</p>
                  <p className="mt-2 text-xl font-semibold">{cards?.upcoming ?? 0}</p>
                </div>
                {/* Tab 3 */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md">
                  <p className="text-sm font-medium opacity-80">Overdue</p>
                  <p className="mt-2 text-xl font-semibold">{cards?.overdue ?? 0}</p>
                </div>



              </div>
            </div>
              {/* TABLE TASK FOR TODAY */}
              <h1 className=" mt-5">Table Task for Today</h1>
              <div className="overflow-x-auto rounded-lg shadow bg-white mt-2">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-3">Lead Name</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Start At</th>
                      <th className="p-3">Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayTasksListData.length > 0 ? (
                      todayTasksListData.map((task) => (
                        <tr key={task.id} className="border-t hover:bg-gray-50">
                          <td 
                           onClick={() => test(task.lead_id)}
                          className="p-3 cursor-pointer bg-primary-500"><p className=" text-white font-medium">{task.lead_name}</p></td>
                          <td className="p-3">{task.subject}</td>
                          <td className="p-3 capitalize">{task.type}</td>
                          <td className="p-3 capitalize">{task.status}</td>
                          <td className="p-3">{task.start_at_ca}</td>
                          <td className="p-3">{task.start_date_ca}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={6}>
                          No tasks for today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOR UPCOMING  */}
               <h1 className=" mt-5">Table Upcoming Task</h1>
               <div className="overflow-x-auto rounded-lg shadow bg-white mt-6">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="p-3">Lead Name</th>
            <th className="p-3">Subject</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
            <th className="p-3">Start At</th>
            <th className="p-3">Start Date</th>
          </tr>
        </thead>
        <tbody>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <tr key={task.id} className="border-t hover:bg-gray-50">
                <td
               onClick={() => test(task.lead_id)}
                className="p-3 cursor-pointer bg-primary-500"><p className="text-white font-medium">{task.lead_name}</p></td>
                <td className="p-3">{task.subject}</td>
                <td className="p-3 capitalize">{task.type}</td>
                <td className="p-3 capitalize">{task.status}</td>
                <td className="p-3">{task.start_at_ca}</td>
                <td className="p-3">{task.start_date_ca}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={6}>
                No upcoming tasks
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
              
              </>


// CODE FOR ADMIN
          )}
{userRole === "Admin" && (
           <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th
                      scope="col"
                      className="px-1 p-3 md:p-3 border border-tableBorder"
                    >
                      <div className="flex items-center gap-2">
                        <RxAvatar className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                          Team
                        </div>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-1 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <MdOutlineFileDownloadDone  className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                          Done
                        </div>
                      </div>
                    </th>
                                        <th
                      scope="col"
                      className="px-2 py-1 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <MdPendingActions className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                          Pending
                        </div>
                      </div>
                    </th>
                                        <th
                      scope="col"
                      className="px-2 py-1 border border-tableBorder hidden md:table-cell"
                    >
                      <div className="flex items-center gap-2">
                        <LuAlarmClock className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                        Overdue
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                 
                  {!teamTaskAdmin || teamTaskAdmin.length === 0 || isError ? (
                    <tr>
                      <td colSpan={8} className="text-center text-xl mt-5">
                        <div className="mt-5">Data not found</div>
                      </td>
                    </tr>
                  ) : (
                    teamTaskAdmin.map((item: any, index: number) => (
                      <tr
                        key={item?.id ?? index}
                        className="border border-tableBorder bg-white hover:bg-primary-100"
                      >
                        <td className="px-1 md:p-3 py-2 flex md:flex-row gap-2">
                          <div>
                            <p className="text-[#232323] text-sm sm:text-base  leading-normal capitalize truncate">
                              {item?.agent_name ?? "-"}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-1 border border-tableBorder hidden md:table-cell">
                          <p className="text-[#232323] text-sm sm:text-base  leading-normal  truncate">
                            {item?.done_today ?? "-"}
                          </p>
                        </td>
                        <td className="px-2 py-1 border border-tableBorder hidden md:table-cell">
                          <p className="text-[#232323] text-sm sm:text-base  leading-normal capitalize truncate">
                            {item?.pending_today ?? "-"}
                          </p>
                        </td>
                        <td className="px-2 py-1 border border-tableBorder hidden md:table-cell">
                          <p className="text-[#232323] text-sm sm:text-base  leading-normal capitalize truncate">
                            {item?.overdue ?? "-"}
                          </p>
                        </td>
                       
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
)}



            
       
        </div>
      </div>
      <div className="absolute bottom-0 right-0">
        <Image
          src="/images/sideDesign.svg"
          alt="side desgin"
          width={100}
          height={100}
          className=" w-full h-full -z-10 hidden"
        />
      </div>
    </>
  );
}

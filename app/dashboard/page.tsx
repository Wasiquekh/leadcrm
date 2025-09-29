"use client";
import Image from "next/image";
import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import AxiosProvider from "../../provider/AxiosProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import StorageManager from "../../provider/StorageManager";
import React from "react";
import AdminDashboard from "../component/AdminDashboard";



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


  // -------------END FOR AGENT-----------
  const [isError, setIsError] = useState<boolean>(false);
// FOR ADMIN


// END FOR ADMIN
  // USE EFFECT AGENT
    const fetchAgentData = async () => {
    //setIsLoading(true);
    try {
      const response = await AxiosProvider.post(
        "/leads/task/agent/dashboard"
      );
     // console.log('get all agent dasgboard data',response.data.data);
       //setTodayTaskAgent(response.data.data.cards.today)
      // setUpCompingAgent(response.data.data.cards.today.pending)
      setCards(response.data.data.cards)
      setTodayTasksListData(response.data.data.lists.pending_today)
      setUpcomingTasks(response.data.data.lists.upcoming)
      setOverDueTaskData(response.data.data.lists.overdue)
       

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
                {/* <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md">
                  <p className="text-sm font-medium opacity-80">Upcoming</p>
                  <p className="mt-2 text-xl font-semibold">{cards?.upcoming ?? 0}</p>
                </div> */}
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
               {/* <h1 className=" mt-5">Table Upcoming Task</h1>
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
    </div> */}
{/* TABLE FOR OVERDUE TASK */}
<h1 className="mt-5">Table Overdue Task</h1>
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
      {overdueTaskData.length > 0 ? (
        overdueTaskData.map((task) => (
          <tr key={task.id} className="border-t hover:bg-gray-50">
            <td
              onClick={() => test(task.lead_id)}
              className="p-3 cursor-pointer bg-primary-500">
              <p className="text-white font-medium">{task.lead_name}</p>
            </td>
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
            No overdue tasks
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
  <>
  {/* ----------ADMIN DASHBOARD-------------------- */}
<AdminDashboard />
   {/* ------------END ADMIN DASHBOARD--------------- */}
 
 
              </>
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

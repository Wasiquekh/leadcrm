import React, { useState, useEffect } from 'react';
import AxiosProvider from '../../provider/AxiosProvider';  // Your Axios provider setup

const AdminDashboard = () => {
  // State for storing the card data
  const [cardsAdminData, setCardsAdminData] = useState({
    cancelled_today: 0,
    done_today: 0,
    overdue_all: 0,
    pending_today: 0,
    today_ca: '',
    total_today: 0,
  });

  // State for agents' tasks data (team tasks by agent)
  const [teamTasksByAgent, setTeamTasksByAgent] = useState<any[]>([]); // Holds the agents' task data
  const [todayTasksByAgent, setTodayTasksByAgent] = useState<any[]>([]); // Holds today's tasks by agent
  const [overdueTasksByAgent, setOverdueTasksByAgent] = useState<any[]>([]); // Holds overdue tasks by agent

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // State for controlling which agent's tasks are visible in the accordion
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  // Function to fetch admin dashboard data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosProvider.post("/leads/admin/dashboard");
      console.log('Admin dashboard data fetched', response);
      
      // Check if response is valid before setting the state
      if (response.data && response.data.data && response.data.data.cards) {
        setCardsAdminData(response.data.data.cards.team_tasks);
      } else {
        throw new Error('Invalid response structure');
      }

      // Get team tasks by agent data from 'tables'
      const teamTasks = response.data.data.tables.team_tasks_by_agent || [];
      setTeamTasksByAgent(teamTasks);

      // Get today tasks by agent
      const todayTasks = response.data.data.lists.today_tasks_by_agent || [];
      setTodayTasksByAgent(todayTasks);

      // Get overdue tasks by agent
      const overdueTasks = response.data.data.lists.overdue_tasks_by_agent || [];
      setOverdueTasksByAgent(overdueTasks);

    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Show loading or error message if necessary
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading dashboard data. Please try again later.</div>;
  }

  // Function to handle accordion toggle (clicking on an agent's name)
  const handleAccordionToggle = (agentId: string) => {
    setActiveAgent(activeAgent === agentId ? null : agentId);
  };
const test = (id: string) => {
  window.open(`/leadsdetails?id=${id}`, "_blank"); // "_blank" = new tab
};
  return (
    <div className="container my-4">
      <h3>Admin Dashboard</h3>
      
      {/* Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {/* Total Today Card */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Today</h3>
            <p className="text-2xl font-bold text-purple-600">{cardsAdminData.total_today}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 3l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Done Today Card */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Done Today</h3>
            <p className="text-2xl font-bold text-green-600">{cardsAdminData.done_today}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Overdue All Card */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Overdue All</h3>
            <p className="text-2xl font-bold text-yellow-600">{cardsAdminData.overdue_all}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M4.22 4.22l15.56 15.56" />
            </svg>
          </div>
        </div>

        {/* Pending Today Card */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Pending Today</h3>
            <p className="text-2xl font-bold text-orange-600">{cardsAdminData.pending_today}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M4.22 4.22l15.56 15.56" />
            </svg>
          </div>
        </div>
      </div>

      {/* Team Tasks by Agent Table */}
      <div className="mt-8">
        <h4 className="text-xl font-semibold">Team Tasks by Agent</h4>
        <table className="min-w-full mt-4 table-auto">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left">Agent Name</th>
              <th className="border-b px-4 py-2 text-left">Total Today</th>
              <th className="border-b px-4 py-2 text-left">Pending Today</th>
              <th className="border-b px-4 py-2 text-left">Done Today</th>
              <th className="border-b px-4 py-2 text-left">Overdue</th>
            </tr>
          </thead>
          <tbody>
            {teamTasksByAgent.map((agent, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border-b px-4 py-2">{agent.agent_name}</td>
                <td className="border-b px-4 py-2">{agent.total_today}</td>
                <td className="border-b px-4 py-2">{agent.pending_today}</td>
                <td className="border-b px-4 py-2">{agent.done_today}</td>
                <td className="border-b px-4 py-2">{agent.overdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Today Tasks by Agent (Accordion Section with Table for Tasks) */}
      <div className="mt-6">
        <h4 className="text-xl font-semibold">Today Tasks by Agent</h4>
        <div className="mt-4">
          {todayTasksByAgent.map((agent, index) => (
            <div key={index}>
              {/* Accordion Trigger */}
              <button
                className="w-full text-left bg-gray-100 p-3 rounded-lg border-b"
                onClick={() => handleAccordionToggle(agent.agent_id)}
              >
                <span className="font-semibold">{agent.agent_name}</span>
                <span className="float-right">
                  {activeAgent === agent.agent_id ? '-' : '+'}
                </span>
              </button>

              {/* Accordion Content (Table) */}
              {activeAgent === agent.agent_id && (
                <div className="bg-gray-50 p-4">
                  <table className="min-w-full mt-4 table-auto">
                    <thead>
                      <tr>
                        <th className="border-b px-4 py-2 text-left">Lead Name</th>
                        <th className="border-b px-4 py-2 text-left">Status</th>
                        <th className="border-b px-4 py-2 text-left">Due Date</th>
                        <th className="border-b px-4 py-2 text-left">Start Time</th>
                        <th className="border-b px-4 py-2 text-left">End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.tasks.map((task: any, idx: number) => (
                        <tr key={idx}>
                          <td
                          onClick={()=>test(task.lead_id)}
                          className="border-b px-4 py-2 bg-primary-500 text-white cursor-pointer">{task.lead_name}</td>
                          <td className="border-b px-4 py-2">{task.status}</td>
                          <td className="border-b px-4 py-2">{task.due_date}</td>
                          <td className="border-b px-4 py-2">{task.start_at_ca}</td>
                          <td className="border-b px-4 py-2">{task.end_at_ca}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Tasks by Agent (Accordion Section with Table for Tasks) */}
      <div className="mt-6">
        <h4 className="text-xl font-semibold">Overdue Tasks by Agent</h4>
        <div className="mt-4">
          {overdueTasksByAgent.map((agent, index) => (
            <div key={index}>
              {/* Accordion Trigger */}
              <button
                className="w-full text-left bg-gray-100 p-3 rounded-lg border-b"
                onClick={() => handleAccordionToggle(agent.agent_id)}
              >
                <span className="font-semibold">{agent.agent_name}</span>
                <span className="float-right">
                  {activeAgent === agent.agent_id ? '-' : '+'}
                </span>
              </button>

              {/* Accordion Content (Table) */}
              {activeAgent === agent.agent_id && (
                <div className="bg-gray-50 p-4">
                  <table className="min-w-full mt-4 table-auto">
                    <thead>
                      <tr>
                        <th className="border-b px-4 py-2 text-left">Lead Name</th>
                        <th className="border-b px-4 py-2 text-left">Status</th>
                        <th className="border-b px-4 py-2 text-left">Due Date</th>
                        <th className="border-b px-4 py-2 text-left">Start Time</th>
                        <th className="border-b px-4 py-2 text-left">End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.tasks.map((task: any, idx: number) => (
                        <tr key={idx}>
                          <td 
                           onClick={()=>test(task.lead_id)}
                          className="border-b px-4 py-2 bg-primary-500 text-white cursor-pointer">{task.lead_name}</td>
                          <td className="border-b px-4 py-2">{task.status}</td>
                          <td className="border-b px-4 py-2">{task.due_date}</td>
                          <td className="border-b px-4 py-2">{task.start_at_ca}</td>
                          <td className="border-b px-4 py-2">{task.end_at_ca}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

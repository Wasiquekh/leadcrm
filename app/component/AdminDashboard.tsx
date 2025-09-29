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

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Function to fetch admin dashboard data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosProvider.post("/leads/admin/dashboard");
      console.log('Admin dashboard data fetched', response);
      setCardsAdminData(response.data.data.cards.team_tasks);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch admin data on component mount
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

  return (
    <div className="container my-4">
      <h3>Admin Dashboard</h3>
      
      {/* Display cards in a grid layout */}
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
    </div>
  );
};

export default AdminDashboard;

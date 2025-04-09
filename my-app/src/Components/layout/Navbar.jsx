// src/components/layout/Navbar.jsx
'use client'; // Needs to be a client component for onClick and useEffect

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon'; // Make sure Luxon is installed: npm install luxon
import { FiMenu } from 'react-icons/fi'; // Hamburger icon

// No interface needed for JS props
export default function Navbar({ toggleSidebar }) { // Destructure props directly
  const [time, setTime] = useState(''); // State for time

  // Effect to update time periodically (e.g., every minute)
  useEffect(() => {
    const updateTime = () => {
      // Ensure Luxon is available before using it (optional safety check)
      if (typeof DateTime !== 'undefined') {
         setTime(DateTime.now().toFormat("hh:mm a - dd LLL yyyy"));
      } else {
         // Fallback or error handling if Luxon fails to load
         console.error("Luxon DateTime is not available.");
         setTime("Time unavailable");
      }
    };
    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    // Fixed Navbar styles
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 py-3 md:py-4 bg-gray-900 text-white shadow-md">
      {/* Sidebar Toggle Button - Calls the function passed from MainLayoutClient */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-label="Toggle sidebar"
      >
        <FiMenu size={24} />
      </button>

      {/* Time & Date */}
      <div className="text-xs sm:text-sm md:text-base font-mono">{time}</div>

       {/* Placeholder for Login/User Info */}
       <div>
         {/* Example: <button className="px-3 py-1 rounded hover:bg-gray-700">Login</button> */}
       </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";

import { DateTime } from "luxon";

import { FiMenu } from "react-icons/fi";

export default function Navbar({ toggleSidebar }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(DateTime.now().toFormat("hh:mm a - dd LLL yyyy"));
    };

    updateTime();

    const intervalId = setInterval(updateTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-10 w-full flex items-center justify-between px-4 py-3 md:py-4 bg-gray-900 text-white shadow-md">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-label="Toggle sidebar"
      >
        <FiMenu size={24} />
      </button>

      <div className="text-xs sm:text-sm md:text-base font-mono">{time}</div>

      {/* Placeholder for Login/User Info */}
      <div>
         <button className="px-3 py-1 rounded hover:bg-gray-700">Login</button>
      </div>
    </div>
  );
}



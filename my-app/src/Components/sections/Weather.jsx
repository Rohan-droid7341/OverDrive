// src/components/sections/Weather.jsx
'use client'; // Needs client-side fetching and date formatting

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon'; // For date formatting (ensure installed)
import { FiMapPin } from 'react-icons/fi'; // Location pin icon

// --- Configuration ---
// You might want to make CITY dynamic later (e.g., based on user location/setting)
const CITY = "Patiala";
const UNITS = "metric";
// ---------------------

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [formattedDate, setFormattedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  useEffect(() => {
    // Format the current date once when the component mounts
    setFormattedDate(DateTime.now().toFormat("cccc, dd LLLL yyyy"));

    if (!apiKey) {
      setError("OpenWeather API key is missing.");
      setLoading(false);
      return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${apiKey}&units=${UNITS}`;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Weather API Error: ${response.statusText} (${response.status})`);
        }
        const data = await response.json();
        if (!data || !data.main || !data.weather || !data.weather[0]) {
            throw new Error("Invalid data received from weather API.");
        }
        setWeatherData(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(err.message || "Failed to fetch weather.");
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
     // No need for interval fetching for this design unless specifically required

  }, [apiKey]); // Dependency array includes apiKey


  // --- Rendering Logic ---

  if (error) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-red-500 text-white text-center" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (loading || !weatherData) {
    // Simple text loading, styled similarly to the final component
    return (
       <div className="flex items-center justify-between p-3 px-5 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse">
         <div className="h-6 bg-blue-400 rounded w-24"></div>
         <div className="h-10 bg-blue-400 rounded w-16"></div>
         <div className="h-8 bg-blue-400 rounded w-32"></div>
         <div className="w-16 h-16 bg-blue-400 rounded-full"></div>
       </div>
    );
  }

  // Destructure needed data
  const { name } = weatherData;
  const { temp } = weatherData.main;
  const { description, icon } = weatherData.weather[0];

  // Use 4x size for better quality if available, fallback to 2x
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  const unitSymbol = UNITS === 'metric' ? '°' : '°F'; // Just the degree symbol

  return (
    // Main container with gradient, rounded corners, padding, flex layout, and white text
    <div className="flex items-center justify-between p-3 px-5 rounded-xl shadow-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white">

      <div className="flex flex-col items-start">
        <span className="text-sm capitalize">{description}</span>
        <span className="text-5xl font-bold">{Math.round(temp)}{unitSymbol}</span>
      </div>

      {/* Vertical Divider */}
      <div className="border-l border-white/50 h-10 self-center mx-4"></div>

      {/* Middle Section: Date & Location */}
      <div className="flex flex-col items-start text-sm">
        <span>{formattedDate}</span>
        <span className="flex items-center mt-1">
          <FiMapPin className="inline mr-1" size={21}/> {name}
        </span>
      </div>

      {/* Right Section: Weather Icon */}
      {/* ml-auto pushes the icon to the far right */}
      <div className="ml-auto pl-4">
         {/* Use a larger icon size */}
        <img
          src={iconUrl}
          alt={description}
          className="w-16 h-19 md:w-30 md:h-20 object-contain" // Use object-contain if needed
          // Optional: Add fallback for 4x icon if it doesn't load
          onError={(e) => { e.currentTarget.src = `https://openweathermap.org/img/wn/${icon}@2x.png`; }}
        />
      </div>

    </div>
  );
}
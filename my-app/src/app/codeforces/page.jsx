// src/app/codeforces/page.jsx
'use client'; // Required for client-side hooks and interaction

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// --- Icon Imports ---
import {
  FiSearch, FiMapPin, FiBriefcase, FiAward, FiCheckCircle,
  FiXCircle, FiClock, FiCode, FiBarChart2, FiHash, FiUserPlus, FiUsers
} from 'react-icons/fi'; // Added missing icons used in card
import { SiCodeforces } from 'react-icons/si';

// --- Charting Library Imports ---
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Treemap
} from 'recharts';

// --- Spinner Import ---
import { ScaleLoader } from 'react-spinners';

// --- Define Your Default Codeforces Handle ---
const DEFAULT_CF_HANDLE = 'Rohan_Garg_'; // <-- REPLACE with your Codeforces handle

// --- Codeforces API Fetching Logic ---

const CF_API_BASE = 'https://codeforces.com/api';

// Centralized fetch function
const fetchCodeforcesApi = async (endpoint) => {
  const url = `${CF_API_BASE}/${endpoint}`;
  console.log(`Fetching CF API: ${url}`); // For debugging
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Codeforces API Error: ${data.comment || 'Request failed'}`);
    }
    return data.result; // Return only the 'result' part
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Fetch user info
export const getCfUserInfo = async (handle) => {
  if (!handle) throw new Error("Handle is required");
  const results = await fetchCodeforcesApi(`user.info?handles=${handle}`);
  if (!results || results.length === 0) {
    throw new Error(`User handle "${handle}" not found on Codeforces.`);
  }
  return results[0];
};

// Fetch user submissions (limit count for performance)
export const getCfUserSubmissions = async (handle, count = 500) => {
  if (!handle) throw new Error("Handle is required");
  return fetchCodeforcesApi(`user.status?handle=${handle}&count=${count}`);
};

let problemsetData = null; // Simple in-memory cache for this example
export const getCfProblemset = async () => {
  if (problemsetData) {
    console.log("Using cached problemset data.");
    return problemsetData;
  }
  console.log("Fetching entire Codeforces problemset...");
  try {
    const result = await fetchCodeforcesApi('problemset.problems');
    const processedData = {}; // Process into a map for faster lookup
    if (result?.problems && result?.problemStatistics) {
         result.problems.forEach((problem, index) => {
            const stats = result.problemStatistics[index];
            processedData[`${problem.contestId}-${problem.index}`] = {
                ...problem,
                solvedCount: stats?.solvedCount
            };
         });
    }
    problemsetData = processedData; // Cache the processed data
    console.log(`Problemset fetched and processed. Found ${Object.keys(problemsetData).length} problems.`);
    return problemsetData;
  } catch (error) {
      console.error("Failed to fetch or process problemset:", error)
      problemsetData = {}; // Cache empty object on failure to prevent retries
      throw error; // Re-throw so the component knows it failed
  }
};

// --- Color/Helper Functions ---
const VerdictColors = {
    'OK': '#28a745', // Green
    'WRONG_ANSWER': '#dc3545', // Red
    'TIME_LIMIT_EXCEEDED': '#ffc107', // Yellow
    'MEMORY_LIMIT_EXCEEDED': '#fd7e14', // Orange
    'RUNTIME_ERROR': '#6f42c1', // Purple
    'COMPILATION_ERROR': '#6c757d', // Gray
    'SKIPPED': '#adb5bd',
    'CHALLENGED': '#17a2b8', // Teal
    'default': '#adb5bd' // Default gray for others
};
const LanguageColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1'];


// --- UI Components ---

// 1. User Profile Card
function CfProfileCard({ user }) {
  if (!user) return null;

  const rankColor = user.rank?.includes('newbie') ? 'text-gray-500' :
                    user.rank?.includes('pupil') ? 'text-green-500' :
                    user.rank?.includes('specialist') ? 'text-cyan-500' :
                    user.rank?.includes('expert') ? 'text-blue-500' :
                    user.rank?.includes('candidate master') ? 'text-purple-500' :
                    user.rank?.includes('master') ? 'text-yellow-500' :
                    user.rank?.includes('grandmaster') ? 'text-red-500' :
                    'text-gray-500'; // Default

  return (
    <div className="flex flex-col sm:flex-row items-center p-5 border dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 space-y-4 sm:space-y-0 sm:space-x-5">
      <Image
        src={user.titlePhoto?.startsWith('//') ? `https:${user.titlePhoto}` : user.titlePhoto || '/placeholder-avatar.png'} // Handle protocol-relative URLs and placeholder
        alt={`${user.handle}'s avatar`} width={100} height={100}
        className="rounded-md border-2 border-gray-300 dark:border-gray-600" priority
        onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-avatar.png'; }} // Fallback placeholder
      />
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.handle}
          <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">({user.handle})</span>
        </h1>
        <p className={`text-md font-semibold capitalize ${rankColor}`}>{user.rank || 'Unranked'} ({user.rating || 'N/A'})</p>
        {user.maxRating && <p className="text-sm text-gray-500 dark:text-gray-400">Max Rating: {user.maxRating} (<span className={`capitalize font-medium ${rankColor}`}>{user.maxRank}</span>)</p>}

        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
          {user.organization && <span className="flex items-center"><FiBriefcase className="mr-1" /> {user.organization}</span>}
          {(user.city || user.country) && <span className="flex items-center"><FiMapPin className="mr-1" /> {user.city}{user.city && user.country ? ', ' : ''}{user.country}</span>}
          {user.contribution !== undefined && <span className="flex items-center"><FiAward className="mr-1" /> Contribution: {user.contribution}</span>}
        </div>

        <div className="mt-3">
          <a href={`https://codeforces.com/profile/${user.handle}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
             <SiCodeforces className="mr-1.5" /> View on Codeforces
          </a>
        </div>
      </div>
    </div>
  );
}

// 2. Verdicts Chart
function VerdictsChart({ data }) {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No submission verdict data.</p>;
  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Submission Verdicts</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => percent > 0.03 ? `${(percent * 100).toFixed(0)}%` : ''}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={VerdictColors[entry.name] || VerdictColors.default} />)}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{fontSize: '12px'}}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Languages Chart
function LanguagesChart({ data }) {
   if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No language usage data.</p>;
   const chartData = data.slice(0, 10);
   return (
     <div style={{ width: '100%', height: 300 }}>
       <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Languages Used</h3>
       <ResponsiveContainer>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => percent > 0.03 ? `${(percent * 100).toFixed(0)}%` : ''}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={LanguageColors[index % LanguageColors.length]} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]}/>
            <Legend wrapperStyle={{fontSize: '12px'}}/>
          </PieChart>
       </ResponsiveContainer>
     </div>
   );
}

// 4. Problem Ratings Chart
function ProblemRatingsChart({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No AC submission rating data.</p>;
    return (
      <div style={{ width: '100%', height: 300 }}>
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Solved Problem Ratings</h3>
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" name="Rating" tick={{ fontSize: 10 }}/>
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }}/>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '12px'}}/>
                <Bar dataKey="count" fill="#82ca9d" name="Solved Count" />
            </BarChart>
        </ResponsiveContainer>
      </div>
    );
}

// 5. Problem Tags Chart
function ProblemTagsChart({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No AC submission tag data.</p>;
    const chartData = data.slice(0, 15); // Limit tags shown in Treemap for readability
    const colors = LanguageColors; // Reuse colors
    return (
      <div style={{ width: '100%', height: 300 }}>
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Solved Problem Tags</h3>
        <ResponsiveContainer>
          <Treemap
            data={chartData}
            dataKey="count" nameKey="name" // Size based on count, label is name
            ratio={4 / 3} stroke="#fff" fill="#8884d8" isAnimationActive={false}
          >
             <Tooltip formatter={(value, name) => [value, name]}/>
             {/* Needs custom content rendering if you want colors per cell in Treemap */}
          </Treemap>
        </ResponsiveContainer>
      </div>
    );
}


function CodeforcesProfileSearcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for the input field - Initialize empty
  const [searchInput, setSearchInput] = useState('');
  // State for the username we are actively searching/displaying - Initialize empty
  const [targetHandle, setTargetHandle] = useState('');

  // State for fetched data
  const [user, setUser] = useState(null);
  const [verdictData, setVerdictData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [tagsData, setTagsData] = useState([]);
  const [loading, setLoading] = useState(false); // Start NOT loading by default
  const [error, setError] = useState(null);
  const [problems, setProblems] = useState(null); // State for problemset data

  // --- Handler for input changes ---
  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  // --- Effect to fetch problemset data ONCE ---
  useEffect(() => {
    getCfProblemset()
      .then((data) => setProblems(data))
      .catch((err) => {
        console.error("Failed to fetch Codeforces problemset:", err);
        setProblems({}); // Indicate fetch attempt completed (even if failed)
        setError("Could not load Codeforces problemset data. Some charts may be unavailable."); // Inform user
      });
  }, []); // Empty dependency array - run only once

  useEffect(() => {
    const handleFromUrl = searchParams.get("handle");
    const initialTarget = handleFromUrl || DEFAULT_CF_HANDLE;
    if (initialTarget !== targetHandle) {
      setTargetHandle(initialTarget);
      // setLoading(true); // Loading is handled by the data fetching effect now
    }
  }, [searchParams, targetHandle]); // Removed searchInput & problems dependencies

  useEffect(() => {
    // Sync input only if target handle actually exists (avoids clearing input on initial load before target is set)
    if (targetHandle) {
       setSearchInput(targetHandle);
    }
  }, [targetHandle]); // Runs only when targetHandle changes

  // --- Effect to fetch user data when targetHandle changes (and problemset is available) ---
  useEffect(() => {
    if (!targetHandle || problems === null) { // Wait for handle AND problems
        if (targetHandle && problems === null) {
            setLoading(true); // Show loading if we have handle but not problems
        } else {
            setLoading(false); // Stop loading if no handle
        }
      setUser(null); setVerdictData([]); setLanguageData([]); setRatingData([]); setTagsData([]); setError(null);
      return;
    }

    const fetchData = async () => {
      console.log(`Fetching data for CF handle: ${targetHandle}`);
      setLoading(true); setError(null);

      try {
        const [userInfo, submissions] = await Promise.all([
          getCfUserInfo(targetHandle),
          getCfUserSubmissions(targetHandle, 1000)
        ]);
        setUser(userInfo);

        if (submissions && submissions.length > 0) {
            // 1. Verdicts Processing
            const verdicts = {};
            submissions.forEach(sub => { const v = sub.verdict || "UNKNOWN"; verdicts[v] = (verdicts[v] || 0) + 1; });
            const verdictChartData = Object.entries(verdicts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
            setVerdictData(verdictChartData);

            // 2. Languages Processing
            const languages = {};
            submissions.forEach(sub => { const lang = sub.programmingLanguage || "Unknown"; languages[lang] = (languages[lang] || 0) + 1; });
            const languageChartData = Object.entries(languages).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
            setLanguageData(languageChartData);

            // 3. Ratings & Tags Processing (AC Subs)
            const acSubmissions = submissions.filter(sub => sub.verdict === "OK");
            const solvedProblems = {};
            acSubmissions.forEach(sub => {
                const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
                if (problems[problemId] && !solvedProblems[problemId]) {
                    solvedProblems[problemId] = problems[problemId];
                }
            });
            const ratings = {}; const tags = {};
            Object.values(solvedProblems).forEach(problem => {
                 if (problem.rating) { const rating = problem.rating; ratings[rating] = (ratings[rating] || 0) + 1; }
                 if (problem.tags && problem.tags.length > 0) { problem.tags.forEach(tag => { tags[tag] = (tags[tag] || 0) + 1; }); }
            });
            const ratingChartData = Object.entries(ratings).map(([rating, count]) => ({ rating: parseInt(rating), count })).sort((a, b) => a.rating - b.rating);
            setRatingData(ratingChartData);
            const tagsChartData = Object.entries(tags).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
            setTagsData(tagsChartData);
        } else {
           setVerdictData([]); setLanguageData([]); setRatingData([]); setTagsData([]);
        }
      } catch (err) {
        console.error("Failed to fetch Codeforces profile data:", err);
        setError(err.message || "Could not fetch profile data.");
        setUser(null); setVerdictData([]); setLanguageData([]); setRatingData([]); setTagsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetHandle, problems]); // Re-run when targetHandle or problems change

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedHandle = searchInput.trim();
    // Prevent re-fetching if the search input matches the current target
    if (!trimmedHandle || trimmedHandle === targetHandle) return;
    router.push(`/codeforces?handle=${encodeURIComponent(trimmedHandle)}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
      {/* Search Input Section */}
      <div className="w-full max-w-lg mx-auto my-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange} // Ensure this is connected
            placeholder="Enter Codeforces Handle..."
            className="w-full py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Codeforces Handle Input"
          />
          <button
            type="submit"
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none disabled:opacity-50"
            aria-label="Search Codeforces Profile"
            title="Search"
            disabled={!searchInput.trim() || loading || searchInput.trim() === targetHandle}
          >
            <FiSearch size={20} />
          </button>
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-4 text-gray-400 pointer-events-none">
            <SiCodeforces size={20} />
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center text-center p-10">
            <ScaleLoader color={"#3b82f6"} loading={loading} height={35} width={4} radius={2} margin={2} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                {problems === null ? 'Loading problemset data...' : `Loading profile for "${targetHandle}"...`}
            </p>
        </div>
      )}

      {error && !loading && (
        <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center max-w-lg mx-auto" role="alert">
            <strong className="font-bold">Error!</strong>
            <p>{error.includes('User handle') ? `User handle "${targetHandle}" not found.` : error}</p>
            {error.includes('fetch') && <p className="text-sm mt-1">Check your internet connection or Codeforces API status.</p>}
        </div>
      )}

      {!loading && !error && user && (
        <div className="space-y-6">
          <CfProfileCard user={user} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"><VerdictsChart data={verdictData} /></div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"><LanguagesChart data={languageData} /></div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"><ProblemRatingsChart data={ratingData} /></div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"><ProblemTagsChart data={tagsData} /></div>
          </div>
        </div>
      )}

       {!loading && !error && !user && targetHandle && problems !== null && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Could not load profile for "{targetHandle}". Handle may be incorrect or user has no submissions.</div>
        )}
       {!loading && !error && !user && !targetHandle && (
             <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Enter a Codeforces handle above to search.</div>
         )}

    </div>
  );
}

export default function CodeforcesPage() {
    return (
        <Suspense fallback={ // Use spinner in Suspense fallback as well
            <div className="flex flex-col items-center justify-center min-h-screen">
                <ScaleLoader color={"#3b82f6"} height={35} width={4} radius={2} margin={2} />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading page...</p>
            </div>
        }>
            <CodeforcesProfileSearcher />
        </Suspense>
    );
}
// src/app/github/page.jsx
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Using unoptimized={true}

// --- Icon Imports ---
import { FiSearch, FiUsers, FiUserPlus, FiMapPin, FiLink, FiTwitter, FiBriefcase } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';

// --- Charting Library Imports ---
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// --- Spinner Import ---
import { ScaleLoader } from 'react-spinners';

// --- Define Your Default GitHub Username ---
const DEFAULT_USERNAME = 'Rohan-droid7341'; // <-- REPLACE with your actual username

// --- GitHub API Fetching Logic (No PAT Used Client-Side) ---

const GITHUB_API_BASE = 'https://api.github.com';

// Headers for unauthenticated requests
const createHeaders = () => {
    console.warn("Making unauthenticated request to GitHub API. Rate limits apply."); // Warn about limitations
    return { 'Accept': 'application/vnd.github.v3+json' };
};

// handleResponse function remains the same
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = `GitHub API Error: ${response.status} ${response.statusText}. ${errorData.message || ''}`;
        if (response.status === 403) throw new Error(`${message.trim()} (Rate limit likely exceeded)`);
        if (response.status === 404) throw new Error(`${message.trim()} (User not found)`);
        throw new Error(message.trim());
    }
    if (response.status === 204) return {}; // Handle No Content for languages
    return response.json();
};

// API fetching functions now use the header creator without PAT
const getUserProfile = async (username) => {
    if (!username) throw new Error("Username is required.");
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers: createHeaders() });
    return handleResponse(response);
};
const getUserRepos = async (username) => {
    if (!username) throw new Error("Username is required.");
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed`, { headers: createHeaders() });
    return handleResponse(response);
};
const getRepoLanguages = async (owner, repo) => {
     if (!owner || !repo) throw new Error("Owner and repo name are required.");
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, { headers: createHeaders() });
    return handleResponse(response);
};


// --- UI Components (UserProfileCard, LanguagesChart, StarsChart - No Changes Needed) ---

function UserProfileCard({ user }) { /* ... (Keep component code as before) ... */
    if (!user) return null;
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start p-6 border dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 space-y-4 md:space-y-0 md:space-x-6">
             <Image src={user.avatar_url} alt={`${user.login}'s avatar`} width={120} height={120} className="rounded-full border-4 border-gray-300 dark:border-gray-600" priority unoptimized={true}/>
             <div className="flex-1 text-center md:text-left">
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.login}</h1>
                 <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">@{user.login}</p>
                 {user.bio && <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>}
                 <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                     <span className="flex items-center"><FiUsers className="mr-1" /> {user.followers} Followers</span>
                     <span className="flex items-center"><FiUserPlus className="mr-1" /> Following {user.following}</span>
                     <span className="flex items-center"><FiBriefcase className="mr-1" /> Public Repos: {user.public_repos}</span>
                 </div>
                 <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                     {user.location && <span className="flex items-center"><FiMapPin className="mr-1" /> {user.location}</span>}
                     {user.company && <span className="flex items-center"><FiBriefcase className="mr-1" /> {user.company}</span>}
                     {user.blog && <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500"><FiLink className="mr-1" /> Website</a>}
                     {user.twitter_username && <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500"><FiTwitter className="mr-1" /> Twitter</a>}
                 </div>
                 <div className="mt-4"> <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700"> <FaGithub className="mr-2" /> View on GitHub </a> </div>
             </div>
        </div>
    );
 }

const LanguageChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
function LanguagesChart({ data }) { /* ... (Keep component code as before) ... */
    if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No language data available.</p>;
    const chartData = data.slice(0, 7);
    return (
        <div style={{ width: '100%', height: 300 }}>
             <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Top Languages</h3>
             <ResponsiveContainer> <PieChart> <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name"> {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={LanguageChartColors[index % LanguageChartColors.length]} />)} </Pie> <Tooltip formatter={(value) => `${value.toLocaleString()} bytes`} /> <Legend wrapperStyle={{fontSize: '12px'}}/> </PieChart> </ResponsiveContainer>
        </div>
    );
}

function StarsChart({ data }) { /* ... (Keep component code as before) ... */
    if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No starred repository data available.</p>;
    return (
        <div style={{ width: '100%', height: 300 }}>
             <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Most Starred Repos</h3>
             <ResponsiveContainer> <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} /> <YAxis allowDecimals={false}/> <Tooltip /> <Legend wrapperStyle={{fontSize: '12px'}}/> <Bar dataKey="stars" fill="#8884d8" name="Stars" /> </BarChart> </ResponsiveContainer>
        </div>
    );
}


// --- Main Page Component Logic ---
function GitHubProfileSearcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State solely for the input field's current text
  const [searchInput, setSearchInput] = useState('');
  // State for the username that data fetching is based on
  const [targetUsername, setTargetUsername] = useState(null); // Start null

  const [user, setUser] = useState(null);
  const [languageData, setLanguageData] = useState([]);
  const [topReposData, setTopReposData] = useState([]);
  const [loading, setLoading] = useState(false); // Start false
  const [error, setError] = useState(null);

  // --- Handler for input changes ---
  // **** THIS IS THE CRITICAL FUNCTION FOR TYPING ****
  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };
  // ****************************************************

  // Effect to initialize targetUsername based on URL/default
  useEffect(() => {
    const usernameFromUrl = searchParams.get('username');
    const initialTarget = usernameFromUrl !== null ? usernameFromUrl : DEFAULT_USERNAME;

    // Set target if it's different or hasn't been set yet
    if (initialTarget !== targetUsername) {
        setTargetUsername(initialTarget);
    }
    // Set input value only on initial load or if target changes
    // This prevents overwriting user input after initial load
    if (initialTarget !== searchInput && targetUsername === null) { // Only sync input initially or when target changes drastically
        setSearchInput(initialTarget);
    }

  }, [searchParams, targetUsername]); // Removed searchInput dependency


  // Effect to fetch user data when targetUsername changes
  useEffect(() => {
    if (!targetUsername) {
        setLoading(false); setUser(null); setLanguageData([]); setTopReposData([]); setError(null);
        return;
    }

    const fetchData = async () => {
      setLoading(true); // Start loading
      setError(null);
      console.log(`Fetching data for GitHub user: ${targetUsername}`);

      try {
        const [userData, repoData] = await Promise.all([
          getUserProfile(targetUsername),
          getUserRepos(targetUsername)
        ]);
        setUser(userData);

        if (!repoData || repoData.length === 0) {
          console.log("No repositories found.");
          setLanguageData([]); setTopReposData([]); setLoading(false); return;
        }

        // Fetch Languages (Limited)
        console.warn(`Fetching languages for up to 10 repos for ${targetUsername} (unauthenticated)`);
        const languagePromises = repoData
          .filter(repo => !repo.fork && repo.size > 0).slice(0, 10) // LIMIT fetch
          .map(repo =>
            getRepoLanguages(targetUsername, repo.name)
              .then(languages => ({ languages }))
              .catch(langError => { console.error(`Lang fetch error for ${repo.name}:`, langError.message); return { languages: {} }; })
          );
        const languagesResults = await Promise.all(languagePromises);

        // Process Charts Data
        const langTotals = {}; /* ... aggregation ... */ languagesResults.forEach(result => { for (const [language, bytes] of Object.entries(result.languages)) { langTotals[language] = (langTotals[language] || 0) + bytes; } });
        const processedLangData = Object.entries(langTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        setLanguageData(processedLangData);

        const sortedRepos = [...repoData].sort((a, b) => b.stargazers_count - a.stargazers_count); /* ... */
        const processedTopRepos = sortedRepos.slice(0, 6).map(repo => ({ name: repo.name, stars: repo.stargazers_count })).filter(repo => repo.stars > 0);
        setTopReposData(processedTopRepos);

      } catch (err) {
        console.error("Failed to fetch GitHub profile data:", err);
        setError(err.message || "Could not fetch profile data.");
        setUser(null); setLanguageData([]); setTopReposData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUsername]); // Fetch ONLY when targetUsername changes

  // Form Submission Handler
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedUsername = searchInput.trim();
    // Update URL only if search input is valid and different from current target
    if (trimmedUsername && trimmedUsername !== targetUsername) {
      router.push(`/github?username=${encodeURIComponent(trimmedUsername)}`);
    } else if (!trimmedUsername && targetUsername !== DEFAULT_USERNAME) {
       // If input cleared and current target wasn't default, navigate to default
       router.push(`/github`); // This will make it load the default
    }
  };

  // --- Render ---
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
      {/* Search Input Section */}
      <div className="w-full max-w-lg mx-auto my-4">
         <form onSubmit={handleSearchSubmit} className="relative w-full">
             <input
                 type="text"
                 value={searchInput}
                 onChange={handleInputChange} // *** ENSURE THIS IS CORRECTLY SET ***
                 placeholder="Enter GitHub Username..."
                 className="w-full py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 aria-label="GitHub Username Input"
             />
             {/* Buttons/Icons */}
             <button type="submit" className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none disabled:opacity-50" aria-label="Search GitHub Profile" title="Search" disabled={loading || !searchInput.trim() || searchInput.trim() === targetUsername}><FiSearch size={20} /></button>
             <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-4 text-gray-400 pointer-events-none"><FaGithub size={20} /></div>
         </form>
      </div>

      {/* Conditional Rendering Area */}
      {loading && (
         <div className="flex flex-col items-center justify-center text-center p-10">
            <ScaleLoader color={"#4f46e5"} loading={loading} height={35} width={4} radius={2} margin={2} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile for "{targetUsername || 'default'}"...</p>
        </div>
      )}

      {error && !loading && (
         <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center max-w-lg mx-auto" role="alert">
           <strong className="font-bold">Error!</strong>
           <p>{error}</p>
           { /* Specific error hints */ }
           {(error.includes("API rate limit exceeded") || error.includes("Rate limit likely exceeded")) && (<p className="text-sm mt-1">GitHub API rate limit likely exceeded. Please wait or use a PAT via backend proxy.</p>)}
           {(error.includes("API Error: 404") || error.includes("User not found")) && (<p className="text-sm mt-1">User "{targetUsername}" not found.</p>)}
         </div>
      )}

      {/* Display Profile and Charts */}
      {!loading && !error && user && (
        <div className="space-y-6">
          <UserProfileCard user={user} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"><LanguagesChart data={languageData} /></div>
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"><StarsChart data={topReposData} /></div>
          </div>
        </div>
      )}

      {/* Placeholders */}
      {!loading && !error && !user && targetUsername && (
           <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Could not load profile for "{targetUsername}".</div>
       )}
       {!loading && !error && !user && !targetUsername && ( // Show only if targetUsername hasn't been set yet
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Enter a GitHub username above to search.</div>
        )}

    </div> // Close main container div
  );
}

// --- Export Page with Suspense ---
export default function GithubPage() {
    return (
        <Suspense fallback={
             <div className="flex flex-col items-center justify-center min-h-screen">
                 <ScaleLoader color={"#4f46e5"} height={35} width={4} radius={2} margin={2} />
                 <p className="mt-4 text-gray-600 dark:text-gray-400">Loading GitHub Page...</p>
             </div>
        }>
            <GitHubProfileSearcher />
        </Suspense>
    );
}
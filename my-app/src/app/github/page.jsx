// src/app/github/page.jsx
'use client'; // This page heavily relies on client-side hooks and interaction

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link'; // Optional, for linking back home if needed

// --- Icon Imports ---
import { FiSearch, FiUsers, FiUserPlus, FiMapPin, FiLink, FiTwitter, FiBriefcase } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import Image from 'next/image';

// --- Charting Library Imports ---
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// --- Define Your Default GitHub Username ---
const DEFAULT_USERNAME = 'Rohan-droid7341'; // <-- REPLACE 'your-github-username' WITH YOUR ACTUAL USERNAME

// --- GitHub API Fetching Logic (Keep as before) ---

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_PAT = "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"; // WARNING: Client-side exposure risk

const createHeaders = () => { /* ... (keep createHeaders function as before) ... */
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
    };
    if (GITHUB_PAT) {
        headers['Authorization'] = `token ${GITHUB_PAT}`;
    } else {
        console.warn("GitHub PAT not found. Using unauthenticated requests (lower rate limit).");
    }
    return headers;
};

const handleResponse = async (response) => { /* ... (keep handleResponse function as before) ... */
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = `GitHub API Error: ${response.status} ${response.statusText}. ${errorData.message || ''}`;
        throw new Error(message.trim());
    }
    if (response.status === 204) { return {}; } // Handle No Content for languages
    return response.json();
};

const getUserProfile = async (username) => { /* ... (keep getUserProfile function as before) ... */
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers: createHeaders() });
    return handleResponse(response);
};

const getUserRepos = async (username) => { /* ... (keep getUserRepos function as before) ... */
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed`, { headers: createHeaders() });
    return handleResponse(response);
};

const getRepoLanguages = async (owner, repo) => { /* ... (keep getRepoLanguages function as before) ... */
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, { headers: createHeaders() });
    return handleResponse(response);
};


// --- UI Components (Keep UserProfileCard, LanguagesChart, StarsChart as before) ---

function UserProfileCard({ user }) { /* ... (keep component as before) ... */
    if (!user) return null;
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start p-6 border dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 space-y-4 md:space-y-0 md:space-x-6">
          <Image src={user.avatar_url} alt={`${user.login}'s avatar`} width={120} height={120} className="rounded-full border-4 border-gray-300 dark:border-gray-600" priority />
          <div className="flex-1 text-center md:text-left">
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.login}</h1>
             <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">@{user.login}</p>
             {user.bio && <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>}
             {/* Stats */}
             <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="flex items-center"><FiUsers className="mr-1" /> {user.followers} Followers</span>
                <span className="flex items-center"><FiUserPlus className="mr-1" /> Following {user.following}</span>
                <span className="flex items-center"><FiBriefcase className="mr-1" /> Public Repos: {user.public_repos}</span>
             </div>
             {/* Location, Blog, etc. */}
             <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                {user.location && <span className="flex items-center"><FiMapPin className="mr-1" /> {user.location}</span>}
                {user.company && <span className="flex items-center"><FiBriefcase className="mr-1" /> {user.company}</span>}
                {user.blog && <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500"><FiLink className="mr-1" /> Website</a>}
                {user.twitter_username && <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500"><FiTwitter className="mr-1" /> Twitter</a>}
             </div>
             <div className="mt-4">
                 <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700">
                    <FaGithub className="mr-2" /> View on GitHub
                 </a>
             </div>
          </div>
        </div>
    );
 }
const LanguageChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
function LanguagesChart({ data }) { /* ... (keep component as before) ... */
    if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No language data available.</p>;
    const chartData = data.slice(0, 7);
    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Top Languages</h3>
            <ResponsiveContainer>
                <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={LanguageChartColors[index % LanguageChartColors.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} bytes`} />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
function StarsChart({ data }) { /* ... (keep component as before) ... */
    if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No starred repository data available.</p>;
    return (
        <div style={{ width: '100%', height: 300 }}>
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Most Starred Repos</h3>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false}/>
                <Tooltip />
                <Legend />
                <Bar dataKey="stars" fill="#8884d8" name="Stars" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


function GitHubProfileSearcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');

  const [targetUsername, setTargetUsername] = useState('');

  // State for fetched data
  const [user, setUser] = useState(null);
  const [languageData, setLanguageData] = useState([]);
  const [topReposData, setTopReposData] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading initially for default profile
  const [error, setError] = useState(null);

  // Effect to initialize targetUsername from URL or DEFAULT on initial load/URL change
  useEffect(() => {
    const usernameFromUrl = searchParams.get('username');
    // Determine the username to initially target: URL param or default
    const initialTarget = usernameFromUrl || DEFAULT_USERNAME;

    if (initialTarget !== targetUsername) {
        setTargetUsername(initialTarget);
    }

    if (searchInput !== initialTarget) {
        setSearchInput(initialTarget);
    }

 
    if(initialTarget && initialTarget !== targetUsername) {
        setLoading(true);
    } else if (!initialTarget && !targetUsername) {
        // If navigated back to /github with no param and no current target, stop loading
        setLoading(false);
    }

  }, [searchParams, targetUsername, searchInput]); // Add targetUsername and searchInput to dependencies

  useEffect(() => {
    // Prevent fetching if targetUsername is empty
    if (!targetUsername) {
        setLoading(false); // Ensure loading stops if username becomes empty
        setUser(null);
        setLanguageData([]);
        setTopReposData([]);
        setError(null);
        return;
    }

    const fetchData = async () => {
      console.log(`Fetching data for: ${targetUsername}`);
      // We now set loading=true when targetUsername changes *before* this effect runs
      // setLoading(true); // No longer set loading here
      setError(null);



      try {
        // --- Fetch User and Repos ---
        const [userData, repoData] = await Promise.all([
          getUserProfile(targetUsername),
          getUserRepos(targetUsername)
        ]);
        setUser(userData); // Set user data first

        if (!repoData || repoData.length === 0) {
          console.log("No repositories found for this user.");
          setLanguageData([]); // Clear chart data if no repos
          setTopReposData([]);
          setLoading(false); // Stop loading
          return;
        }

        // --- Fetch Languages (Limited & Careful about rate limits) ---
        console.warn(`Fetching languages for up to 20 repos for ${targetUsername}`);
        const languagePromises = repoData
          .filter(repo => !repo.fork && repo.size > 0)
          .slice(0, 20) // LIMIT language fetches
          .map(repo =>
            getRepoLanguages(targetUsername, repo.name)
              .then(languages => ({ languages }))
              .catch(langError => { console.error(`Lang fetch error for ${repo.name}:`, langError.message); return { languages: {} }; })
          );
        const languagesResults = await Promise.all(languagePromises);

        // --- Process Data for Charts ---
        const langTotals = {};
        languagesResults.forEach(result => { /* ... (aggregation logic as before) ... */
            for (const [language, bytes] of Object.entries(result.languages)) {
                langTotals[language] = (langTotals[language] || 0) + bytes;
              }
        });
        const processedLangData = Object.entries(langTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        setLanguageData(processedLangData);

        const sortedRepos = [...repoData].sort((a, b) => b.stargazers_count - a.stargazers_count);
        const processedTopRepos = sortedRepos.slice(0, 6).map(repo => ({ name: repo.name, stars: repo.stargazers_count })).filter(repo => repo.stars > 0);
        setTopReposData(processedTopRepos);

      } catch (err) {
        console.error("Failed to fetch GitHub profile data:", err);
        setError(err.message || "Could not fetch profile data.");
        setUser(null); // Clear user on error
        setLanguageData([]);
        setTopReposData([]);
      } finally {
        setLoading(false); // Stop loading AFTER fetching/processing is done or errored
      }
    };

    fetchData();
  }, [targetUsername]); // Fetch ONLY when targetUsername changes

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedUsername = searchInput.trim();
    if (!trimmedUsername || trimmedUsername === targetUsername) return; // Don't search if empty or same user

 
    router.push(`/github?username=${encodeURIComponent(trimmedUsername)}`);
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
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter GitHub Username..."
                className="w-full py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="GitHub Username Input"
            />
            <button type="submit" className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none disabled:opacity-50" aria-label="Search GitHub Profile" title="Search" disabled={!searchInput.trim() || loading || searchInput.trim() === targetUsername}>
                <FiSearch size={20} />
            </button>
            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-4 text-gray-400 pointer-events-none">
                <FaGithub size={20} />
            </div>
        </form>
      </div>

      {/* Conditional Rendering Area */}
      {loading && (
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Loading profile for "{targetUsername}"...
        </div>
      )}

      {error && !loading && (
         <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center max-w-lg mx-auto" role="alert">
           <strong className="font-bold">Error!</strong>
           <p>{error}</p>
           {/* Specific error hints */}
           {error.includes("API Error: 404") && <p className="mt-1 text-sm">User "{targetUsername}" not found.</p>}
           {error.includes("API Error: 403") && <p className="mt-1 text-sm">API rate limit likely exceeded. Try again later or configure a GitHub PAT in <code>.env.local</code>.</p>}
         </div>
      )}

      {/* Display Profile and Charts only if NOT loading, NO error, and user data EXISTS */}
      {!loading && !error && user && (
        <div className="space-y-6">
          <UserProfileCard user={user} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]">
                <LanguagesChart data={languageData} />
             </div>
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]">
                <StarsChart data={topReposData} />
             </div>
          </div>
        </div>
      )}

      {/* Placeholder if no search has happened or default load failed silently */}
      {!loading && !error && !user && targetUsername && (
           <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Could not load profile for "{targetUsername}".</div>
       )}

    </div>
  );
}

// --- Export Page with Suspense ---
export default function GithubPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Loading page...</div>}>
            <GitHubProfileSearcher />
        </Suspense>
    );
}
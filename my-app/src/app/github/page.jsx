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

// --- GitHub API Fetching Logic (Consider moving to lib/github.js for bigger apps) ---

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_PAT = process.env.NEXT_PUBLIC_GITHUB_PAT; // WARNING: Client-side exposure risk

const createHeaders = () => {
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

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = `GitHub API Error: ${response.status} ${response.statusText}. ${errorData.message || ''}`;
    throw new Error(message.trim());
  }
   // Handle 204 No Content specifically for languages endpoint
   if (response.status === 204) {
       return {};
   }
  return response.json();
};

const getUserProfile = async (username) => {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, { headers: createHeaders() });
  return handleResponse(response);
};

const getUserRepos = async (username) => {
  // Fetch up to 100 repos, sorted by last push date
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed`, { headers: createHeaders() });
  return handleResponse(response);
};

const getRepoLanguages = async (owner, repo) => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, { headers: createHeaders() });
  return handleResponse(response);
};


// --- UI Components (Defined within the main file for this example) ---

// 1. User Profile Card Component
function UserProfileCard({ user }) {
  if (!user) return null;
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start p-6 border dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 space-y-4 md:space-y-0 md:space-x-6">
      <Image
        src={user.avatar_url} alt={`${user.login}'s avatar`} width={120} height={120}
        className="rounded-full border-4 border-gray-300 dark:border-gray-600" priority
      />
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
        <div className="mt-4">
             <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700">
                <FaGithub className="mr-2" /> View on GitHub
              </a>
        </div>
      </div>
    </div>
  );
}

// 2. Languages Chart Component
const LanguageChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
function LanguagesChart({ data }) {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No language data available.</p>;
  const chartData = data.slice(0, 7); // Show top N languages
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

// 3. Most Starred Repos Chart Component
function StarsChart({ data }) {
  if (!data || data.length === 0) return <p className="text-center text-gray-500 h-full flex items-center justify-center">No starred repository data available.</p>;
  return (
    <div style={{ width: '100%', height: 300 }}>
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">Most Starred Repos</h3>
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stars" fill="#8884d8" name="Stars" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}

// --- Main Page Component Logic ---
function GitHubProfileSearcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for the input field
  const [searchInput, setSearchInput] = useState('');
  // State for the username we are actively searching/displaying
  const [targetUsername, setTargetUsername] = useState('');

  // State for fetched data
  const [user, setUser] = useState(null);
  const [languageData, setLanguageData] = useState([]);
  const [topReposData, setTopReposData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to initialize targetUsername from URL on initial load
  useEffect(() => {
    const usernameFromUrl = searchParams.get('username');
    if (usernameFromUrl) {
      setTargetUsername(usernameFromUrl);
      setSearchInput(usernameFromUrl); // Pre-fill search input if loaded from URL
    }
  }, [searchParams]);

  // Effect to fetch data when targetUsername changes
  useEffect(() => {
    const fetchData = async () => {
      if (!targetUsername) {
          // Clear data if target username is removed (e.g., URL cleared)
          setUser(null);
          setLanguageData([]);
          setTopReposData([]);
          setError(null);
          return;
      };

      console.log(`Fetching data for: ${targetUsername}`);
      setLoading(true);
      setError(null);
      setUser(null); // Clear previous user data immediately
      setLanguageData([]);
      setTopReposData([]);


      try {
        // Fetch profile and repos
        const [userData, repoData] = await Promise.all([
          getUserProfile(targetUsername),
          getUserRepos(targetUsername)
        ]);
        setUser(userData);

        if (!repoData || repoData.length === 0) {
          console.log("No repositories found for this user.");
          setLoading(false);
          return;
        }

        // Process repos for charts
        // WARNING: Fetching languages is rate-limit intensive!
        console.warn("Fetching languages - Be mindful of GitHub API rate limits!");
        const languagePromises = repoData
          .filter(repo => !repo.fork && repo.size > 0) // Filter forks and empty repos
          .slice(0, 20) // Limit to fetching languages for N repos to avoid rate limits
          .map(repo =>
            getRepoLanguages(targetUsername, repo.name)
              .then(languages => ({ languages }))
              .catch(langError => {
                console.error(`Failed to get languages for ${repo.name}:`, langError.message);
                return { languages: {} }; // Continue even if one fails
              })
          );
        const languagesResults = await Promise.all(languagePromises);

        // Aggregate languages
        const langTotals = {};
        languagesResults.forEach(result => {
          for (const [language, bytes] of Object.entries(result.languages)) {
            langTotals[language] = (langTotals[language] || 0) + bytes;
          }
        });
        const processedLangData = Object.entries(langTotals)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        setLanguageData(processedLangData);

        // Process top starred repos
        const sortedRepos = [...repoData].sort((a, b) => b.stargazers_count - a.stargazers_count);
        const processedTopRepos = sortedRepos
          .slice(0, 6) // Show top 6 starred
          .map(repo => ({ name: repo.name, stars: repo.stargazers_count }))
          .filter(repo => repo.stars > 0);
        setTopReposData(processedTopRepos);

      } catch (err) {
        console.error("Failed to fetch GitHub profile data:", err);
        setError(err.message || "Could not fetch profile data. User might not exist or rate limit exceeded.");
        setUser(null); // Ensure user is cleared on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUsername]); // Re-run when the targetUsername changes

  // --- Form Submission Handler ---
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedUsername = searchInput.trim();
    if (!trimmedUsername) return;

    // Update the URL, which will trigger the useEffect via searchParams change
    router.push(`/github?username=${encodeURIComponent(trimmedUsername)}`);
  };

  // --- Render ---
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Optional: Link back home */}
         {/* <div className="mb-4">
            <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
               ← Back to Home
            </Link>
         </div> */}

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
            <button type="submit" className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none disabled:opacity-50" aria-label="Search GitHub Profile" title="Search" disabled={!searchInput.trim() || loading}>
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
        <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center" role="alert">
          <strong className="font-bold">Error!</strong>
          <p>{error}</p>
          {error.includes("API Error: 404") && <p className="mt-1 text-sm">User not found.</p>}
          {error.includes("API Error: 403") && <p className="mt-1 text-sm">API rate limit likely exceeded. Try again later or configure a GitHub PAT.</p>}
        </div>
      )}

      {!loading && !error && user && (
        <div className="space-y-6">
          {/* Profile Card */}
          <UserProfileCard user={user} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"> {/* Ensure min height */}
                <LanguagesChart data={languageData} />
             </div>
             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[350px]"> {/* Ensure min height */}
                <StarsChart data={topReposData} />
             </div>
          </div>
        </div>
      )}

      {/* Initial state or no user searched yet */}
       {!loading && !error && !user && targetUsername && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">User "{targetUsername}" not found or data could not be loaded.</div>
        )}
        {!loading && !error && !user && !targetUsername && (
             <div className="text-center text-gray-500 dark:text-gray-400 mt-10">Enter a GitHub username above to search.</div>
         )}

    </div>
  );
}

// --- Export Page with Suspense (Recommended when using useSearchParams) ---
export default function GithubPage() {
    return (
        // Suspense boundary is necessary because GitHubProfileSearcher uses useSearchParams
        <Suspense fallback={<div className="text-center p-10">Loading search parameters...</div>}>
            <GitHubProfileSearcher />
        </Suspense>
    );
}
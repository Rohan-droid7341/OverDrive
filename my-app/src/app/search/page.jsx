'use client'; 

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; 
import Link from 'next/link'; 

function SearchResultsLoader() {
    return <div className="text-center p-10">Loading search results...</div>;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || ''; 

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const cxId = process.env.NEXT_PUBLIC_GOOGLE_CX_ID;

  useEffect(() => {

    if (!searchQuery.trim()) {
      setResults([]); 
      setError(null);
      setLoading(false);
      return;
    }

    if (!apiKey || !cxId) {
        setError("API Key or Search Engine ID is missing in configuration.");
        setLoading(false);
        return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setResults([]); 

      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cxId}&q=${encodeURIComponent(searchQuery)}`;
      console.log("Fetching search results from:", apiUrl); 

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            let errorDetails = `HTTP error! Status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetails += ` - ${errorData?.error?.message || response.statusText}`;
            } catch (parseError)
            throw new Error(errorDetails);
        }
        const data = await response.json();

        if (data && data.items) {
          setResults(data.items);
        } else {
          setResults([]);
          console.log("No results found or unexpected API response:", data);
        }
      } catch (err) {
        console.error("Google Search API fetch error:", err);
        setError(err.message || "An error occurred while searching.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

  }, [searchQuery, apiKey, cxId]);

  return (
    <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Search Results for: <span className="text-blue-600 dark:text-blue-400 break-words">{searchQuery}</span>
        </h1>

        <div className="mb-4">
            <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
               ← Back to Home
            </Link>
        </div>

        {loading && <div className="text-center text-gray-600 dark:text-gray-400 py-5">Searching...</div>}

        {error && (
          <div className="my-4 p-3 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="mt-4 space-y-5">
            {results.map((item, index) => (
              <div key={item.cacheId || `result-${index}`} className="p-4 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-xl font-medium hover:underline break-words"
                >
                  {item.title}
                </a>
                <p className="text-sm text-green-700 dark:text-green-500 mt-1 truncate">{item.formattedUrl || item.link}</p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.snippet}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-6 py-5">
                No results found for "{searchQuery}". Try a different search term.
            </div>
        )}

         {!loading && !error && !searchQuery && (
             <div className="text-center text-gray-500 dark:text-gray-400 mt-6 py-5">
                 Please enter a search term on the home page.
             </div>
         )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchResultsLoader />}>
            <SearchResults />
        </Suspense>
    );
}
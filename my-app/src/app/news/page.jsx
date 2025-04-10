'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; 
import { FiSearch } from 'react-icons/fi';
import { ScaleLoader } from 'react-spinners';
import { DateTime } from 'luxon'; 

const NEWS_API_KEY = "3aa86bc84f774542bd0cc1e01a3589c4";
const NEWS_API_BASE = 'https://newsapi.org/v2';
const DEFAULT_COUNTRY = 'us';
const PAGE_SIZE = 12;

const fetchNewsApi = async ({ query = '', page = 1, category = '', country = '' }) => {
    if (!NEWS_API_KEY) {
        throw new Error("NewsAPI key is missing. Please set NEXT_PUBLIC_NEWS_API_KEY in .env.local");
    }

    let endpoint = '';
    const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
    });

    if (query) {
        endpoint = '/everything';
        params.append('q', query);
        params.append('sortBy', 'publishedAt');
    } else {
        endpoint = '/top-headlines';
        if (category) params.append('category', category);
        if (country) params.append('country', country);
        else params.append('country', DEFAULT_COUNTRY);
    }

    const url = `${NEWS_API_BASE}${endpoint}?${params.toString()}`;
    console.log(`Fetching News API: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(`NewsAPI Error: ${data.code || data.status} - ${data.message || 'Request failed'}`);
        }
        return {
            articles: data.articles || [],
            totalResults: data.totalResults || 0,
        };
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
};


function ArticleCard({ article }) {
    if (!article) return null;

    const formattedDate = article.publishedAt
        ? DateTime.fromISO(article.publishedAt).toLocaleString(DateTime.DATETIME_MED)
        : 'Date unavailable';

    const placeholderImage = '/placeholder-image.png'; 

    return (
        <div className="flex flex-col overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 h-full">
            <div className="flex-shrink-0 h-48 w-full relative bg-gray-200 dark:bg-gray-700"> 
                <Image
                    src={article.urlToImage || placeholderImage}
                    alt={article.title || 'Article image'}
                    layout="fill"
                    objectFit="cover"
                    unoptimized={true} 
                    onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                />
            </div>
            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="flex-1">
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                        {article.source?.name || 'Unknown Source'}
                    </p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mt-1 group">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                            {article.title || 'Untitled Article'}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                            {article.description || 'No description available.'}
                        </p>
                    </a>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {formattedDate}
                </div>
            </div>
        </div>
    );
}

function NewsSearcher() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchInput, setSearchInput] = useState('');
    const [targetQuery, setTargetQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [articles, setArticles] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const queryFromUrl = searchParams.get('q') || '';
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        const page = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

        if (queryFromUrl !== targetQuery) {
            setTargetQuery(queryFromUrl);
        }
        if (page !== currentPage) {
            setCurrentPage(page);
        }
        if (queryFromUrl !== searchInput) {
            setSearchInput(queryFromUrl);
        }
        if (queryFromUrl !== targetQuery || page !== currentPage) {
            setLoading(true);
        } else {
         
             setLoading(true);
        }

    }, [searchParams, currentPage, targetQuery, searchInput]);

    useEffect(() => {
        if (!NEWS_API_KEY) {
            setError("NewsAPI key is missing.");
            setLoading(false);
            return;
        }
        if (targetQuery === null || targetQuery === undefined) {
             setLoading(false); 
             return;
        }


        const fetchNews = async () => {
    
             if (!loading) setLoading(true);
            setError(null);
            console.log(`Fetching page ${currentPage} for query: "${targetQuery}"`);

            try {
                const result = await fetchNewsApi({ query: targetQuery, page: currentPage });
                setArticles(result.articles);
                setTotalResults(result.totalResults);
            } catch (err) {
                console.error("Failed to fetch news:", err);
                setError(err.message || "Could not fetch news articles.");
                setArticles([]);
                setTotalResults(0);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();

    }, [targetQuery, currentPage]); 

    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const trimmedQuery = searchInput.trim();
        router.push(`/news?q=${encodeURIComponent(trimmedQuery)}&page=1`);
    };

    const handlePageChange = (newPage) => {
        const totalPages = Math.ceil(totalResults / PAGE_SIZE);
        if (newPage < 1 || newPage > totalPages || newPage === currentPage || loading) return;
        router.push(`/news?q=${encodeURIComponent(targetQuery)}&page=${newPage}`);
        window.scrollTo(0, 0);
    };

    const totalPages = Math.ceil(totalResults / PAGE_SIZE);

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
            <div className="w-full max-w-lg mx-auto my-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <input
                        type="text" value={searchInput} onChange={handleInputChange}
                        placeholder="Search news articles..."
                        className="w-full py-3 pl-12 pr-4 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        aria-label="News Search Input"
                    />
                    <button type="submit" className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none disabled:opacity-50" aria-label="Search News" title="Search" disabled={loading || !searchInput.trim()}>
                        <FiSearch size={20} />
                    </button>
                </form>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center text-center p-10">
                    <ScaleLoader color={"#000000"} loading={loading} height={35} width={4} radius={2} margin={2} />
                    <p className="mt-4 text-black dark:text-gray-400">Fetching news...</p>
                </div>
            )}

            {error && !loading && (
                 <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <p>{error}</p>
                 </div>
            )}

            {!loading && !error && articles.length > 0 && (
                <>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {targetQuery ? `Showing results for "${targetQuery}"` : `Top Headlines from ${DEFAULT_COUNTRY.toUpperCase()}`} (Page {currentPage} of {totalPages})
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {articles.map((article, index) => (
                            <ArticleCard key={article.url || `article-${index}`} article={article} />
                        ))}
                    </div>

                    {totalResults > PAGE_SIZE && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                             <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"> Previous </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300"> Page {currentPage} of {totalPages} </span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"> Next </button>
                        </div>
                    )}
                </>
            )}

            {!loading && !error && articles.length === 0 && (
                 <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                     {targetQuery ? `No results found for "${targetQuery}".` : 'No top headlines found. Try searching.'}
                 </div>
             )}

            <div className="text-center mt-10 text-xs text-gray-400">
                Powered by <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">NewsAPI.org</a>
            </div>

        </div>
    );
}

export default function NewsPage() {
    return (
        <Suspense fallback={
             <div className="flex flex-col items-center justify-center min-h-screen">
                <ScaleLoader color={"#4f46e5"} height={35} width={4} radius={2} margin={2} />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading News Page...</p>
            </div>
        }>
            <NewsSearcher />
        </Suspense>
    );
}
// src/app/books/page.jsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image'; // Using unoptimized={true}
import { FiSearch, FiBookOpen } from 'react-icons/fi';
import { ScaleLoader } from 'react-spinners';
import { DateTime } from 'luxon'; // Keep for potential future date use if needed

// --- Google Books API Configuration ---
const BOOKS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY; // Optional
const BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';
const MAX_RESULTS_PER_PAGE = 12;
const DEFAULT_BOOK_QUERY = "popular programming books"; // Query for sample books

// --- API Fetching Logic ---
const fetchBooksApi = async ({ query = '', page = 1 }) => {
    if (!query) {
        // Don't attempt fetch if the query is empty
        return { items: [], totalItems: 0 };
    }
    const startIndex = (page - 1) * MAX_RESULTS_PER_PAGE;
    const params = new URLSearchParams({
        q: query,
        startIndex: startIndex.toString(),
        maxResults: MAX_RESULTS_PER_PAGE.toString(),
        orderBy: 'relevance' // Fetch relevant books for default query
    });
    if (BOOKS_API_KEY) {
        params.append('key', BOOKS_API_KEY);
    }
    const url = `${BOOKS_API_BASE}/volumes?${params.toString()}`;
    console.log(`Fetching Google Books API: ${url}`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(`Google Books API Error: ${data?.error?.message || response.statusText || 'Request failed'}`);
        }
        // Ensure items array exists and filter potentially incomplete items
        return {
            items: data.items?.filter(item => item.volumeInfo) || [],
            totalItems: data.totalItems || 0,
        };
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error; // Re-throw to be caught by the component
    }
};


function BookCard({ book }) {
    // Added extra check for volumeInfo existence
    if (!book || !book.volumeInfo) return null;

    const { title, authors, description, imageLinks, infoLink } = book.volumeInfo;
    const thumbnailUrl = imageLinks?.thumbnail || imageLinks?.smallThumbnail;
    // Ensure placeholder image path is correct and image exists in /public
    const placeholderImage = '/placeholder-book-cover.png';

    return (
        <div className="flex flex-col overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 h-full">
            {/* Image */}
            <div className="flex-shrink-0 h-56 w-full relative bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Image
                    src={thumbnailUrl || placeholderImage}
                    alt={title ? `Cover of ${title}` : 'Book cover'}
                    layout="fill"
                    objectFit="contain" // Use 'contain' to see the whole cover
                    unoptimized={true} 
                    onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }} // Fallback on error
                />
            </div>
            {/* Content */}
            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="flex-1">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white line-clamp-2">
                         {title || 'Untitled Book'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 line-clamp-1">
                        by {authors?.join(', ') || 'Unknown Author'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                        {description || 'No description available.'}
                    </p>
                </div>
                {infoLink && (
                     <div className="mt-3">
                         <a href={infoLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                             More Info →
                         </a>
                     </div>
                 )}
            </div>
        </div>
    );
}

// --- Main Page Component Logic ---
function BooksSearcher() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State solely for the input field's current text
    const [searchInput, setSearchInput] = useState('');
    // State for the query that data fetching is based on (initialized later in effect)
    const [targetQuery, setTargetQuery] = useState(null); // Start null initially
    const [currentPage, setCurrentPage] = useState(1);

    const [books, setBooks] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false); // Start not loading, set true when fetch begins
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    // --- Effect to initialize targetQuery and currentPage based on URL/default ---
    // Runs ONCE on mount and when URL params change
    useEffect(() => {
        console.log("Params effect running");
        const queryFromUrl = searchParams.get('q');
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        const page = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;


        const initialFetchQuery = queryFromUrl !== null ? queryFromUrl : DEFAULT_BOOK_QUERY;

        // Set the target query state, this will trigger the data fetching effect
        setTargetQuery(initialFetchQuery);
        setCurrentPage(page);

        // Set the initial value of the INPUT field based on what we're targeting
        // Ensures input matches loaded data (default or from URL)
        if (searchInput !== initialFetchQuery) {
           setSearchInput(initialFetchQuery);
        }
         // Set loading to true here only if we are actually setting a target query
         if (initialFetchQuery) {
             setLoading(true);
         }

    }, [searchParams]); // Depend ONLY on searchParams

    useEffect(() => {
      
        if (targetQuery === null || targetQuery === '') {
            setBooks([]);
            setTotalItems(0);
            setLoading(false); // Ensure loading stops
            setError(null);
            return;
        }

        const fetchBooks = async () => {
            // Ensure loading is true when starting fetch
            setLoading(true);
            setError(null);
            console.log(`Fetching page ${currentPage} for book query: "${targetQuery}"`);

            try {
                const result = await fetchBooksApi({ query: targetQuery, page: currentPage });
                setBooks(result.items);
                setTotalItems(result.totalItems);
            } catch (err) {
                console.error("Failed to fetch books:", err);
                setError(err.message || "Could not fetch books.");
                setBooks([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();

    }, [targetQuery, currentPage]); // Fetch when target or page changes

    // --- Form Submission Handler ---
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const trimmedQuery = searchInput.trim();
        // Only push to router if the SEARCH INPUT is not empty and DIFFERENT from the current TARGET query
        if (trimmedQuery && trimmedQuery !== targetQuery) {
             // Reset to page 1 and update URL
             router.push(`/books?q=${encodeURIComponent(trimmedQuery)}&page=1`);
        } else if (!trimmedQuery && targetQuery !== '') {
            // If user clears input and submits, navigate to show the default query again
            router.push(`/books?page=1`);
        }
    };

    // --- Page Change Handler ---
    const handlePageChange = (newPage) => {
        const totalPages = Math.ceil(totalItems / MAX_RESULTS_PER_PAGE);
        if (newPage < 1 || newPage > totalPages || newPage === currentPage || loading) return;
        // Update URL, this triggers first useEffect which updates currentPage & targetQuery (if needed)
        router.push(`/books?q=${encodeURIComponent(targetQuery)}&page=${newPage}`);
        window.scrollTo(0, 0); // Scroll to top
    };

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / MAX_RESULTS_PER_PAGE);

    // --- Render ---
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
            {/* Search Input */}
            <div className="w-full max-w-lg mx-auto my-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                    <input
                        type="text"
                        value={searchInput} // Value comes ONLY from searchInput state
                        onChange={handleInputChange} // onChange ONLY updates searchInput state
                        placeholder="Search for books (title, author, ISBN...)"
                        className="w-full py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        aria-label="Book Search Input"
                    />
                    <button
                        type="submit"
                        className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-green-600 dark:hover:text-green-400 focus:outline-none disabled:opacity-50"
                        aria-label="Search Books" title="Search"
                        disabled={loading || !searchInput.trim() || searchInput.trim() === targetQuery} // Disable if loading, empty, or same as current target
                    >
                        <FiSearch size={20} />
                    </button>
                     <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-4 text-gray-400 pointer-events-none">
                        <FiBookOpen size={20} />
                    </div>
                </form>
            </div>

            {/* Conditional Rendering Area */}
            {loading && (
                 <div className="flex flex-col items-center justify-center text-center p-10">
                    <ScaleLoader color={"#10b981"} loading={loading} height={35} width={4} radius={2} margin={2} />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Searching for books...</p>
                </div>
            )}

            {error && !loading && (
                 <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <p>{error}</p>
                 </div>
            )}

            {/* Results Grid */}
            {!loading && !error && books.length > 0 && (
                <>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {/* Adjust message for default query */}
                        {targetQuery === DEFAULT_BOOK_QUERY && !searchParams.get('q')
                           ? `Showing sample results for "${DEFAULT_BOOK_QUERY}"`
                           : `Found approx. ${totalItems.toLocaleString()} results for "${targetQuery}"`
                        } (Page {currentPage} of {totalPages})
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {books.map((book) => (
                            <BookCard key={book.id || book.etag || `book-${Math.random()}`} book={book} />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > MAX_RESULTS_PER_PAGE && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                             <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || loading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"> Previous </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300"> Page {currentPage} of {totalPages} </span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || loading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"> Next </button>
                        </div>
                    )}
                </>
            )}

            {/* No Results State */}
            {!loading && !error && books.length === 0 && targetQuery && ( // Show only if a query was attempted and resulted in zero books
                 <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                     No books found for "{targetQuery}".
                 </div>
             )}

             {/* Initial State Prompt (Show only if targetQuery is still null or empty string) */}
             {!loading && !error && !targetQuery && (
                 <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                     Enter a search term above to find books.
                 </div>
             )}

        </div> // Close main container div
    );
}

// --- Export Page with Suspense ---
export default function BooksPage() {
    return (
        <Suspense fallback={
             <div className="flex flex-col items-center justify-center min-h-screen">
                <ScaleLoader color={"#10b981"} height={35} width={4} radius={2} margin={2} />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Books Page...</p>
            </div>
        }>
            <BooksSearcher />
        </Suspense>
    );
}
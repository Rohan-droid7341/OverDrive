'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FiSearch, FiFilm, FiStar, FiInfo } from 'react-icons/fi';
import { ScaleLoader } from 'react-spinners';

const OMDB_API_KEY = "79729d00";
const OMDB_API_BASE = 'https://www.omdbapi.com/';
const DEFAULT_MOVIE_QUERY = "Minecraft"; 


const RESULTS_PER_PAGE = 10;

const fetchOmdbApiSearch = async ({ query = '', page = 1 }) => {
    if (!OMDB_API_KEY) throw new Error("OMDb API key missing.");
    if (!query) return { Search: [], totalResults: "0" };

    const params = new URLSearchParams({
        apikey: OMDB_API_KEY,
        s: query,
        type: 'movie',
        page: page.toString(),
    });
    const url = `${OMDB_API_BASE}?${params.toString()}`;
    console.log(`Fetching OMDb Search API: ${url}`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === 'False') {
            if (data.Error === "Movie not found!") return { Search: [], totalResults: "0" };
            throw new Error(`OMDb API Error: ${data.Error || 'Request failed'}`);
        }
        return { Search: data.Search || [], totalResults: data.totalResults || "0" };
    } catch (error) { console.error(`Error fetching ${url}:`, error); throw error; }
};

const fetchOmdbApiById = async (imdbId) => {
    if (!OMDB_API_KEY) throw new Error("OMDb API key missing.");
    if (!imdbId) throw new Error("IMDb ID is required.");

    const params = new URLSearchParams({ apikey: OMDB_API_KEY, i: imdbId, plot: 'full' });
    const url = `${OMDB_API_BASE}?${params.toString()}`;
    console.log(`Fetching OMDb Detail API: ${url}`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === 'False') {
            throw new Error(`OMDb API Error: ${data.Error || 'Movie not found or request failed'}`);
        }
        return data; 
    } catch (error) { console.error(`Error fetching ${url}:`, error); throw error; }
};


function MovieSearchResultCard({ movie, onSelectMovie }) {
    if (!movie || !movie.Title) return null;
    const { Title, Year, imdbID, Poster } = movie;
    const placeholderImage = '/placeholder-movie-poster.png';
    const imageUrl = Poster && Poster !== 'N/A' ? Poster : null;

    return (
        <div
            className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 bg-white dark:bg-gray-800 border dark:border-gray-700 h-full cursor-pointer"
            onClick={() => onSelectMovie(imdbID)} 
        >
            <div className="flex-shrink-0 h-64 w-full relative bg-gray-200 dark:bg-gray-700">
                <Image
                    src={imageUrl || placeholderImage} alt={`Poster for ${Title}`} layout="fill" objectFit="cover" unoptimized={true}
                    onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2" title={Title}>
                    {Title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Year}</p>
                 <button
                    onClick={(e) => { e.stopPropagation(); onSelectMovie(imdbID); }} // Prevent div click, still trigger select
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                 >
                    <FiInfo className="mr-1"/> View Details
                </button>
            </div>
        </div>
    );
}


function MovieDetailsDisplay({ movie }) {
     if (!movie || movie.Response === 'False') return <div className="text-center text-gray-500 p-6">Select a movie from the search results to see details.</div>; // Placeholder if no movie selected

    const { 
        Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors,
        Plot, Language, Country, Awards, Poster, Ratings, Metascore,
        imdbRating, imdbVotes, imdbID, Production
    } = movie;
    const placeholderImage = '/placeholder-movie-poster.png';
    const imageUrl = Poster && Poster !== 'N/A' ? Poster : null;
    const renderRatings = () => { 
         const sources = Ratings || [];
         if (imdbRating && imdbRating !== 'N/A') sources.unshift({ Source: "IMDb", Value: imdbRating + "/10" });
         if (Metascore && Metascore !== 'N/A') sources.push({ Source: "Metascore", Value: Metascore + "/100" });
         if (sources.length === 0) return <p>No ratings available.</p>;
         return (<ul className="space-y-1 list-disc list-inside">{sources.map((r, i) => <li key={i}><span className="font-semibold">{r.Source}:</span> {r.Value}</li>)}</ul>)
     };

    return (
        <div className="mt-8 max-w-4xl mx-auto p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700">
          
             <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                 <div className="md:w-1/3 flex-shrink-0">
                     <div className="aspect-[2/3] relative bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                         <Image src={imageUrl || placeholderImage} alt={`Poster for ${Title}`} layout="fill" objectFit="cover" unoptimized={true} onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }} priority />
                     </div>
                 </div>
                 <div className="md:w-2/3">
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{Title || 'N/A'}</h2>
                     <div className="text-sm text-gray-500 dark:text-gray-400 mb-4"><span>{Year || 'N/A'}</span>{Rated && Rated !== 'N/A' && <><span className="mx-2">|</span><span>{Rated}</span></>} {Runtime && Runtime !== 'N/A' && <><span className="mx-2">|</span><span>{Runtime}</span></>}</div>
                     {Genre && Genre !== 'N/A' && <p className="mb-4 text-sm"><span className="font-semibold">Genre:</span> {Genre}</p>}
                     <h3 className="text-xl font-semibold mt-4 mb-2">Plot Summary</h3>
                     <p className="text-gray-700 dark:text-gray-300 mb-4">{Plot || 'N/A'}</p>
                     <h3 className="text-xl font-semibold mt-4 mb-2">Ratings</h3>
                     <div className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{renderRatings()}</div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4 text-gray-700 dark:text-gray-300">{Director && Director !== 'N/A' && <div><span className="font-semibold">Director:</span> {Director}</div>}{Writer && Writer !== 'N/A' && <div><span className="font-semibold">Writer(s):</span> {Writer}</div>}{Actors && Actors !== 'N/A' && <div className="col-span-1 sm:col-span-2"><span className="font-semibold">Actors:</span> {Actors}</div>}{Language && Language !== 'N/A' && <div><span className="font-semibold">Language:</span> {Language}</div>}{Country && Country !== 'N/A' && <div><span className="font-semibold">Country:</span> {Country}</div>}{Awards && Awards !== 'N/A' && <div><span className="font-semibold">Awards:</span> {Awards}</div>}{Production && Production !== 'N/A' && <div className="col-span-1 sm:col-span-2"><span className="font-semibold">Production:</span> {Production}</div>}{imdbVotes && imdbVotes !== 'N/A' && <div><span className="font-semibold">IMDb Votes:</span> {imdbVotes}</div>}</div>
                     <div className="mt-6"> <a href={`https://www.imdb.com/title/${imdbID}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"> <FiFilm className="mr-2" /> View on IMDb </a> </div>
                 </div>
             </div>
        </div>
    );
}


function MoviesSearcher() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchInput, setSearchInput] = useState('');
    const [targetQuery, setTargetQuery] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); 
    const [selectedMovieId, setSelectedMovieId] = useState(null); 

    const [searchResults, setSearchResults] = useState([]); 
    const [detailedMovie, setDetailedMovie] = useState(null); 
    const [totalResults, setTotalResults] = useState(0);

    const [loadingSearch, setLoadingSearch] = useState(false); 
    const [loadingDetails, setLoadingDetails] = useState(false); 
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    // --- Effect to initialize state from URL ---
    useEffect(() => {
        const queryFromUrl = searchParams.get('q');
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        const idFromUrl = searchParams.get('id'); // Check for specific ID to show details
        const page = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

        const initialQuery = queryFromUrl !== null ? queryFromUrl : DEFAULT_MOVIE_QUERY;

        // Set target query and current page for potential search list fetch
        if (initialQuery !== targetQuery) setTargetQuery(initialQuery);
        if (page !== currentPage) setCurrentPage(page);
        if (initialQuery !== searchInput) setSearchInput(initialQuery);

        // Set the ID for detailed view if present in URL
        if (idFromUrl && idFromUrl !== selectedMovieId) {
             setSelectedMovieId(idFromUrl);
        } else if (!idFromUrl && selectedMovieId) {
             // If ID removed from URL, clear selected movie
             setSelectedMovieId(null);
             setDetailedMovie(null);
        }

         // Set loading if a query or ID exists, fetch effects will handle details
        if (initialQuery || idFromUrl) {
            // Avoid setting loading true if only page changed without query/id change
             if((initialQuery !== targetQuery && initialQuery) || page !== currentPage || (idFromUrl && idFromUrl !== selectedMovieId)) {
                 setLoadingSearch(true); // Assume list might load
                 if(idFromUrl && idFromUrl !== selectedMovieId) setLoadingDetails(true); // Load details if ID changes
             }
        } else {
             setLoadingSearch(false);
             setLoadingDetails(false);
        }


    }, [searchParams, currentPage, targetQuery, searchInput, selectedMovieId]); // Added selectedMovieId

    useEffect(() => {
        if (targetQuery === null || targetQuery === '') {
            setSearchResults([]); setTotalResults(0); setLoadingSearch(false); setError(null);
            return;
        }
         if (selectedMovieId && targetQuery === searchParams.get('q')) {
             setLoadingSearch(false); 
             return;
         }


        if (!OMDB_API_KEY) { setError("OMDb API key missing."); setLoadingSearch(false); return; }

        const fetchList = async () => {
             if(!loadingSearch) setLoadingSearch(true);
            setError(null); // Clear previous errors
            setDetailedMovie(null); 
             setSelectedMovieId(null); 


            console.log(`Fetching SEARCH page ${currentPage} for query: "${targetQuery}"`);
            try {
                const result = await fetchOmdbApiSearch({ query: targetQuery, page: currentPage });
                setSearchResults(result.Search);
                setTotalResults(parseInt(result.totalResults, 10) || 0);
            } catch (err) {
                console.error("Failed to fetch OMDb search list:", err);
                setError(err.message || "Could not perform search.");
                setSearchResults([]); setTotalResults(0);
            } finally {
                setLoadingSearch(false);
            }
        };

        fetchList();

    }, [targetQuery, currentPage]); // Fetch list when query or page changes

     // --- Effect to fetch DETAILED movie data ---
    useEffect(() => {
        // Fetch details only if an ID is selected
        if (!selectedMovieId) {
             setDetailedMovie(null); // Clear details if no ID selected
             setLoadingDetails(false);
             return;
        };
        if (!OMDB_API_KEY) { setError("OMDb API key missing."); setLoadingDetails(false); return; }

        const fetchDetails = async () => {
             if(!loadingDetails) setLoadingDetails(true);
             setError(null); // Clear general errors when fetching details specifically
             console.log(`Fetching DETAILS for IMDb ID: ${selectedMovieId}`);
            try {
                const result = await fetchOmdbApiById(selectedMovieId);
                setDetailedMovie(result);
            } catch (err) {
                console.error("Failed to fetch OMDb details:", err);
                setError(err.message || "Could not load movie details."); // Set specific error?
                setDetailedMovie(null);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();

    }, [selectedMovieId]); // Fetch details ONLY when selectedMovieId changes


    // --- Handlers ---
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const trimmedQuery = searchInput.trim();
        if (!trimmedQuery || trimmedQuery === targetQuery) return;
        // Update URL for SEARCH results (clears ID param)
        router.push(`/movies?q=${encodeURIComponent(trimmedQuery)}&page=1`);
    };

    const handlePageChange = (newPage) => {
        const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
                if (newPage < 1 || newPage > totalPages || newPage === currentPage || loadingSearch) return;
        // Update URL for SEARCH results pagination
        router.push(`/movies?q=${encodeURIComponent(targetQuery)}&page=${newPage}`);
        window.scrollTo(0, 0);
    };

    // Handler when a movie card from the list is clicked
    const handleSelectMovie = (imdbID) => {
        setSelectedMovieId(imdbID); // Set the ID to fetch details for

        setLoadingDetails(true); // Show loading for details immediately
         window.scrollTo(0, 0); // Scroll up to show details
    };

    // --- Render ---
    const totalSearchPages = Math.ceil(totalResults / RESULTS_PER_PAGE);    

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
            {/* Search Input */}
            <div className="w-full max-w-lg mx-auto my-4">
                {/* ... Form with input, onChange, onSubmit etc ... */}
                 <form onSubmit={handleSearchSubmit} className="relative w-full">
                     <input type="text" value={searchInput} onChange={handleInputChange} placeholder="Search for movies by title..." className="w-full py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" aria-label="Movie Search Input"/>
                     <button type="submit" className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none disabled:opacity-50" aria-label="Search Movies" title="Search" disabled={loadingSearch || !searchInput.trim() || searchInput.trim() === targetQuery}><FiSearch size={20} /></button>
                     <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-4 text-gray-400 pointer-events-none"><FiFilm size={20} /></div>
                 </form>
            </div>

             {/* Loading State for Search List */}
            {loadingSearch && !loadingDetails && ( // Show list loading only if not loading details
                 <div className="flex flex-col items-center justify-center text-center p-10">
                    <ScaleLoader color={"#8b5cf6"} loading={loadingSearch} height={35} width={4} radius={2} margin={2} />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Searching for movies...</p>
                </div>
            )}

             {/* Error State */}
            {error && !loadingSearch && !loadingDetails && ( /* Show error if nothing else is loading */
                 <div className="my-4 p-4 rounded bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 text-center max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error!</strong> <p>{error}</p>
                 </div>
            )}

           
             {loadingDetails && (
                <div className="flex flex-col items-center justify-center text-center p-10">
                    <ScaleLoader color={"#8b5cf6"} loading={loadingDetails} height={35} width={4} radius={2} margin={2} />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading movie details...</p>
                </div>
             )}
             {/* Show details if loaded and an ID was selected */}
            {!loadingDetails && selectedMovieId && detailedMovie && (
                 <MovieDetailsDisplay movie={detailedMovie} />
            )}
             {/* Show message if detail load failed for a selected ID */}
             {!loadingDetails && selectedMovieId && !detailedMovie && error && (
                  <p className="text-center text-red-500 mt-6">Could not load details for the selected movie.</p>
              )}


            {/* Search Results Grid - Show only if NOT loading details and NOT showing details already */}
             {!loadingSearch && !loadingDetails && !selectedMovieId && !error && searchResults.length > 0 && (
                <>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {targetQuery === DEFAULT_MOVIE_QUERY && !searchParams.get('q')
                           ? `Showing sample results for "${DEFAULT_MOVIE_QUERY}"`
                           : `Found approx. ${totalResults.toLocaleString()} results for "${targetQuery}"`
                        } (Page {currentPage} of {totalSearchPages})
                    </div>

                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"> {/* More columns for smaller cards */}
                        {searchResults.map((movie) => (
                            <MovieSearchResultCard
                                key={movie.imdbID}
                                movie={movie}
                                onSelectMovie={handleSelectMovie} // Pass handler
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalResults > RESULTS_PER_PAGE && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || loadingSearch} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"> Previous </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300"> Page {currentPage} of {totalSearchPages} </span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalSearchPages || loadingSearch} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"> Next </button>
                        </div>
                    )}
                </>
            )}

            {/* No Results or Initial State Messages */}
             {!loadingSearch && !loadingDetails && !selectedMovieId && !error && searchResults.length === 0 && targetQuery && (
                 <div className="text-center text-gray-500 dark:text-gray-400 mt-10"> No movies found for "{targetQuery}". </div>
             )}
             {!loadingSearch && !loadingDetails && !selectedMovieId && !error && !targetQuery && (
                 <div className="text-center text-gray-500 dark:text-gray-400 mt-10"> Enter a movie title above to search OMDb. </div>
             )}


             {/* OMDb Attribution */}
             <div className="text-center mt-12 text-xs text-gray-400">
                 Movie data provided by <a href="https://omdbapi.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">OMDb API</a>
             </div>

        </div> // Close main container div
    );
}

// --- Export Page with Suspense ---
export default function MoviesPage() {
    return (
        <Suspense fallback={ <div className="flex flex-col items-center justify-center min-h-screen">
                        <ScaleLoader color={"#10b981"} height={35} width={4} radius={2} margin={2} />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Books Page...</p>
                    </div>}>
            <MoviesSearcher />
        </Suspense>
    );
}
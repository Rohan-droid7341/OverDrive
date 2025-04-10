'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc'; 

export default function GoogleSearchInput() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full my-6"> 
      <form onSubmit={handleSearchSubmit} className="relative w-full"> 
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search the web..."
          className="w-full py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          aria-label="Search Input"
        />

        <button
           type="submit"
           className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none disabled:opacity-50"
           aria-label="Submit Search"
           title="Search"
           disabled={!query.trim()}
        >
           <FiSearch size={20} />
        </button>

        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-4 text-gray-400 pointer-events-none"> {/* pointer-events-none so it doesn't interfere with input clicks */}
           <FcGoogle size={20} />
        </div>
      </form>
    </div>
  );
}
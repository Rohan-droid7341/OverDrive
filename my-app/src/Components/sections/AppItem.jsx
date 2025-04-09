// src/components/sections/AppItem.jsx
import React from 'react';
import Link from 'next/link'; // Import Next Link

// ... (PlaceholderIcon if you are using it) ...

export default function AppItem({ label, href = "#" }) {

    const isInternal = href.startsWith('/'); // Check if it's an internal route

    const content = (
        <>
            {/* <PlaceholderIcon /> */}
            <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                {label}
            </span>
        </>
    );

    const commonClasses = `
        bg-white dark:bg-gray-800
        p-3 md:p-4
        rounded-lg
        shadow-sm
        flex flex-col items-center justify-center
        text-center
        aspect-square
        cursor-pointer
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition duration-150 ease-in-out
        border border-gray-200 dark:border-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `;

    if (isInternal) {
        // Use Next.js Link for internal navigation
        return (
            <Link href={href} className={commonClasses}>
                {content}
            </Link>
        );
    } else {
        // Use a standard anchor tag for external links or placeholders
        // Or handle with onClick for placeholders
        return (
            <a
                href={href}
                // Open external links in new tab safely
                target={href !== "#" ? "_blank" : undefined}
                rel={href !== "#" ? "noopener noreferrer" : undefined}
                className={commonClasses}
                onClick={(e) => { if (href === '#') { e.preventDefault(); alert(`Clicked: ${label} (No link defined)`); } }}
                role="button"
                tabIndex={0}
            >
                {content}
            </a>
        );
    }
}
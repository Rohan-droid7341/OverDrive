// src/components/layout/MainLayoutClient.jsx
'use client'; // This component handles client-side state

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar'; // Import Navbar
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Import Shadcn Sheet components
import Link from 'next/link'; // For navigation inside the sidebar

export default function MainLayoutClient({ children }) {
  // State to control sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle the sidebar state (passed to Navbar)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to close sidebar (useful for links inside sidebar)
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  }

  return (
    <> {/* Use a Fragment to avoid adding extra divs */}
      {/* Navbar is rendered here, always visible */}
      {/* Pass the toggle function down as a prop */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Shadcn Sheet component rendered here */}
      {/* Controlled by the isSidebarOpen state */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        {/* No <SheetTrigger> needed here, Navbar button controls 'open' state */}
        <SheetContent side="left"> {/* Opens from the left */}
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Select a destination.
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-4"> {/* Add your navigation links */}
            <ul>
              <li className="mb-2">
                 {/* Use Link for client-side navigation */}
                 {/* Close sidebar when a link is clicked */}
                <Link href="/" onClick={closeSidebar} className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  Home / Dashboard
                </Link>
              </li>
              {/* Add more navigation links as needed */}
              {/* <li className="mb-2">
                <Link href="/settings" onClick={closeSidebar} className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  Settings
                </Link>
              </li>
               <li className="mb-2">
                <Link href="/profile" onClick={closeSidebar} className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  Profile
                </Link>
              </li> */}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main page content rendered below the Navbar */}
      {/* Add padding-top to prevent content from being hidden under fixed Navbar */}
      <main className="pt-16 md:pt-20"> {/* Adjust padding based on Navbar height */}
        {children}
      </main>
    </>
  );
}
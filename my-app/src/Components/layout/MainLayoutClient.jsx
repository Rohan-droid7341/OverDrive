"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Import Shadcn Sheet components
import Link from "next/link";

export default function MainLayoutClient({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to close sidebar (useful for links inside sidebar)
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Sidebar using Shadcn Sheet component */}

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left">
          {" "}
          {/*from left*/}
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Select a destination.</SheetDescription>
          </SheetHeader>
          <nav className="mt-4">
            {" "}
            <ul>
              <li className="mb-2">

                <Link
                  href="/"
                  onClick={closeSidebar}
                  className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Home / Dashboard
                </Link>
              </li>
              {/* Add more navigation links as needed */}
              <li className="mb-2">
                <Link href="/settings" onClick={closeSidebar} className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  Settings
                </Link>
              </li>
               <li className="mb-2">
                <Link href="/profile" onClick={closeSidebar} className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

   
      <main className="pt-16 md:pt-20">
        {" "}

        {children}
      </main>
    </>
  );
}

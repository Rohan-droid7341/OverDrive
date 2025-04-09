"use client";
import Weather from "@/Components/sections/Weather";
import GoogleSearch from "@/Components/sections/GoogleSearch";
import AppGrid from "@/components/sections/AppGrid";

export default function HomePage() {
  return (
    // The <main> tag with padding is inside MainLayoutClient
    <div className="w-350 mx-auto space-y-6">
      {" "}
      {/* Centered wrapper */}
      <Weather />
      {/* GoogleSearchInput will now expand to the width of this wrapper */}
      <GoogleSearch />
            <AppGrid /> {/* <-- Use the AppGrid component */}
    </div>
  );
}

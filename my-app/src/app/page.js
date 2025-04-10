"use client";
import Weather from "@/Components/sections/Weather";
import GoogleSearch from "@/Components/sections/GoogleSearch";
import AppGrid from "@/Components/sections/AppGrid";

export default function HomePage() {
  return (
    <div className="w-350 mx-auto space-y-6">
      {" "}
      <Weather />
      <GoogleSearch />
      <AppGrid />
    </div>
  );
}

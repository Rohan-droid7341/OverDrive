// src/app/page.jsx
// No need to import or render Sidebar or Navbar here!
// They are handled by the RootLayout -> MainLayoutClient.

// import Weather from '@/components/sections/Weather'; // Assuming these are JS/JSX too
// import GoogleSearch from '@/components/sections/GoogleSearch';
// import AppGrid from '@/components/sections/AppGrid';

export default function HomePage() {
  return (
    // The <main> tag with padding is inside MainLayoutClient
    <div className="container mx-auto p-4"> {/* Example container */}
      {/* <Weather />
      <GoogleSearch />
      <AppGrid /> */}
      {/* ... other page content */}
    </div>
  );
}
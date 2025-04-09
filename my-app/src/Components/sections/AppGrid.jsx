// src/components/sections/AppGrid.jsx
import React from 'react';
import AppItem from './AppItem'; // Import the item component

// Define the apps/links data
// Later you can add href, icons, etc. to these objects
const appData = [
    { label: 'github', href: '/github' }, // Example external link
  { label: 'Codeforces', href: 'https://codeforces.com'},
  { label: 'News', href: '#' }, // Placeholder link
  { label: 'Books', href: '#' },
  { label: 'Movie', href: '#' },
  { label: 'Meme', href: '#' },
  { label: 'Gifs', href: '#' }, // Corrected spelling from 'Giphs'
  { label: 'Spoonacular', href: '#' },
  { label: 'Spotify', href: '#' },
  { label: 'Maps', href: '#' },
  // Add more apps as needed
];

export default function AppGrid() {
  return (
    <div className="w-full">
      {/* Responsive Grid Layout */}
      {/* Adjust columns based on screen size (e.g., 2 cols mobile, up to 5 cols large screens) */}
      {/* Adjust gap as needed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {appData.map((app) => (
          // Use the label as a key for now, ensure labels are unique
          <AppItem key={app.label} label={app.label} href={app.href} />
        ))}
      </div>
    </div>
  );
}
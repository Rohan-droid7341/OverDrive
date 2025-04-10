import React from 'react';
import AppItem from './AppItem'; 

import { FaGithub, FaSpotify, FaMapMarkedAlt, FaNewspaper } from 'react-icons/fa';
import { SiCodeforces } from 'react-icons/si';
import { FiFilm, FiBookOpen } from 'react-icons/fi';
import { BsEmojiSmile, BsFiletypeGif } from 'react-icons/bs';
import { IoFastFoodOutline, IoNewspaperOutline } from 'react-icons/io5';
import { MdOutlineMap } from 'react-icons/md';


const appData = [
  { label: 'GitHub', href: '/github', icon: FaGithub },
  { label: 'Codeforces', href: '/codeforces', icon: SiCodeforces },
  { label: 'News', href: '/news', icon: IoNewspaperOutline }, 
  { label: 'Books', href: '/books', icon: FiBookOpen },
  { label: 'Movies', href: '/movies', icon: FiFilm }, 
  { label: 'Meme', href: '/meme', icon: BsEmojiSmile }, 
  { label: 'Gifs', href: '/gifs', icon: BsFiletypeGif }, 
  { label: 'Food', href: '/spoonacular', icon: IoFastFoodOutline }, 
  { label: 'Spotify', href: '/spotify', icon: FaSpotify }, 
  { label: 'Maps', href: '/maps', icon: MdOutlineMap }, 
];

export default function AppGrid() {
  return (
    <div className="w-full px-4 md:px-0"> 
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {appData.map((app) => (
       
          <AppItem
                key={app.label}
                label={app.label}
                href={app.href}
                IconComponent={app.icon} 
            />
        ))}
      </div>
    </div>
  );
}
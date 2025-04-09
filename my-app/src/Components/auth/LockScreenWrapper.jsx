// src/components/auth/LockScreenWrapper.jsx
'use client';

import React, { useState, useEffect } from 'react';
import PinLockScreen from './PinLockScreen';

const SESSION_STORAGE_KEY = 'app_unlocked';
// Define your background image URL here
const LOCK_SCREEN_BACKGROUND_URL = "/images/your-background-image.jpg"; // <-- CHANGE THIS PATH

export default function LockScreenWrapper({ children }) {
  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SESSION_STORAGE_KEY) !== 'true';
    }
    return true;
  });

  const handleUnlock = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    }
    setIsLocked(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
      setIsLocked(false);
    }
  }, []);

  if (isLocked) {
    // Pass the background image URL as a prop
    return <PinLockScreen onUnlock={handleUnlock} backgroundImageUrl={"https://4kwallpapers.com/images/walls/thumbs_3t/21907.jpg"} />;
  }

  return <>{children}</>;
}
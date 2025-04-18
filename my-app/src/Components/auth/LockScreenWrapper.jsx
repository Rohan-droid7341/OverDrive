'use client';

import React, { useState, useEffect } from 'react';
import PinLockScreen from './PinLockScreen';

const SESSION_STORAGE_KEY = 'app_unlocked';

const LOCK_SCREEN_BACKGROUND_URL = "/images/your-background-image.jpg"; 

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
    return <PinLockScreen onUnlock={handleUnlock} backgroundImageUrl={"lock.jpg"} />;
  }

  return <>{children}</>;
}
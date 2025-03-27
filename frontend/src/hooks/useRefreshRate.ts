import { useState, useEffect } from 'react';

export const useRefreshRate = () => {
  const [refreshRate, setRefreshRate] = useState(() => {
    const saved = localStorage.getItem('settings.refreshRate');
    return saved ? parseInt(saved) * 1000 : 5000; // Convert to milliseconds
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings.refreshRate' && e.newValue) {
        setRefreshRate(parseInt(e.newValue) * 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return refreshRate;
};
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has explicitly set a preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Otherwise, use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [hasExplicitPreference, setHasExplicitPreference] = useState(() => {
    return localStorage.getItem('darkMode') !== null;
  });

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!hasExplicitPreference) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasExplicitPreference]);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setHasExplicitPreference(true);
    
    // Save preference only when user explicitly toggles
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return { isDarkMode, toggleDarkMode };
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'da';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check if user has a saved preference
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'en' || saved === 'da')) {
      return saved as Language;
    }
    
    // Otherwise, detect from browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('da')) {
      return 'da';
    }
    
    return 'en'; // Default to English
  });

  useEffect(() => {
    // Save preference
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => {
      const newLang = prevLang === 'en' ? 'da' : 'en';
      return newLang;
    });
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 
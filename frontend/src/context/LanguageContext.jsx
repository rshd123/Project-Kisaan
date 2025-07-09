import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageService } from '../utils/languageService.js';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    // Load saved language preference on app start
    const savedLanguage = LanguageService.getLanguagePreference();
    setCurrentLanguage(savedLanguage);
    setIsLanguageLoaded(true);
  }, []);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    LanguageService.setLanguagePreference(languageCode);
  };

  const translate = (key) => {
    return LanguageService.getTranslation(key, currentLanguage);
  };

  const getLanguageName = (languageCode = currentLanguage) => {
    return LanguageService.getLanguageName(languageCode);
  };

  const detectLanguageFromLocation = (location) => {
    return LanguageService.detectLanguageFromLocation(location);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    getLanguageName,
    detectLanguageFromLocation,
    isLanguageLoaded,
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

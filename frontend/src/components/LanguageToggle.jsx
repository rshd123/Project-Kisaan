import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageService } from '../utils/languageService.js';

const LanguageToggle = () => {
  const { currentLanguage, changeLanguage, getLanguageName } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const supportedLanguages = LanguageService.getSupportedLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
      >
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-sm font-medium text-green-700">
          {getLanguageName(currentLanguage)}
        </span>
        <svg 
          className={`w-4 h-4 text-green-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Choose Language
              </div>
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentLanguage === language.code
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{language.name}</span>
                    {currentLanguage === language.code && (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {language.translated && language.translated !== language.name && (
                    <div className="text-xs text-gray-500">{language.translated}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;

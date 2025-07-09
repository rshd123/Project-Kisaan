import React, { useState } from 'react';
import { LanguageService } from '../utils/languageService.js';

const LanguageSelectionModal = ({ 
  isOpen, 
  detectedLanguage, 
  location, 
  onLanguageSelect, 
  onDismiss 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isOpen) return null;

  const detectedLanguageName = LanguageService.getLanguageName(detectedLanguage);
  const locationString = location ? `${location.city}, ${location.state}` : 'your area';

  const handleLanguageSelect = (languageCode) => {
    setIsAnimating(true);
    setTimeout(() => {
      onLanguageSelect(languageCode);
      setIsAnimating(false);
    }, 300);
  };

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onDismiss();
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Language Detection</h3>
              <p className="text-green-100 text-sm">Choose your preferred language</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location info */}
          <div className="flex items-center space-x-3 mb-6 p-4 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-medium">📍 {locationString}</p>
              <p className="text-gray-600 text-sm">We detected you are in this region</p>
            </div>
          </div>

          {/* Language options */}
          <div className="space-y-3">
            <p className="text-gray-700 font-medium text-center mb-4">
              Would you like to use Project Kisan in your regional language?
            </p>

            {/* Regional Language Option */}
            {detectedLanguage !== 'en' && (
              <button
                onClick={() => handleLanguageSelect(detectedLanguage)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🌾</span>
                  <div className="text-center">
                    <div className="text-lg">Switch to {detectedLanguageName}</div>
                    <div className="text-green-100 text-sm">Use app in your local language</div>
                  </div>
                </div>
              </button>
            )}

            {/* English Option */}
            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full bg-white border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-700 p-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🇺🇸</span>
                <div className="text-center">
                  <div className="text-lg">Continue in English</div>
                  <div className="text-gray-500 text-sm">Keep using English language</div>
                </div>
              </div>
            </button>
          </div>

          {/* Dismiss option */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleDismiss}
              className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Don't show this again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionModal;

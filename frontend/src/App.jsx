import React, { useState, useEffect } from 'react';
import PriceScraper from './components/Pricescraper.jsx';
import Diagnose from './components/Diagnoseform.jsx';
import VoiceChat from './components/VoiceChat.jsx';
import Chatbot from './components/chatbot/Chatbot.jsx';
import CommunityChat from './components/CommunityChat.jsx';
import LocationBanner from './components/LocationBanner.jsx';
import Auth from './components/Authentication/Auth.jsx';
import LanguageSelectionModal from './components/LanguageSelectionModal.jsx';
import LanguageToggle from './components/LanguageToggle.jsx';
import { useAppContext } from './context/AppContext.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import { LanguageService } from './utils/languageService.js';
import WeatherWidget from './components/WeatherWidget.jsx';

function App() {
  const { isAuthenticated, user, logout, isLoading, location } = useAppContext();
  const { translate, changeLanguage, detectLanguageFromLocation, isLanguageLoaded } = useLanguage();
  const [activeTab, setActiveTab] = useState('voice');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');

  // Check for language detection when location changes
  useEffect(() => {
    if (location && isLanguageLoaded && isAuthenticated) {
      const detected = detectLanguageFromLocation(location);
      setDetectedLanguage(detected);
      
      // Show language selection modal if:
      // 1. A regional language was detected (not English)
      // 2. User hasn't dismissed the selection before
      // 3. Current language is still English (hasn't been changed)
      const currentLang = LanguageService.getLanguagePreference();
      const wasDismissed = LanguageService.wasLanguageSelectionDismissed();
      
      if (detected !== 'en' && !wasDismissed && currentLang === 'en') {
        setShowLanguageModal(true);
      }
    }
  }, [location, isLanguageLoaded, isAuthenticated, detectLanguageFromLocation]);

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setShowLanguageModal(false);
  };

  const handleLanguageModalDismiss = () => {
    LanguageService.dismissLanguageSelection();
    setShowLanguageModal(false);
  };

  // Show loading screen while checking authentication
  if (isLoading || !isLanguageLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Show LocationBanner even during loading to start location detection */}
        <LocationBanner />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">{translate('appTitle')}</h2>
            <p className="text-gray-600">{translate('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the dashboard (login/signup)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Show LocationBanner for location detection during signup */}
        <LocationBanner />
        <Auth />
      </div>
    );
  }

  const tabs = [
    { id: 'voice', label: translate('voiceChat'), component: VoiceChat },
    { id: 'diagnose', label: translate('cropDiagnosis'), component: Diagnose },
    { id: 'prices', label: translate('marketPrices'), component: PriceScraper },
    { id: 'community', label: translate('communityChat'), component: CommunityChat },
    { id: 'chatbot', label: translate('chatbot'), component: Chatbot },
    { id: 'weather', label: translate('weatherForecast'), component: WeatherWidget },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || VoiceChat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        detectedLanguage={detectedLanguage}
        location={location}
        onLanguageSelect={handleLanguageSelect}
        onDismiss={handleLanguageModalDismiss}
      />

      {/* Location Banner */}
      <LocationBanner />
      
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* User greeting and logout */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {translate('welcomeBack')}, <span className="font-semibold text-green-700">{user?.name || 'Farmer'}</span>!
            </div>
            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                {translate('logout')}
              </button>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-green-800 text-center mb-4">
            {translate('appTitle')}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {translate('appDescription')}
          </p>
          
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg overflow-x-auto">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 rounded-md font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-green-600 hover:bg-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 pt-2">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import PriceScraper from './components/Pricescraper.jsx';
import Diagnose from './components/Diagnoseform.jsx';
import VoiceChat from './components/VoiceChat.jsx';
import Chatbot from './components/chatbot/Chatbot.jsx';
import LocationBanner from './components/LocationBanner.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import { useAppContext } from './context/AppContext.jsx';

function App() {
  const { isAuthenticated, user, logout, isLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState('voice');

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Show LocationBanner even during loading to start location detection */}
        <LocationBanner />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Project Kisan</h2>
            <p className="text-gray-600">Loading your farming assistant...</p>
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
        <Dashboard />
      </div>
    );
  }

  const tabs = [
    { id: 'voice', label: 'Voice Chat', component: VoiceChat },
    { id: 'diagnose', label: 'Crop Diagnosis', component: Diagnose },
    { id: 'prices', label: ' Market Prices', component: PriceScraper },
    { id: 'chatbot', label: 'Chatbot', component: Chatbot }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || VoiceChat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Location Banner */}
      <LocationBanner />
      
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* User greeting and logout */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Welcome back, <span className="font-semibold text-green-700">{user?.name || 'Farmer'}</span>!
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
          
          <h1 className="text-4xl font-bold text-green-800 text-center mb-4">
            Project Kisan 
          </h1>
          <p className="text-center text-gray-600 mb-6">
            आपका डिजिटल कृषि सहायक / Your Digital Agriculture Assistant
          </p>
          
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 pt-2">
        <ActiveComponent />
      </div>
    </div>
  );
}

export default App;

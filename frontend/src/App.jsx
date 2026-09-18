import React, { useState } from 'react';
import PriceScraper from './components/Pricescraper.jsx';
import Diagnose from './components/Diagnoseform.jsx';
import VoiceChat from './components/VoiceChat.jsx';
import Chatbot from './components/chatbot/Chatbot.jsx';
import LocationBanner from './components/LocationBanner.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('voice');

  const tabs = [
    { id: 'voice', label: ' Voice Chat' },
    { id: 'diagnose', label: ' Crop Diagnosis' },
    { id: 'prices', label: ' Market Prices' },
    { id: 'chatbot', label: ' Chatbot' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <LocationBanner />

      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-800 whitespace-nowrap">
              Project Kisan
            </h1>
            <span className="text-sm text-gray-500 whitespace-nowrap hidden md:inline">
              Your Digital Agriculture Assistant
            </span>
          </div>

          <div className="bg-gray-100 p-1 rounded-lg flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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

      <div className="max-w-6xl mx-auto p-4 pt-2">
        <div style={{ display: activeTab === 'voice' ? 'block' : 'none' }}>
          <VoiceChat />
        </div>
        <div style={{ display: activeTab === 'diagnose' ? 'block' : 'none' }}>
          <Diagnose />
        </div>
        <div style={{ display: activeTab === 'prices' ? 'block' : 'none' }}>
          <PriceScraper />
        </div>
        <div style={{ display: activeTab === 'chatbot' ? 'block' : 'none' }}>
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

export default App;

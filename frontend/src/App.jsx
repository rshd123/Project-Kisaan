import React, { useState } from 'react';
import PriceScraper from './components/Pricescraper.jsx';
import Diagnose from './components/Diagnoseform.jsx';
import VoiceChat from './components/VoiceChat.jsx';
import Chatbot from './components/chatbot/Chatbot.jsx';
import LocationBanner from './components/LocationBanner.jsx';
import FirebaseDataViewer from './components/FirebaseDataViewer.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('voice');

  const tabs = [
    { id: 'voice', label: '🎤 Voice Chat', component: VoiceChat },
    { id: 'diagnose', label: '🌱 Crop Diagnosis', component: Diagnose },
    { id: 'prices', label: '💰 Market Prices', component: PriceScraper },
    {id: 'chatbot', label: '🤖 Chatbot', component: Chatbot},
    {id: 'firebase', label: '🔥 Firebase Data', component: FirebaseDataViewer}
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || VoiceChat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Location Banner */}
      <LocationBanner />
      
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
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

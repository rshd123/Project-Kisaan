import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('signup');

  return (
    <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Project Kisan</h1>
          <p className="text-gray-600 text-sm">Smart Farming Assistant for Karnataka Farmers</p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">AI-Powered • Voice Assistant • Crop Diagnosis</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-2xl max-w-md mx-auto">
          <div className="p-6">
            {/* Login Form */}
            {activeTab === 'login' && (
              <Login onSwitchToSignup={() => setActiveTab('signup')} />
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <Signup onSwitchToLogin={() => setActiveTab('login')} />
            )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import PriceScraper from './components/Pricescraper.jsx';
import Diagnose from './components/Diagnoseform.jsx';

function App() {
  return (
    <div className="min-h-screen text-white p-6 bg-[#0f1118]">
      <h1 className="text-3xl font-bold mb-6 text-center">Project Kisan</h1>
      <Diagnose />
      <PriceScraper />
    </div>
  );
}

export default App;

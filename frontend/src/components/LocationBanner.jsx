import React, { useState, useEffect } from 'react';
import { LocationService } from '../utils/locationService.js';
import WeatherWidget from './WeatherWidget.jsx';

const LocationBanner = () => {
  const [locationState, setLocationState] = useState({
    loading: true,
    location: null,
    error: null,
    isCorrect: null,
    dismissed: false,
    showWeather: false
  });

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      setLocationState(prev => ({ ...prev, loading: true, error: null }));
      const location = await LocationService.getLocationWithFallback();
      setLocationState(prev => ({
        ...prev,
        loading: false,
        location,
        error: null
      }));
    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        location: null
      }));
    }
  };

  const handleLocationFeedback = (isCorrect) => {
    setLocationState(prev => ({ ...prev, isCorrect, showWeather: isCorrect }));
    
    // Store user feedback for potential future improvements
    if (locationState.location) {
      localStorage.setItem('locationFeedback', JSON.stringify({
        location: locationState.location,
        isCorrect,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const handleLocationUpdate = (newLocation) => {
    setLocationState(prev => ({
      ...prev,
      location: newLocation,
      isCorrect: true,
      showWeather: true
    }));
  };

  const dismissBanner = () => {
    setLocationState(prev => ({ ...prev, dismissed: true }));
  };

  const retryLocation = () => {
    detectLocation();
  };

  if (locationState.dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {locationState.loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              ) : locationState.error ? (
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              {locationState.loading ? (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Detecting your location...</span>
                  <span className="ml-2">This helps us provide local crop and market information.</span>
                </div>
              ) : locationState.error ? (
                <div className="text-sm">
                  <span className="font-medium text-red-600">Location detection failed:</span>
                  <span className="ml-2 text-gray-600">{locationState.error}</span>
                </div>
              ) : (
                <div className="text-sm">
                  <span className="font-medium text-green-800">📍 Detected Location:</span>
                  <span className="ml-2 text-gray-700 font-medium">{locationState.location.address}</span>
                  {locationState.location.method === 'ip' && (
                    <span className="ml-2 text-xs text-gray-500">(Approximate location based on internet connection)</span>
                  )}
                  {locationState.location.accuracy && typeof locationState.location.accuracy === 'number' && (
                    <span className="ml-2 text-xs text-gray-500">
                      (±{Math.round(locationState.location.accuracy)}m accuracy)
                    </span>
                  )}
                </div>
              )}
              
              {locationState.location && locationState.isCorrect === null && (
                <div className="mt-2">
                  <span className="text-xs text-gray-600 mr-3">Is this location correct?</span>
                  <button
                    onClick={() => handleLocationFeedback(true)}
                    className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors mr-2"
                  >
                    ✓ Yes, correct
                  </button>
                  <button
                    onClick={() => handleLocationFeedback(false)}
                    className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ✗ No, incorrect
                  </button>
                </div>
              )}
              
              {locationState.isCorrect === true && (
                <div className="mt-1 text-xs text-green-600 font-medium">
                  ✓ Great! We'll use this location for personalized farming information.
                </div>
              )}
              
              {locationState.isCorrect === false && (
                <div className="mt-1 text-xs text-orange-600">
                  ⚠️ Thanks for the feedback. The weather widget below will help you enter the correct location.
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {locationState.error && (
              <button
                onClick={retryLocation}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={dismissBanner}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Weather Widget */}
      {(locationState.showWeather || locationState.isCorrect === false) && locationState.location && (
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <WeatherWidget 
            location={locationState.location} 
            onLocationCorrect={handleLocationUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default LocationBanner;

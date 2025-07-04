import React, { useState, useEffect } from 'react';
import { WeatherService } from '../utils/weatherService.js';
import { LocationService } from '../utils/locationService.js';
import { FirebaseDataService } from '../utils/firebaseDataService.js';
import { useAppContext } from '../context/AppContext.jsx';

const WeatherWidget = ({ location, onLocationCorrect }) => {
  const { location: contextLocation } = useAppContext();
  
  // Use location from props first, then context, then null
  const activeLocation = location || contextLocation;
  const [weatherState, setWeatherState] = useState({
    loading: true,
    currentWeather: null,
    forecast: null,
    alerts: [],
    tips: [],
    tomorrowTips: [],
    error: null,
    weatherCorrect: null,
    showManualLocation: false,
    manualLocation: ''
  });

  useEffect(() => {
    if (activeLocation && activeLocation.latitude && activeLocation.longitude) {
      fetchWeatherData(activeLocation.latitude, activeLocation.longitude);
    }
  }, [activeLocation]);

  const fetchWeatherData = async (lat, lon) => {
    try {
      setWeatherState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch current weather and forecast
      const [currentWeather, forecast] = await Promise.all([
        WeatherService.getWeatherData(lat, lon),
        WeatherService.getWeatherForecast(lat, lon)
      ]);

      // Generate alerts and tips
      const alerts = WeatherService.generateWeatherAlerts(currentWeather);
      const tips = WeatherService.generateFarmingTips(currentWeather);
      const tomorrowTips = WeatherService.generateTomorrowTips(forecast);

      setWeatherState(prev => ({
        ...prev,
        loading: false,
        currentWeather,
        forecast,
        alerts,
        tips,
        tomorrowTips,
        error: null
      }));
    } catch (error) {
      setWeatherState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const handleWeatherFeedback = async (isCorrect) => {
    setWeatherState(prev => ({ ...prev, weatherCorrect: isCorrect }));
    
    if (!isCorrect) {
      setWeatherState(prev => ({ ...prev, showManualLocation: true }));
    }
    
    // Save weather feedback to Firestore
    if (weatherState.currentWeather && activeLocation) {
      try {
        await FirebaseDataService.saveWeatherFeedback(
          weatherState.currentWeather,
          isCorrect,
          activeLocation
        );
        console.log('✅ Weather feedback saved to Firestore');
      } catch (error) {
        console.error('❌ Failed to save weather feedback to Firestore:', error);
        // Continue silently - don't disrupt user experience
      }
    }
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!weatherState.manualLocation.trim()) return;

    const userInput = weatherState.manualLocation.trim();
    let success = false;
    let resolvedLocation = null;

    try {
      setWeatherState(prev => ({ ...prev, loading: true }));
      
      // Try to get weather directly by city name using OpenWeatherMap API
      const [currentWeather, forecast] = await Promise.all([
        WeatherService.getWeatherByCity(userInput),
        WeatherService.getWeatherForecastByCity(userInput)
      ]);

      // Generate alerts and tips
      const alerts = WeatherService.generateWeatherAlerts(currentWeather);
      const tips = WeatherService.generateFarmingTips(currentWeather);
      const tomorrowTips = WeatherService.generateTomorrowTips(forecast);

      // Create location object from weather data
      const newLocation = {
        latitude: currentWeather.location.lat || 0,
        longitude: currentWeather.location.lon || 0,
        address: currentWeather.location.name ? 
          `${currentWeather.location.name}, ${currentWeather.location.country}` : 
          userInput
      };
      
      resolvedLocation = {
        location: {
          name: currentWeather.location.name,
          address: newLocation.address
        }
      };
      success = true;
      
      // Update parent component about location change
      if (onLocationCorrect) {
        onLocationCorrect(newLocation);
      }
      
      setWeatherState(prev => ({
        ...prev,
        loading: false,
        currentWeather,
        forecast,
        alerts,
        tips,
        tomorrowTips,
        showManualLocation: false,
        weatherCorrect: null,
        manualLocation: '',
        error: null
      }));
      
    } catch (error) {
      setWeatherState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to get weather for "${userInput}". Please check the city name and try again.`
      }));
    }
    
    // Save manual location attempt to Firestore (success or failure)
    try {
      await FirebaseDataService.saveManualLocation(userInput, resolvedLocation, success);
      console.log('✅ Manual location attempt saved to Firestore');
    } catch (error) {
      console.error('❌ Failed to save manual location to Firestore:', error);
      // Continue silently - don't disrupt user experience
    }
  };

  const getWeatherIcon = (condition, isDay = true) => {
    const icons = {
      'Clear': isDay ? '☀️' : '🌙',
      'Clouds': '⛅',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!activeLocation) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Location Required</h3>
          <p className="text-gray-600 mb-4">
            We need your location to provide accurate weather information and farming tips.
          </p>
          <p className="text-sm text-gray-500">
            Please allow location access or check the location banner above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
           Weather & Farming Insights
        </h2>
      </div>

      {weatherState.loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
          <span className="text-gray-600">Getting weather information...</span>
        </div>
      ) : weatherState.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="text-red-600 font-medium">Weather Error:</span>
                <div className="text-red-600 text-sm mt-1">{weatherState.error}</div>
              </div>
            </div>
            <button
              onClick={() => activeLocation && fetchWeatherData(activeLocation.latitude, activeLocation.longitude)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Weather */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Weather</h3>
                {weatherState.currentWeather.location.name && (
                  <p className="text-sm text-gray-600">
                    📍 {weatherState.currentWeather.location.name}, {weatherState.currentWeather.location.country}
                  </p>
                )}
              </div>
              <span className="text-3xl">{getWeatherIcon(weatherState.currentWeather.current.main)}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{weatherState.currentWeather.current.temperature}°C</div>
                <div className="text-sm text-gray-600">Temperature</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700">{weatherState.currentWeather.current.humidity}%</div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700">{weatherState.currentWeather.current.windSpeed.toFixed(1)} m/s</div>
                <div className="text-sm text-gray-600">Wind Speed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-700 capitalize">{weatherState.currentWeather.current.description}</div>
                <div className="text-sm text-gray-600">Condition</div>
              </div>
            </div>

            {/* Weather Feedback */}
            {weatherState.weatherCorrect === null && (
              <div className="bg-white rounded-md p-3 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Does this weather information look correct for your area?</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleWeatherFeedback(true)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
                    >
                      ✓ Yes, correct
                    </button>
                    <button
                      onClick={() => handleWeatherFeedback(false)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                    >
                      ✗ No, incorrect
                    </button>
                  </div>
                </div>
              </div>
            )}

            {weatherState.weatherCorrect === true && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <span className="text-green-600 text-sm font-medium">✓ Great! Using this weather data for farming recommendations.</span>
              </div>
            )}
          </div>

          {/* Manual Location Input */}
          {weatherState.showManualLocation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Please enter your correct location:</h4>
              <form onSubmit={handleManualLocationSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={weatherState.manualLocation}
                  onChange={(e) => setWeatherState(prev => ({ ...prev, manualLocation: e.target.value }))}
                  placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Update Location
                </button>
              </form>
            </div>
          )}

          {/* Weather Alerts */}
          {weatherState.alerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🚨 Weather Alerts</h3>
              <div className="space-y-2">
                {weatherState.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${
                      alert.type === 'warning' ? 'bg-red-50 border-red-200' :
                      alert.type === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-2">{alert.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{alert.title}</div>
                        <div className="text-sm text-gray-600">{alert.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tomorrow's Forecast */}
          {weatherState.forecast && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📅 Tomorrow's Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{weatherState.forecast.tomorrow.maxTemp}°C</div>
                  <div className="text-sm text-gray-600">High</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{weatherState.forecast.tomorrow.minTemp}°C</div>
                  <div className="text-sm text-gray-600">Low</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">{weatherState.forecast.tomorrow.humidity}%</div>
                  <div className="text-sm text-gray-600">Humidity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700 capitalize">{weatherState.forecast.tomorrow.description}</div>
                  <div className="text-sm text-gray-600">Condition</div>
                </div>
              </div>
            </div>
          )}

          {/* Farming Tips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🌾 Today's Farming Tips</h3>
            <div className="grid gap-3">
              {weatherState.tips.map((tip, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${getPriorityColor(tip.priority)}`}
                >
                  <div className="flex items-start">
                    <span className="text-lg mr-3">{tip.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{tip.category}</div>
                      <div className="text-sm mt-1">{tip.tip}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tip.priority === 'high' ? 'bg-red-100 text-red-600' :
                      tip.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {tip.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tomorrow's Tips */}
          {weatherState.tomorrowTips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Tomorrow's Planning</h3>
              <div className="grid gap-3">
                {weatherState.tomorrowTips.map((tip, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${getPriorityColor(tip.priority)}`}
                  >
                    <div className="flex items-start">
                      <span className="text-lg mr-3">{tip.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{tip.category}</div>
                        <div className="text-sm mt-1">{tip.tip}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;

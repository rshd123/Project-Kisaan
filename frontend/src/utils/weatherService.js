// Weather detection and farming tips utility
export const WeatherService = {
  // OpenWeatherMap API key
  API_KEY: 'c74a208d3c3a5c888d6b7bdda4be7e68',

  /**
   * Get current weather for given coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>}
   */
  async getWeatherData(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.warn('Weather API failed, using mock data:', error);
      return this.getMockWeatherData(latitude, longitude);
    }
  },

  /**
   * Get current weather by city name
   * @param {string} city 
   * @returns {Promise<Object>}
   */
  async getWeatherByCity(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.warn('Weather API failed for city, using mock data:', error);
      return this.getMockWeatherData(0, 0);
    }
  },

  /**
   * Get weather forecast for the next day
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>}
   */
  async getWeatherForecast(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatForecastData(data);
    } catch (error) {
      console.warn('Forecast API failed, using mock data:', error);
      return this.getMockForecastData();
    }
  },

  /**
   * Get weather forecast by city name
   * @param {string} city 
   * @returns {Promise<Object>}
   */
  async getWeatherForecastByCity(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatForecastData(data);
    } catch (error) {
      console.warn('Forecast API failed for city, using mock data:', error);
      return this.getMockForecastData();
    }
  },

  /**
   * Format weather data from API response
   * @param {Object} data 
   * @returns {Object}
   */
  formatWeatherData(data) {
    return {
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Would need UV API for real data
        cloudiness: data.clouds.all
      },
      location: {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      }
    };
  },

  /**
   * Format forecast data from API response
   * @param {Object} data 
   * @returns {Object}
   */
  formatForecastData(data) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Filter forecast for tomorrow
    const tomorrowForecasts = data.list.filter(item => {
      const forecastDate = new Date(item.dt * 1000);
      return forecastDate.getDate() === tomorrow.getDate();
    });

    if (tomorrowForecasts.length === 0) {
      return this.getMockForecastData();
    }

    // Get representative forecast (noon or closest)
    const noonForecast = tomorrowForecasts.find(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 11 && hour <= 13;
    }) || tomorrowForecasts[0];

    return {
      tomorrow: {
        temperature: Math.round(noonForecast.main.temp),
        minTemp: Math.round(Math.min(...tomorrowForecasts.map(f => f.main.temp_min))),
        maxTemp: Math.round(Math.max(...tomorrowForecasts.map(f => f.main.temp_max))),
        humidity: noonForecast.main.humidity,
        description: noonForecast.weather[0].description,
        main: noonForecast.weather[0].main,
        windSpeed: noonForecast.wind.speed,
        precipitation: noonForecast.rain?.['3h'] || noonForecast.snow?.['3h'] || 0
      }
    };
  },

  /**
   * Generate mock weather data for demo purposes
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Object}
   */
  getMockWeatherData(latitude, longitude) {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Mist'];
    const descriptions = {
      'Clear': 'clear sky',
      'Clouds': 'scattered clouds',
      'Rain': 'light rain',
      'Drizzle': 'light drizzle',
      'Mist': 'mist'
    };

    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const baseTemp = latitude > 0 ? (latitude > 30 ? 25 : 15) : 30; // Rough temp based on latitude

    return {
      current: {
        temperature: baseTemp + Math.floor(Math.random() * 10),
        feelsLike: baseTemp + Math.floor(Math.random() * 10),
        humidity: 60 + Math.floor(Math.random() * 30),
        pressure: 1010 + Math.floor(Math.random() * 20),
        windSpeed: 2 + Math.random() * 8,
        windDirection: Math.floor(Math.random() * 360),
        description: descriptions[randomCondition],
        main: randomCondition,
        icon: randomCondition === 'Clear' ? '01d' : '02d',
        visibility: 8 + Math.random() * 2,
        uvIndex: Math.floor(Math.random() * 8),
        cloudiness: randomCondition === 'Clear' ? 10 : 50
      },
      location: {
        name: 'Local Area',
        country: 'IN',
        sunrise: new Date(Date.now() - (Date.now() % (24*60*60*1000)) + 6*60*60*1000),
        sunset: new Date(Date.now() - (Date.now() % (24*60*60*1000)) + 18*60*60*1000)
      }
    };
  },

  /**
   * Generate mock forecast data
   * @returns {Object}
   */
  getMockForecastData() {
    const conditions = ['Clear', 'Clouds', 'Rain'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      tomorrow: {
        temperature: 22 + Math.floor(Math.random() * 8),
        minTemp: 18 + Math.floor(Math.random() * 5),
        maxTemp: 28 + Math.floor(Math.random() * 7),
        humidity: 65 + Math.floor(Math.random() * 25),
        description: randomCondition === 'Clear' ? 'sunny' : randomCondition === 'Clouds' ? 'partly cloudy' : 'light rain',
        main: randomCondition,
        windSpeed: 3 + Math.random() * 5,
        precipitation: randomCondition === 'Rain' ? 2 + Math.random() * 5 : 0
      }
    };
  },

  /**
   * Generate weather alerts based on current conditions
   * @param {Object} weatherData 
   * @returns {Array}
   */
  generateWeatherAlerts(weatherData) {
    const alerts = [];
    const { current } = weatherData;

    // Temperature alerts
    if (current.temperature > 35) {
      alerts.push({
        type: 'warning',
        icon: '🌡️',
        title: 'High Temperature Alert',
        message: `Very hot conditions (${current.temperature}°C). Heat stress risk for crops and livestock.`
      });
    } else if (current.temperature < 5) {
      alerts.push({
        type: 'warning',
        icon: '❄️',
        title: 'Low Temperature Alert',
        message: `Cold conditions (${current.temperature}°C). Frost risk for sensitive crops.`
      });
    }

    // Rain alerts
    if (current.main === 'Rain' || current.main === 'Drizzle') {
      alerts.push({
        type: 'info',
        icon: '🌧️',
        title: 'Rainfall Detected',
        message: `Current ${current.description}. Good for soil moisture but avoid field operations.`
      });
    }

    // Wind alerts
    if (current.windSpeed > 10) {
      alerts.push({
        type: 'caution',
        icon: '💨',
        title: 'Strong Wind Alert',
        message: `High wind speeds (${current.windSpeed.toFixed(1)} m/s). Avoid spraying operations.`
      });
    }

    // Humidity alerts
    if (current.humidity > 85) {
      alerts.push({
        type: 'caution',
        icon: '💧',
        title: 'High Humidity',
        message: `Very humid conditions (${current.humidity}%). Increased fungal disease risk.`
      });
    }

    return alerts;
  },

  /**
   * Generate farming tips based on current weather
   * @param {Object} weatherData 
   * @returns {Array}
   */
  generateFarmingTips(weatherData) {
    const tips = [];
    const { current } = weatherData;

    // Temperature-based tips
    if (current.temperature > 30) {
      tips.push({
        icon: '🌱',
        category: 'Crop Care',
        tip: 'Increase irrigation frequency during hot weather. Water early morning or evening.',
        priority: 'high'
      });
      tips.push({
        icon: '🐄',
        category: 'Livestock',
        tip: 'Ensure adequate shade and fresh water for animals during hot weather.',
        priority: 'high'
      });
    } else if (current.temperature < 10) {
      tips.push({
        icon: '🌾',
        category: 'Crop Protection',
        tip: 'Cover sensitive crops to protect from cold. Consider frost protection measures.',
        priority: 'high'
      });
    }

    // Weather condition tips
    if (current.main === 'Rain') {
      tips.push({
        icon: '🚜',
        category: 'Field Operations',
        tip: 'Avoid heavy machinery operations in wet fields to prevent soil compaction.',
        priority: 'medium'
      });
      tips.push({
        icon: '🌿',
        category: 'Disease Prevention',
        tip: 'Monitor crops for fungal diseases in wet conditions. Ensure good drainage.',
        priority: 'medium'
      });
    } else if (current.main === 'Clear' && current.temperature > 25) {
      tips.push({
        icon: '💧',
        category: 'Irrigation',
        tip: 'Good weather for irrigation. Check soil moisture levels regularly.',
        priority: 'low'
      });
    }

    // Wind-based tips
    if (current.windSpeed > 8) {
      tips.push({
        icon: '🌿',
        category: 'Spraying',
        tip: 'Avoid pesticide/fertilizer spraying in windy conditions to prevent drift.',
        priority: 'high'
      });
    }

    // Humidity tips
    if (current.humidity > 80) {
      tips.push({
        icon: '🦠',
        category: 'Disease Management',
        tip: 'High humidity increases disease risk. Improve air circulation around crops.',
        priority: 'medium'
      });
    }

    // General tips
    tips.push({
      icon: '📱',
      category: 'Planning',
      tip: 'Check weather forecast regularly to plan farming activities effectively.',
      priority: 'low'
    });

    return tips;
  },

  /**
   * Generate farming tips for tomorrow's forecast
   * @param {Object} forecastData 
   * @returns {Array}
   */
  generateTomorrowTips(forecastData) {
    const tips = [];
    const { tomorrow } = forecastData;

    if (tomorrow.precipitation > 0) {
      tips.push({
        icon: '🌧️',
        category: 'Tomorrow\'s Planning',
        tip: `Rain expected tomorrow (${tomorrow.precipitation.toFixed(1)}mm). Plan indoor activities and avoid field work.`,
        priority: 'high'
      });
    } else if (tomorrow.main === 'Clear') {
      tips.push({
        icon: '☀️',
        category: 'Tomorrow\'s Planning',
        tip: `Clear weather expected tomorrow. Good day for field operations and harvesting.`,
        priority: 'low'
      });
    }

    if (tomorrow.temperature > 32) {
      tips.push({
        icon: '🌡️',
        category: 'Tomorrow\'s Planning',
        tip: `Hot weather expected tomorrow (${tomorrow.maxTemp}°C). Plan watering early morning.`,
        priority: 'medium'
      });
    }

    if (tomorrow.windSpeed > 10) {
      tips.push({
        icon: '💨',
        category: 'Tomorrow\'s Planning',
        tip: `Windy conditions expected tomorrow. Postpone spraying operations.`,
        priority: 'medium'
      });
    }

    return tips;
  }
};

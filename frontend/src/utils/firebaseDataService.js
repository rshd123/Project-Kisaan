// Firebase Data Service for Frontend
export const FirebaseDataService = {
  
  // Base URL for API
  BASE_URL: 'http://localhost:5000/api/data',

  // Generic method to send data to Firebase
  async sendData(endpoint, data) {
    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Data sent to Firebase:', endpoint, result.id);
        return result;
      } else {
        console.error('❌ Failed to send data to Firebase:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Network error sending data to Firebase:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save location feedback to Firebase
   */
  async saveLocationFeedback(location, isCorrect) {
    return this.sendData('/location-feedback', {
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        method: location.method,
        accuracy: location.accuracy
      },
      isCorrect
    });
  },

  /**
   * Save weather feedback to Firebase
   */
  async saveWeatherFeedback(weather, isCorrect, location) {
    return this.sendData('/weather-feedback', {
      weather: {
        temperature: weather.current.temperature,
        condition: weather.current.main,
        description: weather.current.description,
        humidity: weather.current.humidity,
        windSpeed: weather.current.windSpeed
      },
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude
      },
      isCorrect
    });
  },

  /**
   * Save manual location entry to Firebase
   */
  async saveManualLocation(userInput, resolvedLocation, success) {
    return this.sendData('/manual-location', {
      userInput,
      resolvedLocation: {
        name: resolvedLocation?.location?.name || 'Unknown',
        address: resolvedLocation?.location?.address || 'Unknown'
      },
      success
    });
  },

  /**
   * Save voice chat interaction to Firebase
   */
  async saveVoiceChat(userMessage, botResponse) {
    return this.sendData('/voice-chat', {
      userMessage,
      botResponse
    });
  },

  /**
   * Save crop diagnosis to Firebase
   */
  async saveCropDiagnosis(input, result) {
    return this.sendData('/crop-diagnosis', {
      input: {
        cropType: input.cropType,
        symptoms: input.symptoms,
        hasImage: !!input.image,
        location: input.location
      },
      result: {
        diagnosis: result.diagnosis,
        confidence: result.confidence,
        recommendations: result.recommendations
      }
    });
  },

  /**
   * Save price search to Firebase
   */
  async savePriceSearch(commodity, location, result) {
    return this.sendData('/price-search', {
      commodity,
      location,
      result: {
        success: result.success,
        pricesFound: result.prices?.length || 0,
        averagePrice: result.averagePrice
      }
    });
  },

  /**
   * Get data statistics from Firebase
   */
  async getDataStats() {
    try {
      const response = await fetch(`${this.BASE_URL}/stats`);
      const result = await response.json();
      
      if (result.success) {
        console.log('📊 Firebase Data Stats:', result.stats);
        return result.stats;
      } else {
        console.error('❌ Failed to get stats:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Network error getting stats:', error);
      return null;
    }
  },

  /**
   * Get collection data from Firebase
   */
  async getCollectionData(collection, limit = 50) {
    try {
      const response = await fetch(`${this.BASE_URL}/collection/${collection}?limit=${limit}`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`📋 ${collection} Data:`, result.data);
        return result.data;
      } else {
        console.error('❌ Failed to get collection data:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Network error getting collection data:', error);
      return [];
    }
  }
};

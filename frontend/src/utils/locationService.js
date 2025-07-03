// Location detection utility
export const LocationService = {
  /**
   * Get user's current location using browser's geolocation API
   * @returns {Promise<{latitude: number, longitude: number, address: string}>}
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const address = await this.reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              address,
              accuracy: position.coords.accuracy
            });
          } catch (error) {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'Location details unavailable',
              accuracy: position.coords.accuracy
            });
          }
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  },

  
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      // Build address string
      const addressParts = [];
      if (data.locality) addressParts.push(data.locality);
      if (data.city) addressParts.push(data.city);
      if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
      if (data.countryName) addressParts.push(data.countryName);
      
      return addressParts.length > 0 ? addressParts.join(', ') : 'Location details unavailable';
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  },

  /**
   * Get location with fallback to IP-based detection
   * @returns {Promise<Object>}
   */
  async getLocationWithFallback() {
    try {
      return await this.getCurrentLocation();
    } catch (gpsError) {
      console.warn('GPS location failed, trying IP-based location:', gpsError.message);
      try {
        return await this.getIPLocation();
      } catch (ipError) {
        console.warn('IP location also failed:', ipError.message);
        throw new Error('All location detection methods failed');
      }
    }
  },

  /**
   * Get approximate location based on IP address
   * @returns {Promise<Object>}
   */
  async getIPLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('IP location service unavailable');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'IP location failed');
      }

      return {
        latitude: data.latitude,
        longitude: data.longitude,
        address: `${data.city || 'Unknown City'}, ${data.region || 'Unknown Region'}, ${data.country_name || 'Unknown Country'}`,
        accuracy: 'City-level (IP-based)',
        method: 'ip'
      };
    } catch (error) {
      throw new Error('IP-based location detection failed');
    }
  }
};

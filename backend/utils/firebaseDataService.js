import { firestore } from './vertex.js';

export class FirebaseDataService {
  
  /**
   * Save location feedback to Firestore
   */
  static async saveLocationFeedback(data) {
    try {
      const docRef = await firestore.collection('location_feedback').add({
        ...data,
        timestamp: new Date()
      });
      console.log('✅ Location feedback saved to Firestore:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error saving location feedback:', error);
      throw error;
    }
  }

  /**
   * Save weather feedback to Firestore
   */
  static async saveWeatherFeedback(data) {
    try {
      const docRef = await firestore.collection('weather_feedback').add({
        ...data,
        timestamp: new Date()
      });
      console.log('✅ Weather feedback saved to Firestore:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error saving weather feedback:', error);
      throw error;
    }
  }

  /**
   * Save manual location entry to Firestore
   */
  static async saveManualLocation(data) {
    try {
      const docRef = await firestore.collection('manual_locations').add({
        ...data,
        timestamp: new Date()
      });
      console.log('✅ Manual location saved to Firestore:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error saving manual location:', error);
      throw error;
    }
  }

  /**
   * Save voice chat interaction to Firestore
   */
  static async saveVoiceChat(data) {
    try {
      const docRef = await firestore.collection('voice_chats').add({
        ...data,
        timestamp: new Date()
      });
      console.log('✅ Voice chat saved to Firestore:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error saving voice chat:', error);
      throw error;
    }
  }

  /**
   * Save crop diagnosis to Firestore
   */
  static async saveCropDiagnosis(data) {
    try {
      const docRef = await firestore.collection('crop_diagnosis').add({
        ...data,
        timestamp: new Date()
      });
      console.log('✅ Crop diagnosis saved to Firestore:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error saving crop diagnosis:', error);
      throw error;
    }
  }

  /**
   * Save price search to Firestore
   */
  static async savePriceSearch(data) {
    try {
      const docRef = await firestore.collection('price_searches').add({
        ...data,
        timestamp: new Date()
      });
      console.log('✅ Price search saved to Firestore:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error saving price search:', error);
      throw error;
    }
  }

  /**
   * Get data statistics
   */
  static async getDataStats() {
    try {
      const collections = [
        'location_feedback',
        'weather_feedback', 
        'manual_locations',
        'voice_chats',
        'crop_diagnosis',
        'price_searches'
      ];

      const stats = {};
      
      for (const collection of collections) {
        const snapshot = await firestore.collection(collection).get();
        stats[collection] = snapshot.size;
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting data stats:', error);
      throw error;
    }
  }

  /**
   * Get all data from a collection
   */
  static async getAllData(collectionName, limit = 50) {
    try {
      const snapshot = await firestore
        .collection(collectionName)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      const data = [];
      snapshot.forEach(doc => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return data;
    } catch (error) {
      console.error(`❌ Error getting data from ${collectionName}:`, error);
      throw error;
    }
  }
}

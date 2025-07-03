import { firestore } from './vertex.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  
  /**
   * Create a new user account
   */
  static async createUser(userData) {
    try {
      const { name, email, password, farmLocation, farmSize } = userData;
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }
      
      // Hash password with salt
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Generate unique user ID
      const userId = uuidv4();
      
      // Prepare user data
      const newUser = {
        userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        farmLocation,
        farmSize: farmSize ? parseFloat(farmSize) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        profile: {
          totalDiagnoses: 0,
          totalPriceSearches: 0,
          totalVoiceChats: 0,
          lastLogin: null
        }
      };
      
      // Save to Firestore
      const docRef = await firestore.collection('users').doc(userId).set(newUser);
      console.log('✅ User created in Firestore:', userId);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      return { 
        success: true, 
        userId,
        user: userWithoutPassword 
      };
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    try {
      const snapshot = await firestore
        .collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('❌ Error getting user by email:', error);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const doc = await firestore.collection('users').doc(userId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('❌ Error getting user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Authenticate user login
   */
  static async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      
      // Update last login
      await firestore.collection('users').doc(user.userId).update({
        'profile.lastLogin': new Date(),
        updatedAt: new Date()
      });
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
      
    } catch (error) {
      console.error('❌ Error authenticating user:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await firestore.collection('users').doc(userId).update(updateData);
      console.log('✅ User profile updated:', userId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Increment user activity counters
   */
  static async incrementUserActivity(userId, activityType) {
    try {
      const userRef = firestore.collection('users').doc(userId);
      
      const increment = firestore.FieldValue.increment(1);
      const updates = {
        updatedAt: new Date()
      };
      
      switch (activityType) {
        case 'diagnosis':
          updates['profile.totalDiagnoses'] = increment;
          break;
        case 'price_search':
          updates['profile.totalPriceSearches'] = increment;
          break;
        case 'voice_chat':
          updates['profile.totalVoiceChats'] = increment;
          break;
        default:
          console.warn('Unknown activity type:', activityType);
          return;
      }
      
      await userRef.update(updates);
      console.log('✅ User activity incremented:', userId, activityType);
      
    } catch (error) {
      console.error('❌ Error incrementing user activity:', error);
      // Don't throw error for activity tracking failures
    }
  }
  
  /**
   * Get user statistics
   */
  static async getUserStats() {
    try {
      const snapshot = await firestore.collection('users').get();
      
      const stats = {
        totalUsers: snapshot.size,
        activeUsers: 0,
        totalFarmSize: 0,
        locationStats: {}
      };
      
      snapshot.forEach(doc => {
        const user = doc.data();
        
        if (user.isActive) {
          stats.activeUsers++;
        }
        
        if (user.farmSize) {
          stats.totalFarmSize += user.farmSize;
        }
        
        if (user.farmLocation) {
          const location = user.farmLocation.toLowerCase();
          stats.locationStats[location] = (stats.locationStats[location] || 0) + 1;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      throw error;
    }
  }
}

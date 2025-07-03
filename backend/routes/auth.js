import express from 'express';
import { UserService } from '../utils/userService.js';

const router = express.Router();

// User registration
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, farmLocation, farmSize } = req.body;
    
    // Validation
    if (!name || !email || !password || !farmLocation) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, password, and farm location are required' 
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      });
    }
    
    const result = await UserService.createUser({
      name,
      email,
      password,
      farmLocation,
      farmSize
    });
    
    res.json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.userId,
      user: result.user
    });
    
  } catch (error) {
    console.error('Error in signup:', error);
    
    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ success: false, error: error.message });
    }
    
    res.status(500).json({ success: false, error: 'Failed to create user account' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }
    
    const result = await UserService.authenticateUser(email, password);
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: result.user
    });
    
  } catch (error) {
    console.error('Error in login:', error);
    
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    
    if (error.message === 'Account is deactivated') {
      return res.status(403).json({ success: false, error: error.message });
    }
    
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json({ 
      success: true, 
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.userId;
    delete updates.createdAt;
    
    await UserService.updateUserProfile(userId, updates);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get user statistics (admin endpoint)
router.get('/stats', async (req, res) => {
  try {
    const stats = await UserService.getUserStats();
    
    res.json({ 
      success: true, 
      stats 
    });
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get user statistics' });
  }
});

// Update user activity (internal endpoint)
router.post('/activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activityType } = req.body;
    
    await UserService.incrementUserActivity(userId, activityType);
    
    res.json({ 
      success: true, 
      message: 'Activity recorded' 
    });
    
  } catch (error) {
    console.error('Error recording user activity:', error);
    res.status(500).json({ success: false, error: 'Failed to record activity' });
  }
});

export default router;

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Check for stored user data on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('kisanUser');
    const storedExpiry = localStorage.getItem('kisanUserExpiry');
    
    if (storedUser && storedExpiry) {
      try {
        const userData = JSON.parse(storedUser);
        const expiryTime = parseInt(storedExpiry);
        const currentTime = Date.now();
        
        // Check if the session has expired (1 week = 7 days)
        if (currentTime < expiryTime) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Session expired, clear localStorage
          localStorage.removeItem('kisanUser');
          localStorage.removeItem('kisanUserExpiry');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('kisanUser');
        localStorage.removeItem('kisanUserExpiry');
      }
    }
    
    setIsLoading(false); // Authentication check complete
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Set expiry time to 1 week from now (7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    
    localStorage.setItem('kisanUser', JSON.stringify(userData));
    localStorage.setItem('kisanUserExpiry', expiryTime.toString());
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('kisanUser');
    localStorage.removeItem('kisanUserExpiry');
  };

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('kisanUser', JSON.stringify(userData));
      localStorage.setItem('kisanUserExpiry', expiryTime.toString());
    }
  };

  const value = {
    user,
    location,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateLocation,
    updateUser
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

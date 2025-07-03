import React, { useState, useEffect } from 'react';
import { FirebaseDataService } from '../utils/firebaseDataService.js';

const FirebaseDataViewer = () => {
  const [stats, setStats] = useState(null);
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCollection, setActiveCollection] = useState('');

  const collectionNames = [
    'location_feedback',
    'weather_feedback',
    'manual_locations',
    'voice_chats',
    'crop_diagnosis',
    'price_searches'
  ];

  useEffect(() => {
    loadDataStats();
  }, []);

  const loadDataStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const statsData = await FirebaseDataService.getDataStats();
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load data stats:', err);
      setError('Failed to load data statistics. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionData = async (collectionName) => {
    try {
      setError('');
      setActiveCollection(collectionName);
      
      if (collections[collectionName]) {
        return; // Already loaded
      }
      
      const data = await FirebaseDataService.getCollectionData(collectionName, 20);
      setCollections(prev => ({
        ...prev,
        [collectionName]: data
      }));
    } catch (err) {
      console.error(`Failed to load ${collectionName} data:`, err);
      setError(`Failed to load ${collectionName} data.`);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No timestamp';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return 'Invalid timestamp';
    }
  };

  const formatData = (data) => {
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Loading Firebase data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            🔥 Firebase Data Viewer
          </h2>
          <button
            onClick={loadDataStats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-600">{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">📊 Data Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats).map(([collection, count]) => (
                <div key={collection} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 capitalize">
                    {collection.replace('_', ' ')}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">📁 Collections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {collectionNames.map(name => (
              <button
                key={name}
                onClick={() => loadCollectionData(name)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  activeCollection === name
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium text-gray-800 capitalize">
                  {name.replace('_', ' ')}
                </div>
                {stats && (
                  <div className="text-sm text-gray-600">
                    {stats[name] || 0} documents
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Collection Data */}
        {activeCollection && collections[activeCollection] && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 capitalize">
              📋 {activeCollection.replace('_', ' ')} Data
            </h3>
            
            {collections[activeCollection].length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No data available in this collection
              </div>
            ) : (
              <div className="space-y-4">
                {collections[activeCollection].map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Document #{index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(doc.timestamp)}
                      </span>
                    </div>
                    <div className="bg-white rounded border p-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {formatData(doc)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📝 Instructions</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use the Project Kisan app to generate data (search prices, diagnose crops, chat with voice AI, etc.)</li>
            <li>• Click "Refresh" to update the statistics</li>
            <li>• Click on any collection to view its documents</li>
            <li>• Data is automatically saved to Firebase Firestore when you interact with the app</li>
            <li>• You can also view this data in the Firebase Console at: 
              <a 
                href="https://console.firebase.google.com/project/project-kisan-2b53a/firestore/data" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                Firebase Console
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDataViewer;

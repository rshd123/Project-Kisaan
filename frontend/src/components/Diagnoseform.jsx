import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
import { FirebaseDataService } from '../utils/firebaseDataService.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Diagnose = () => {
  const { translate } = useLanguage();
  const [farmerName, setFarmerName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview('');
    }
  };

  const handleDiagnose = async () => {
    if (!farmerName || !image) {
      setError(translate('enterNameAndImage'));
      return;
    }

    setError('');
    setDiagnosis('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('farmerName', farmerName);
      formData.append('image', image);

      const response = await axios.post(`${API_BASE_URL}/api/diagnose`, formData);
      setDiagnosis(response.data.diagnosis);
      
      // Save crop diagnosis to Firestore
      try {
        const inputData = {
          farmerName,
          hasImage: true,
          fileName: image.name,
          fileSize: image.size,
          fileType: image.type
        };
        
        const resultData = {
          diagnosis: response.data.diagnosis,
          timestamp: new Date().toISOString(),
          success: true
        };
        
        await FirebaseDataService.saveCropDiagnosis(inputData, resultData);
        console.log('✅ Crop diagnosis saved to Firestore');
      } catch (error) {
        console.error('❌ Failed to save crop diagnosis to Firestore:', error);
        // Continue silently - don't disrupt user experience
      }
    } catch (err) {
      console.error(err);
      setError(translate('diagnosisError'));
      
      // Save failed diagnosis attempt to Firestore
      try {
        const inputData = {
          farmerName,
          hasImage: true,
          fileName: image.name,
          fileSize: image.size,
          fileType: image.type
        };
        
        const resultData = {
          diagnosis: null,
          error: err.message,
          timestamp: new Date().toISOString(),
          success: false
        };
        
        await FirebaseDataService.saveCropDiagnosis(inputData, resultData);
        console.log('✅ Failed crop diagnosis attempt saved to Firestore');
      } catch (error) {
        console.error('❌ Failed to save failed diagnosis to Firestore:', error);
        // Continue silently - don't disrupt user experience
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{translate('diagnosisTitle')}</h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          className="p-2 border rounded"
          placeholder={translate('enterFarmerName')}
          value={farmerName}
          onChange={(e) => setFarmerName(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="p-2 border rounded"
          onChange={handleFileChange}
        />

        {preview && (
          <img src={preview} alt="Preview" className="w-full max-h-60 object-contain rounded" />
        )}

        <button
          onClick={handleDiagnose}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {translate('diagnose')}
        </button>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="text-gray-600">{translate('fetchingDiagnosis')}</span>
            </div>
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}
        {diagnosis && (
          <div className="mt-4 p-4 border rounded bg-green-100 text-green-900">
            <h3 className="font-semibold mb-2">{translate('diagnosisInKannada')}</h3>
            <p>{diagnosis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnose;
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

const severityColors = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
  unknown: 'bg-gray-100 text-gray-800 border-gray-300'
};

const confidenceColors = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600'
};

const Diagnose = () => {
  const [farmerName, setFarmerName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
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
      setError('Please enter the farmer\'s name and upload an image.');
      return;
    }

    setError('');
    setDiagnosis(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('farmerName', farmerName);
      formData.append('image', image);

      const response = await axios.post(`${API_BASE_URL}/api/diagnose`, formData);
      setDiagnosis(response.data.diagnosis);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while diagnosing.');
    }

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crop Disease Diagnosis</h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Enter Farmer's Name"
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
          Diagnose
        </button>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="text-gray-600">Analyzing crop disease...</span>
            </div>
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        {diagnosis && (
          <div className="mt-4 space-y-4">
            {/* Disease Header */}
            <div className="p-4 border rounded bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{diagnosis.disease_name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColors[diagnosis.severity] || severityColors.unknown}`}>
                  {diagnosis.severity?.toUpperCase()} SEVERITY
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">Crop: {diagnosis.crop_type}</p>
              <p className="text-sm text-gray-500">
                Confidence: <span className={`font-medium ${confidenceColors[diagnosis.confidence] || 'text-gray-500'}`}>{diagnosis.confidence}</span>
              </p>
              {diagnosis.cause && (
                <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Cause:</span> {diagnosis.cause}</p>
              )}
              <p className="text-gray-700 mt-2">{diagnosis.description}</p>
            </div>

            {/* Symptoms */}
            {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
              <div className="p-4 border rounded bg-white shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Symptoms</h4>
                <ul className="list-disc list-inside space-y-1">
                  {diagnosis.symptoms.map((s, i) => (
                    <li key={i} className="text-gray-700 text-sm">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {diagnosis.treatment && diagnosis.treatment.length > 0 && (
              <div className="p-4 border rounded bg-white shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Treatment</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 font-medium text-gray-600">Medicine</th>
                        <th className="text-left p-2 font-medium text-gray-600">Dosage</th>
                        <th className="text-left p-2 font-medium text-gray-600">Cost</th>
                        <th className="text-left p-2 font-medium text-gray-600">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosis.treatment.map((t, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 text-gray-800">{t.name}</td>
                          <td className="p-2 text-gray-600">{t.dosage}</td>
                          <td className="p-2 text-gray-600">{t.cost}</td>
                          <td className="p-2 text-gray-600">{t.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Prevention */}
            {diagnosis.prevention && diagnosis.prevention.length > 0 && (
              <div className="p-4 border rounded bg-white shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Prevention</h4>
                <ul className="list-disc list-inside space-y-1">
                  {diagnosis.prevention.map((p, i) => (
                    <li key={i} className="text-gray-700 text-sm">{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Season & Government Scheme */}
            {(diagnosis.season || diagnosis.government_scheme) && (
              <div className="p-4 border rounded bg-blue-50 shadow-sm">
                {diagnosis.season && (
                  <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Peak Season:</span> {diagnosis.season}</p>
                )}
                {diagnosis.government_scheme && (
                  <p className="text-sm text-gray-700"><span className="font-medium">Govt Scheme:</span> {diagnosis.government_scheme}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Diagnose;

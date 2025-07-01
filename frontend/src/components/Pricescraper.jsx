import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

const PriceScraper = () => {
  const [market, setMarket] = useState('');
  const [commodity, setCommodity] = useState('');
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [error, setError] = useState('');

  const markets = ['BENGALURU', 'Chintamani', 'MYSORE', 'Bangarpet'];
  const commodities = ['Potato', 'Tomato', 'Rice', 'Wheat', 'Lime'];

  const handleScrape = async () => {
    if (!market || !commodity) {
      setError('Please select both market and commodity.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/prices`, {
        params: {
          state: 'Karnataka',
          market,
          commodity
        }
      });

      if (res.data && res.data.rows?.length > 0) {
        setPriceData(res.data);
      } else {
        setError('No data returned for selected options.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Market Price Data</h2>
      <div className="flex flex-col justify-center md:flex-row gap-4 mb-4">
        <select className="p-2 border rounded text-white" onChange={(e) => setMarket(e.target.value)} defaultValue="">
          <option value="">-- Select Market --</option>
          {markets.map((mkt) => (
            <option key={mkt} value={mkt} className='text-black'>{mkt}</option>
          ))}
        </select>

        <select className="p-2 border rounded" onChange={(e) => setCommodity(e.target.value)} defaultValue="">
          <option value="" >-- Select Commodity --</option>
          {commodities.map((com) => (
            <option key={com} value={com}  className='text-black'>{com}</option>
          ))}
        </select>

        <button onClick={handleScrape} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          🔍 Scrape
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-gray-600">Fetching data...</span>
          </div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {priceData && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Price Data for {commodity} in {market}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  {priceData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200"
                      >
                        {cellIndex === 0 ? (
                          <span className="font-medium text-gray-900">{cell}</span>
                        ) : (
                          <span className="text-green-600 font-semibold">{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceScraper;

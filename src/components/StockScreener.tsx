import React, { useState } from 'react';
import { Filter, ArrowRight } from 'lucide-react';
import { useStockStore } from '../store/stockStore';

const SECTORS = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Industrials',
  'Energy',
  'Basic Materials',
  'Consumer Defensive',
  'Real Estate',
  'Utilities',
  'Communication Services'
];

const INDUSTRIES = {
  'Technology': [
    'Software',
    'Semiconductors',
    'Hardware',
    'IT Services',
    'Consumer Electronics'
  ],
  'Healthcare': [
    'Biotechnology',
    'Pharmaceuticals',
    'Medical Devices',
    'Healthcare Services',
    'Health Insurance'
  ],
  'Financial Services': [
    'Banks',
    'Insurance',
    'Asset Management',
    'Credit Services',
    'Capital Markets'
  ],
  'Consumer Cyclical': [
    'Retail',
    'Automotive',
    'Entertainment',
    'Travel & Leisure',
    'Apparel'
  ],
  'Industrials': [
    'Aerospace & Defense',
    'Construction',
    'Industrial Manufacturing',
    'Transportation',
    'Business Services'
  ],
  'Energy': [
    'Oil & Gas',
    'Renewable Energy',
    'Coal',
    'Natural Gas',
    'Energy Equipment'
  ],
  'Basic Materials': [
    'Chemicals',
    'Mining',
    'Steel',
    'Paper & Forest Products',
    'Agriculture'
  ],
  'Consumer Defensive': [
    'Food & Beverages',
    'Household Products',
    'Personal Care',
    'Tobacco',
    'Discount Stores'
  ],
  'Real Estate': [
    'REITs',
    'Real Estate Services',
    'Development',
    'Property Management',
    'Real Estate Operating'
  ],
  'Utilities': [
    'Electric',
    'Water',
    'Gas',
    'Renewable',
    'Multi-Utilities'
  ],
  'Communication Services': [
    'Telecom',
    'Media',
    'Entertainment',
    'Social Media',
    'Advertising'
  ]
};

export const StockScreener: React.FC = () => {
  const { screenStocks, screenedStocks, loading, addStock } = useStockStore();
  const [filters, setFilters] = useState({
    sector: '',
    industry: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'sector' ? { industry: '' } : {}) // Reset industry when sector changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await screenStocks(filters.sector, filters.industry);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Filter className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Stock Screener</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sector</label>
            <select
              name="sector"
              value={filters.sector}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Any Sector</option>
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Industry</label>
            <select
              name="industry"
              value={filters.industry}
              onChange={handleChange}
              disabled={!filters.sector}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <option value="">Any Industry</option>
              {filters.sector && INDUSTRIES[filters.sector as keyof typeof INDUSTRIES]?.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Searching...' : 'Find Stocks'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {screenedStocks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Screened Stocks</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {screenedStocks.map(symbol => (
              <button
                key={symbol}
                onClick={() => addStock(symbol)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
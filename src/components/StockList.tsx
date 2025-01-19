import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, TrendingUp, DollarSign, BarChart3, Users } from 'lucide-react';
import { useStockStore } from '../store/stockStore';
import { StockChart } from './StockChart';

// Mock company data - in a real app, this would come from an API
const COMPANY_INFO: Record<string, { name: string, marketCap: string, revenue: string, eps: string, pe: string }> = {
  // Technology
  'AAPL': { name: 'Apple Inc.', marketCap: '3.02T', revenue: '383.29B', eps: '6.13', pe: '31.42' },
  'MSFT': { name: 'Microsoft Corporation', marketCap: '2.98T', revenue: '211.92B', eps: '11.07', pe: '37.23' },
  'GOOGL': { name: 'Alphabet Inc.', marketCap: '1.86T', revenue: '307.39B', eps: '5.80', pe: '28.95' },
  'AMZN': { name: 'Amazon.com Inc.', marketCap: '1.78T', revenue: '574.79B', eps: '2.90', pe: '61.23' },
  'NVDA': { name: 'NVIDIA Corporation', marketCap: '1.45T', revenue: '44.87B', eps: '4.80', pe: '85.42' },
  'META': { name: 'Meta Platforms Inc.', marketCap: '1.2T', revenue: '134.90B', eps: '14.87', pe: '34.61' },
  'TSLA': { name: 'Tesla Inc.', marketCap: '857.93B', revenue: '96.77B', eps: '3.12', pe: '75.82' },
  'IBM': { name: 'International Business Machines', marketCap: '174.32B', revenue: '60.53B', eps: '9.62', pe: '22.57' },
  'ORCL': { name: 'Oracle Corporation', marketCap: '317.85B', revenue: '50.42B', eps: '3.62', pe: '31.24' },
  'CRM': { name: 'Salesforce Inc.', marketCap: '268.94B', revenue: '34.28B', eps: '4.01', pe: '73.45' },
  
  // Healthcare
  'JNJ': { name: 'Johnson & Johnson', marketCap: '381.54B', revenue: '85.12B', eps: '9.57', pe: '16.82' },
  'UNH': { name: 'UnitedHealth Group', marketCap: '454.67B', revenue: '371.61B', eps: '25.12', pe: '19.84' },
  'PFE': { name: 'Pfizer Inc.', marketCap: '154.23B', revenue: '58.50B', eps: '1.84', pe: '14.23' },
  'MRK': { name: 'Merck & Co.', marketCap: '317.45B', revenue: '60.12B', eps: '5.71', pe: '892' },
  'ABT': { name: 'Abbott Laboratories', marketCap: '187.34B', revenue: '43.65B', eps: '3.15', pe: '24.76' },
  
  // Financial Services
  'JPM': { name: 'JPMorgan Chase & Co.', marketCap: '498.76B', revenue: '158.10B', eps: '15.80', pe: '11.23' },
  'V': { name: 'Visa Inc.', marketCap: '565.12B', revenue: '32.65B', eps: '8.89', pe: '31.24' },
  'BAC': { name: 'Bank of America Corp', marketCap: '245.67B', revenue: '98.76B', eps: '3.42', pe: '9.87' },
  'WFC': { name: 'Wells Fargo & Co', marketCap: '187.45B', revenue: '82.45B', eps: '4.78', pe: '8.92' },
  'MA': { name: 'Mastercard Inc.', marketCap: '412.34B', revenue: '25.13B', eps: '11.56', pe: '35.67' },
  
  // Consumer Cyclical
  'HD': { name: 'Home Depot Inc.', marketCap: '345.67B', revenue: '157.40B', eps: '15.23', pe: '22.43' },
  'NKE': { name: 'Nike Inc.', marketCap: '187.45B', revenue: '51.22B', eps: '3.45', pe: '27.89' },
  'MCD': { name: "McDonald's Corp", marketCap: '212.34B', revenue: '23.83B', eps: '8.45', pe: '24.67' },
  'SBUX': { name: 'Starbucks Corp', marketCap: '123.45B', revenue: '35.98B', eps: '3.58', pe: '29.87' },
  'DIS': { name: 'Walt Disney Co', marketCap: '198.76B', revenue: '88.90B', eps: '3.76', pe: '42.34' },
  
  // Industrials
  'CAT': { name: 'Caterpillar Inc.', marketCap: '145.67B', revenue: '67.87B', eps: '15.23', pe: '15.89' },
  'BA': { name: 'Boeing Co', marketCap: '134.56B', revenue: '78.24B', eps: '2.45', pe: '54.32' },
  'HON': { name: 'Honeywell International', marketCap: '134.23B', revenue: '36.71B', eps: '8.76', pe: '18.94' },
  'UPS': { name: 'United Parcel Service', marketCap: '123.45B', revenue: '91.23B', eps: '9.87', pe: '12.45' },
  'GE': { name: 'General Electric Co', marketCap: '156.78B', revenue: '76.56B', eps: '7.23', pe: '21.67' },
  
  // Energy
  'XOM': { name: 'Exxon Mobil Corp', marketCap: '432.12B', revenue: '398.67B', eps: '9.12', pe: '11.23' },
  'CVX': { name: 'Chevron Corp', marketCap: '289.45B', revenue: '246.78B', eps: '13.45', pe: '10.78' },
  'COP': { name: 'ConocoPhillips', marketCap: '134.56B', revenue: '78.23B', eps: '8.91', pe: '12.34' },
  'SLB': { name: 'Schlumberger NV', marketCap: '87.65B', revenue: '32.87B', eps: '2.87', pe: '18.92' },
  'EOG': { name: 'EOG Resources Inc', marketCap: '76.54B', revenue: '25.70B', eps: '8.34', pe: '9.87' }
};

export const StockList: React.FC = () => {
  const { currentStock } = useStockStore();

  const getSignalIcon = (signal: 'buy' | 'sell' | 'neutral') => {
    switch (signal) {
      case 'buy':
        return <ArrowUpCircle className="w-6 h-6 text-green-500" />;
      case 'sell':
        return <ArrowDownCircle className="w-6 h-6 text-red-500" />;
      default:
        return <MinusCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  if (!currentStock) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Search for a stock symbol to begin analysis</p>
      </div>
    );
  }

  const companyInfo = COMPANY_INFO[currentStock.symbol] || {
    name: 'Unknown Company',
    marketCap: 'N/A',
    revenue: 'N/A',
    eps: 'N/A',
    pe: 'N/A'
  };

  const lastPrice = currentStock.data[currentStock.data.length - 1]?.close.toFixed(2) || 'N/A';

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-white">{currentStock.symbol}</h3>
            {getSignalIcon(currentStock.signal)}
            <span className="text-gray-400">
              Last: ${lastPrice}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <h4 className="text-lg font-medium text-emerald-400">{companyInfo.name}</h4>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Market Cap: </span>
              <span className="text-white font-medium">${companyInfo.marketCap}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Revenue: </span>
              <span className="text-white font-medium">${companyInfo.revenue}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">EPS: </span>
              <span className="text-white font-medium">${companyInfo.eps}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">P/E: </span>
              <span className="text-white font-medium">{companyInfo.pe}</span>
            </div>
          </div>
        </div>
      </div>
      <StockChart stock={currentStock} />
    </div>
  );
};
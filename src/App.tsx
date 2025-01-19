import React, { useEffect } from 'react';
import { AddStock } from './components/AddStock';
import { StockList } from './components/StockList';
import { StockScreener } from './components/StockScreener';
import { useStockStore } from './store/stockStore';
import { LineChart, TrendingUp } from 'lucide-react';

function App() {
  const { updateStockData } = useStockStore();

  useEffect(() => {
    const checkAndUpdate = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      if (day === 5 && hour >= 16) {
        updateStockData();
      }
    };

    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, [updateStockData]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <LineChart className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Stock Analysis Terminal</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <TrendingUp className="w-5 h-5" />
            <span>AO/AC Signal Analysis</span>
          </div>
        </header>
        
        <main>
          <AddStock />
          <StockScreener />
          <StockList />
        </main>
      </div>
    </div>
  );
}

export default App;
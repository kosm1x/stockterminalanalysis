import React, { useState, useCallback } from 'react';
// Importing the Search icon from lucide-react library
import { Search } from 'lucide-react';
// Importing the custom hook useStockStore from the stockStore file
import { useStockStore } from '../store/stockStore';

// Fixing the import errors by adding type declarations
// This will help TypeScript understand the modules being imported
declare module 'react';
declare module 'lucide-react';

/**
 * AddStock Component
 * Allows users to add a stock symbol for analysis.
 */
export const AddStock: React.FC = () => {
  // State to hold the stock symbol input by the user
  const [symbol, setSymbol] = useState<string>('');
  
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);
  
  // Destructure addStock function and loading state from the stock store
  const { addStock, loading, error: storeError } = useStockStore();

  /**
   * Handles the form submission.
   * @param e - Form event
   */
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the default form submission behavior
    const trimmedSymbol = symbol.trim().toUpperCase();
    
    if (trimmedSymbol) {
      try {
        setError(null); // Clear any previous errors
        await addStock(trimmedSymbol); // Adds the stock symbol
        setSymbol(''); // Resets the input field
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to add the stock. Please try again.'); // Sets error message
        } else {
          setError('Failed to add the stock. Please try again.');
        }
      }
    }
  }, [addStock, symbol]);

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex space-x-4">
        {/* Input Field for Stock Symbol */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value);
              setError(null); // Clear error when user starts typing
            }}
            placeholder="Enter stock symbol to analyze"
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>
      
      {/* Display Error Message */}
      {(error || storeError) && <p className="text-red-500 mt-2">{error || storeError}</p>}
    </form>
  );
};
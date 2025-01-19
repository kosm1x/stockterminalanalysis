import { create } from 'zustand';
import { StockAnalysis } from '../types/stock';
import { fetchWeeklyData } from '../utils/alphaVantage';
import { calculateAO, calculateAC, calculateMedianPrice } from '../utils/indicators';

interface StockStore {
  currentStock: StockAnalysis | null;
  loading: boolean;
  error: string | null;
  screenedStocks: string[];
  addStock: (symbol: string) => Promise<void>;
  updateStockData: () => Promise<void>;
  screenStocks: (sector: string, industry: string) => Promise<void>;
}

// Mock data for demonstration - in a real app, this would come from an API
const STOCK_SYMBOLS = {
  'Technology': {
    'Software': ['MSFT', 'ORCL', 'ADBE', 'CRM', 'INTU'],
    'Semiconductors': ['NVDA', 'AMD', 'INTC', 'TSM', 'QCOM'],
    'Hardware': ['AAPL', 'HPQ', 'DELL', 'IBM', 'STX'],
    'IT Services': ['ACN', 'IBM', 'CTSH', 'GPN', 'FISV'],
    'Consumer Electronics': ['AAPL', 'SONY', 'BBY', 'SONO', 'HEAR']
  },
  'Healthcare': {
    'Biotechnology': ['AMGN', 'BIIB', 'GILD', 'REGN', 'VRTX'],
    'Pharmaceuticals': ['JNJ', 'PFE', 'MRK', 'ABBV', 'BMY'],
    'Medical Devices': ['MDT', 'ABT', 'SYK', 'BSX', 'EW'],
    'Healthcare Services': ['UNH', 'CVS', 'CI', 'HUM', 'ANTM'],
    'Health Insurance': ['UNH', 'CI', 'HUM', 'ANTM', 'CNC']
  },
  'Financial Services': {
    'Banks': ['JPM', 'BAC', 'WFC', 'C', 'GS'],
    'Insurance': ['BRK.B', 'PGR', 'TRV', 'AIG', 'MET'],
    'Asset Management': ['BLK', 'BX', 'KKR', 'APO', 'TROW'],
    'Credit Services': ['V', 'MA', 'AXP', 'DFS', 'COF'],
    'Capital Markets': ['MS', 'SCHW', 'CME', 'ICE', 'COIN']
  },
  'Consumer Cyclical': {
    'Retail': ['AMZN', 'WMT', 'HD', 'TGT', 'LOW'],
    'Automotive': ['TSLA', 'F', 'GM', 'TM', 'HMC'],
    'Entertainment': ['DIS', 'NFLX', 'CMCSA', 'LYV', 'WWE'],
    'Travel & Leisure': ['MAR', 'HLT', 'BKNG', 'EXPE', 'RCL'],
    'Apparel': ['NKE', 'LULU', 'VFC', 'TPR', 'UAA']
  },
  'Industrials': {
    'Aerospace & Defense': ['BA', 'LMT', 'RTX', 'NOC', 'GD'],
    'Construction': ['CAT', 'DE', 'URI', 'PWR', 'VMC'],
    'Industrial Manufacturing': ['HON', 'MMM', 'GE', 'ETN', 'EMR'],
    'Transportation': ['UPS', 'FDX', 'UNP', 'CSX', 'NSC'],
    'Business Services': ['WM', 'RSG', 'SPGI', 'MCO', 'INFO']
  },
  'Energy': {
    'Oil & Gas': ['XOM', 'CVX', 'COP', 'EOG', 'PXD'],
    'Renewable Energy': ['NEE', 'ENPH', 'SEDG', 'BE', 'PLUG'],
    'Coal': ['BTU', 'ARCH', 'CEIX', 'HCC', 'ARLP'],
    'Natural Gas': ['LNG', 'OKE', 'KMI', 'WMB', 'ET'],
    'Energy Equipment': ['SLB', 'HAL', 'BKR', 'NOV', 'HP']
  },
  'Basic Materials': {
    'Chemicals': ['LIN', 'APD', 'SHW', 'ECL', 'DD'],
    'Mining': ['BHP', 'RIO', 'VALE', 'FCX', 'NEM'],
    'Steel': ['NUE', 'STLD', 'X', 'CLF', 'RS'],
    'Paper & Forest Products': ['WRK', 'IP', 'PKG', 'GPK', 'RFP'],
    'Agriculture': ['ADM', 'BG', 'CF', 'MOS', 'NTR']
  },
  'Consumer Defensive': {
    'Food & Beverages': ['KO', 'PEP', 'MDLZ', 'KHC', 'STZ'],
    'Household Products': ['PG', 'CL', 'KMB', 'CHD', 'CLX'],
    'Personal Care': ['EL', 'ULTA', 'ELF', 'REV', 'BHG'],
    'Tobacco': ['MO', 'PM', 'BTI', 'TPB', 'VGR'],
    'Discount Stores': ['COST', 'DG', 'DLTR', 'BJ', 'GO']
  },
  'Real Estate': {
    'REITs': ['PLD', 'AMT', 'EQIX', 'PSA', 'O'],
    'Real Estate Services': ['CBRE', 'JLL', 'CWK', 'RMAX', 'RLGY'],
    'Development': ['LEN', 'DHI', 'PHM', 'TOL', 'KBH'],
    'Property Management': ['EQR', 'AVB', 'ESS', 'UDR', 'CPT'],
    'Real Estate Operating': ['VTR', 'WY', 'BXP', 'KRC', 'DEI']
  },
  'Utilities': {
    'Electric': ['DUK', 'SO', 'AEP', 'EXC', 'D'],
    'Water': ['AWK', 'AWR', 'CWT', 'SJW', 'WTRG'],
    'Gas': ['NI', 'ATO', 'SWX', 'SR', 'NWN'],
    'Renewable': ['AES', 'BEP', 'CWEN', 'RNW', 'NOVA'],
    'Multi-Utilities': ['SRE', 'PCG', 'ED', 'PEG', 'CNP']
  },
  'Communication Services': {
    'Telecom': ['T', 'VZ', 'TMUS', 'LBRDK', 'CHTR'],
    'Media': ['GOOGL', 'META', 'WBD', 'PARA', 'FOXA'],
    'Entertainment': ['EA', 'ATVI', 'TTWO', 'U', 'RBLX'],
    'Social Media': ['SNAP', 'PINS', 'TWTR', 'MTCH', 'BMBL'],
    'Advertising': ['OMC', 'IPG', 'WPP', 'PUBGY', 'TTD']
  }
};

export const useStockStore = create<StockStore>((set, get) => ({
  currentStock: null,
  loading: false,
  error: null,
  screenedStocks: [],

  addStock: async (symbol: string) => {
    try {
      set({ loading: true, error: null });
      const data = await fetchWeeklyData(symbol);
      
      if (!data || data.length === 0) {
        throw new Error('No data available for this stock symbol');
      }

      const medianPrices = calculateMedianPrice(
        data.map(d => d.high),
        data.map(d => d.low)
      );
      
      const ao = calculateAO(medianPrices);
      const ac = calculateAC(ao);
      
      const indicators = data.map((d, i) => ({
        date: d.date,
        ao: ao[i] || 0,
        ac: ac[i] || 0
      }));

      const signal = determineSignal(ao, ac);
      
      const stockAnalysis: StockAnalysis = {
        symbol,
        lastUpdated: new Date().toISOString(),
        data,
        indicators,
        signal
      };

      set({
        currentStock: stockAnalysis,
        loading: false,
        error: null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
        loading: false 
      });
    }
  },

  screenStocks: async (sector: string, industry: string) => {
    try {
      set({ loading: true, error: null });
      
      let stocks: string[] = [];
      
      if (sector) {
        const sectorStocks = STOCK_SYMBOLS[sector as keyof typeof STOCK_SYMBOLS];
        if (industry && sectorStocks) {
          stocks = sectorStocks[industry as keyof typeof sectorStocks] || [];
        } else if (sectorStocks) {
          // If no industry selected, get all stocks in the sector
          stocks = Object.values(sectorStocks).flat();
        }
      }
      
      // Remove duplicates
      stocks = [...new Set(stocks)];
      
      set({ 
        screenedStocks: stocks,
        loading: false,
        error: null
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to screen stocks',
        loading: false,
        screenedStocks: []
      });
    }
  },

  updateStockData: async () => {
    const { currentStock } = get();
    if (!currentStock) return;

    try {
      set({ loading: true, error: null });
      const data = await fetchWeeklyData(currentStock.symbol);
      
      if (!data || data.length === 0) {
        throw new Error('No data available for this stock symbol');
      }

      const medianPrices = calculateMedianPrice(
        data.map(d => d.high),
        data.map(d => d.low)
      );
      const ao = calculateAO(medianPrices);
      const ac = calculateAC(ao);
      const indicators = data.map((d, i) => ({
        date: d.date,
        ao: ao[i] || 0,
        ac: ac[i] || 0
      }));
      const signal = determineSignal(ao, ac);

      set({ 
        currentStock: {
          ...currentStock,
          data,
          indicators,
          signal,
          lastUpdated: new Date().toISOString()
        },
        loading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update stock data',
        loading: false 
      });
    }
  }
}));

function determineSignal(ao: number[], ac: number[]): 'buy' | 'sell' | 'neutral' {
  const lastAO = ao[ao.length - 1] || 0;
  const prevAO = ao[ao.length - 2] || 0;
  const lastAC = ac[ac.length - 1] || 0;
  const prevAC = ac[ac.length - 2] || 0;

  if (lastAO > prevAO && lastAC > prevAC && lastAO > 0) {
    return 'buy';
  } else if (lastAO < prevAO && lastAC < prevAC && lastAO < 0) {
    return 'sell';
  }
  return 'neutral';
}
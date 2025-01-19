export interface StockData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  ao: number;
  ac: number;
  date: string;
}

export interface StockAnalysis {
  symbol: string;
  lastUpdated: string;
  data: StockData[];
  indicators: IndicatorData[];
  signal: 'buy' | 'sell' | 'neutral';
}
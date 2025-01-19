const API_KEY = 'CWIA9S112Q0BHF6N';
const BASE_URL = 'https://www.alphavantage.co/query';

export async function fetchWeeklyData(symbol: string) {
  const url = `${BASE_URL}?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error('Invalid stock symbol. Please check the symbol and try again.');
    }
    
    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please wait a minute before trying again.');
    }

    const weeklyData = data['Weekly Time Series'];
    if (!weeklyData) {
      throw new Error('Invalid stock symbol or no data available for this ticker.');
    }

    if (Object.keys(weeklyData).length === 0) {
      throw new Error('No trading data available for this stock symbol.');
    }

    return Object.entries(weeklyData)
      .map(([date, values]: [string, any]) => ({
        symbol,
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume'])
      }))
      .reverse();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch stock data. Please try again.');
  }
}
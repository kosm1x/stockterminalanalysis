export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

export function calculateMedianPrice(high: number[], low: number[]): number[] {
  return high.map((h, i) => (h + low[i]) / 2);
}

export function calculateAO(medianPrices: number[]): number[] {
  const sma5 = calculateSMA(medianPrices, 5);
  const sma34 = calculateSMA(medianPrices, 34);
  
  return medianPrices.map((_, i) => {
    if (isNaN(sma5[i]) || isNaN(sma34[i])) {
      return NaN;
    }
    return sma5[i] - sma34[i];
  });
}

export function calculateAC(ao: number[]): number[] {
  const sma5ofAO = calculateSMA(ao, 5);
  
  return ao.map((aoValue, i) => {
    if (isNaN(aoValue) || isNaN(sma5ofAO[i])) {
      return NaN;
    }
    return aoValue - sma5ofAO[i];
  });
}
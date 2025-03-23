// Simulated exchange rates (fixed for demo)
const exchangeRates = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 148.50,
    CAD: 1.35,
    AUD: 1.52
  },
  EUR: {
    USD: 1.09,
    GBP: 0.86,
    JPY: 161.84,
    CAD: 1.47,
    AUD: 1.66
  },
  GBP: {
    USD: 1.27,
    EUR: 1.16,
    JPY: 188.19,
    CAD: 1.71,
    AUD: 1.93
  }
};

// List of supported currencies
const supportedCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
];

const currencyService = {
  // Get list of supported currencies
  getSupportedCurrencies: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(supportedCurrencies);
      }, 300);
    });
  },

  // Get exchange rate between two currencies
  getExchangeRate: (fromCurrency, toCurrency) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!fromCurrency || !toCurrency) {
          reject(new Error('Invalid currency pair'));
          return;
        }

        // If same currency, rate is 1
        if (fromCurrency === toCurrency) {
          resolve(1);
          return;
        }

        // Check if we have direct rate
        if (exchangeRates[fromCurrency]?.[toCurrency]) {
          resolve(exchangeRates[fromCurrency][toCurrency]);
          return;
        }

        // Check reverse rate
        if (exchangeRates[toCurrency]?.[fromCurrency]) {
          resolve(1 / exchangeRates[toCurrency][fromCurrency]);
          return;
        }

        // If no direct or reverse rate, try converting through USD
        if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
          const fromToUSD = exchangeRates[fromCurrency]?.['USD'] || 1 / exchangeRates['USD'][fromCurrency];
          const usdToTarget = exchangeRates['USD'][toCurrency];
          if (fromToUSD && usdToTarget) {
            resolve(fromToUSD * usdToTarget);
            return;
          }
        }

        reject(new Error('Exchange rate not available'));
      }, 300);
    });
  },

  // Convert amount from one currency to another
  convertCurrency: (amount, fromCurrency, toCurrency) => {
    return new Promise((resolve, reject) => {
      if (!amount || amount <= 0) {
        reject(new Error('Invalid amount'));
        return;
      }

      currencyService.getExchangeRate(fromCurrency, toCurrency)
        .then(rate => {
          const convertedAmount = amount * rate;
          resolve({
            amount: convertedAmount,
            rate: rate,
            fromCurrency,
            toCurrency
          });
        })
        .catch(reject);
    });
  },

  // Format currency amount with symbol
  formatCurrency: (amount, currencyCode) => {
    const currency = supportedCurrencies.find(c => c.code === currencyCode);
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    // Format with 2 decimal places
    const formattedAmount = Number(amount).toFixed(2);
    
    // Some currencies put symbol after amount
    if (currencyCode === 'EUR') {
      return `${formattedAmount}${currency.symbol}`;
    }
    
    return `${currency.symbol}${formattedAmount}`;
  },

  // Get currency symbol
  getCurrencySymbol: (currencyCode) => {
    const currency = supportedCurrencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }
};

export default currencyService;
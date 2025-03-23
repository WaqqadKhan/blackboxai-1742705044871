import walletService from './walletService';

const currencyService = {
  getSupportedCurrencies() {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
    ];
  },

  formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  },

  async convertCurrency(amount, fromCurrency, toCurrency, userEmail) {
    try {
      const result = walletService.exchangeCurrency(userEmail, fromCurrency, toCurrency, amount);
      return {
        amount: result.toAmount,
        rate: result.rate,
        fromBalance: walletService.getBalance(userEmail, fromCurrency),
        toBalance: walletService.getBalance(userEmail, toCurrency)
      };
    } catch (error) {
      throw new Error(`Currency conversion failed: ${error.message}`);
    }
  },

  getExchangeRates(baseCurrency) {
    const rates = {
      USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50 },
      EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50 },
      GBP: { USD: 1.27, EUR: 1.16, JPY: 188.75 },
      JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053 }
    };
    return rates[baseCurrency] || {};
  },

  getUserBalances(userEmail) {
    return walletService.getUserWallets(userEmail);
  },

  getBalance(userEmail, currency) {
    return walletService.getBalance(userEmail, currency);
  }
};

export default currencyService;
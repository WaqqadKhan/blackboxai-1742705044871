const WALLET_KEY = 'payment_app_wallets';

// Initialize default wallets if not exists
if (!localStorage.getItem(WALLET_KEY)) {
  const defaultWallets = {
    'john@example.com': {
      USD: 5000.00,
      EUR: 2000.00,
      GBP: 1500.00,
      JPY: 100000.00
    },
    'jane@example.com': {
      USD: 3000.00,
      EUR: 1500.00,
      GBP: 1000.00,
      JPY: 75000.00
    }
  };
  localStorage.setItem(WALLET_KEY, JSON.stringify(defaultWallets));
}

const walletService = {
  // Get all wallets for a user
  getUserWallets: (email) => {
    const wallets = JSON.parse(localStorage.getItem(WALLET_KEY));
    return wallets[email] || {};
  },

  // Get balance for specific currency
  getBalance: (email, currency) => {
    const wallets = JSON.parse(localStorage.getItem(WALLET_KEY));
    return wallets[email]?.[currency] || 0;
  },

  // Update wallet balance
  updateBalance: (email, currency, amount) => {
    const wallets = JSON.parse(localStorage.getItem(WALLET_KEY));
    if (!wallets[email]) {
      wallets[email] = {};
    }
    wallets[email][currency] = amount;
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallets));
  },

  // Exchange currency
  exchangeCurrency: (email, fromCurrency, toCurrency, amount) => {
    const wallets = JSON.parse(localStorage.getItem(WALLET_KEY));
    const userWallets = wallets[email];

    if (!userWallets || userWallets[fromCurrency] < amount) {
      throw new Error('Insufficient funds');
    }

    // Get exchange rates (simplified for demo)
    const rates = {
      USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50 },
      EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50 },
      GBP: { USD: 1.27, EUR: 1.16, JPY: 188.75 },
      JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053 }
    };

    // Calculate converted amount
    const rate = rates[fromCurrency][toCurrency];
    const convertedAmount = amount * rate;

    // Update balances
    userWallets[fromCurrency] -= amount;
    userWallets[toCurrency] = (userWallets[toCurrency] || 0) + convertedAmount;

    // Save updated wallets
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallets));

    // Return exchange details
    return {
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate
    };
  },

  // Transfer money between users in specific currency
  transfer: (senderEmail, recipientEmail, currency, amount) => {
    const wallets = JSON.parse(localStorage.getItem(WALLET_KEY));
    
    // Validate sender has enough funds
    if (!wallets[senderEmail] || wallets[senderEmail][currency] < amount) {
      throw new Error('Insufficient funds');
    }

    // Initialize recipient wallet if needed
    if (!wallets[recipientEmail]) {
      wallets[recipientEmail] = {};
    }
    if (!wallets[recipientEmail][currency]) {
      wallets[recipientEmail][currency] = 0;
    }

    // Perform transfer
    wallets[senderEmail][currency] -= amount;
    wallets[recipientEmail][currency] += amount;

    // Save updated wallets
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallets));

    return {
      senderBalance: wallets[senderEmail][currency],
      recipientBalance: wallets[recipientEmail][currency]
    };
  }
};

export default walletService;
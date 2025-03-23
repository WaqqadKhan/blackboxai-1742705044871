import authService from './authService';

// Simulated transaction data store
let transactions = [
  {
    id: 1,
    senderId: 1,
    recipientEmail: 'jane@example.com',
    amount: 100.00,
    currency: 'USD',
    type: 'SEND',
    status: 'COMPLETED',
    description: 'Dinner payment',
    timestamp: '2024-01-15T18:30:00Z'
  },
  {
    id: 2,
    senderId: 2,
    recipientEmail: 'john@example.com',
    amount: 50.00,
    currency: 'USD',
    type: 'RECEIVE',
    status: 'COMPLETED',
    description: 'Movie tickets',
    timestamp: '2024-01-14T15:45:00Z'
  }
];

const transactionService = {
  // Get all transactions for current user
  getTransactions: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        const userTransactions = transactions.filter(t => 
          t.senderId === currentUser.id || 
          t.recipientEmail === currentUser.email
        );

        resolve(userTransactions);
      }, 300);
    });
  },

  // Send payment to another user
  sendPayment: (paymentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        // Validate payment amount
        if (paymentData.amount <= 0) {
          reject(new Error('Invalid amount'));
          return;
        }

        // Check if user has sufficient balance
        if (currentUser.balance < paymentData.amount) {
          reject(new Error('Insufficient balance'));
          return;
        }

        // Create new transaction
        const newTransaction = {
          id: transactions.length + 1,
          senderId: currentUser.id,
          recipientEmail: paymentData.recipientEmail,
          amount: paymentData.amount,
          currency: paymentData.currency || 'USD',
          type: 'SEND',
          status: 'COMPLETED',
          description: paymentData.description || '',
          timestamp: new Date().toISOString()
        };

        // Update transactions list
        transactions.push(newTransaction);

        // Update user balance (in a real app, this would be handled by the backend)
        currentUser.balance -= paymentData.amount;
        localStorage.setItem('user', JSON.stringify(currentUser));

        resolve(newTransaction);
      }, 300);
    });
  },

  // Get transaction by ID
  getTransactionById: (transactionId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
          resolve(transaction);
        } else {
          reject(new Error('Transaction not found'));
        }
      }, 300);
    });
  },

  // Get recent transactions (last 5)
  getRecentTransactions: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        const userTransactions = transactions
          .filter(t => 
            t.senderId === currentUser.id || 
            t.recipientEmail === currentUser.email
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);

        resolve(userTransactions);
      }, 300);
    });
  }
};

export default transactionService;
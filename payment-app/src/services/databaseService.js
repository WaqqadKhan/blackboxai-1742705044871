// Mock database using localStorage
const DATABASE_KEYS = {
  USERS: 'payment_app_users',
  TRANSACTIONS: 'payment_app_transactions'
};

// Initialize default data if not exists
if (!localStorage.getItem(DATABASE_KEYS.USERS)) {
  localStorage.setItem(DATABASE_KEYS.USERS, JSON.stringify([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123', // In a real app, this would be hashed
      balance: 5000.00
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      balance: 3000.00
    }
  ]));
}

if (!localStorage.getItem(DATABASE_KEYS.TRANSACTIONS)) {
  localStorage.setItem(DATABASE_KEYS.TRANSACTIONS, JSON.stringify([]));
}

const databaseService = {
  // User operations
  getUsers: () => {
    return JSON.parse(localStorage.getItem(DATABASE_KEYS.USERS));
  },

  getUserByEmail: (email) => {
    const users = JSON.parse(localStorage.getItem(DATABASE_KEYS.USERS));
    return users.find(user => user.email === email);
  },

  updateUserBalance: (email, newBalance) => {
    const users = JSON.parse(localStorage.getItem(DATABASE_KEYS.USERS));
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return { ...user, balance: newBalance };
      }
      return user;
    });
    localStorage.setItem(DATABASE_KEYS.USERS, JSON.stringify(updatedUsers));
  },

  // Transaction operations
  addTransaction: (transaction) => {
    const transactions = JSON.parse(localStorage.getItem(DATABASE_KEYS.TRANSACTIONS));
    const newTransaction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...transaction
    };
    transactions.push(newTransaction);
    localStorage.setItem(DATABASE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTransaction;
  },

  getTransactionsByUser: (email) => {
    const transactions = JSON.parse(localStorage.getItem(DATABASE_KEYS.TRANSACTIONS));
    return transactions.filter(tx => 
      tx.senderEmail === email || tx.recipientEmail === email
    );
  },

  // Transfer money between accounts
  transferMoney: (senderEmail, recipientEmail, amount, description) => {
    const users = JSON.parse(localStorage.getItem(DATABASE_KEYS.USERS));
    const sender = users.find(user => user.email === senderEmail);
    const recipient = users.find(user => user.email === recipientEmail);

    if (!sender || !recipient) {
      throw new Error('Invalid sender or recipient');
    }

    if (sender.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Update balances
    const updatedUsers = users.map(user => {
      if (user.email === senderEmail) {
        return { ...user, balance: user.balance - amount };
      }
      if (user.email === recipientEmail) {
        return { ...user, balance: user.balance + amount };
      }
      return user;
    });

    // Save updated balances
    localStorage.setItem(DATABASE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Record transaction
    const transaction = {
      type: 'TRANSFER',
      senderEmail,
      recipientEmail,
      amount,
      description,
      currency: 'USD'
    };

    return databaseService.addTransaction(transaction);
  }
};

export default databaseService;
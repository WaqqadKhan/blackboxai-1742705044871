import databaseService from './databaseService';
import walletService from './walletService';

const transactionService = {
  // Send payment to another user
  async sendPayment({ senderEmail, recipientEmail, amount, currency, description }) {
    try {
      // Perform the transfer in the specified currency
      const result = await walletService.transfer(
        senderEmail,
        recipientEmail,
        currency,
        amount
      );

      // Record the transaction
      const transaction = await databaseService.addTransaction({
        type: 'SEND',
        senderEmail,
        recipientEmail,
        amount,
        currency,
        description,
        senderBalance: result.senderBalance,
        recipientBalance: result.recipientBalance
      });

      return transaction;
    } catch (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  },

  // Get all transactions for a user
  async getTransactions(userEmail) {
    try {
      const transactions = await databaseService.getTransactionsByUser(userEmail);
      return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  },

  // Get recent transactions for a user
  async getRecentTransactions(userEmail, limit = 5) {
    try {
      const transactions = await this.getTransactions(userEmail);
      return transactions.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch recent transactions: ${error.message}`);
    }
  },

  // Record a currency exchange transaction
  async recordExchange({ userEmail, fromAmount, fromCurrency, toAmount, toCurrency, rate }) {
    try {
      const transaction = await databaseService.addTransaction({
        type: 'EXCHANGE',
        senderEmail: userEmail,
        recipientEmail: userEmail,
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        rate,
        description: `Exchanged ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`
      });

      return transaction;
    } catch (error) {
      throw new Error(`Failed to record exchange: ${error.message}`);
    }
  },

  // Get transaction statistics
  async getTransactionStats(userEmail) {
    try {
      const transactions = await this.getTransactions(userEmail);
      
      return {
        totalSent: transactions
          .filter(t => t.type === 'SEND' && t.senderEmail === userEmail)
          .reduce((sum, t) => sum + t.amount, 0),
        totalReceived: transactions
          .filter(t => t.type === 'SEND' && t.recipientEmail === userEmail)
          .reduce((sum, t) => sum + t.amount, 0),
        totalExchanges: transactions
          .filter(t => t.type === 'EXCHANGE')
          .length
      };
    } catch (error) {
      throw new Error(`Failed to get transaction statistics: ${error.message}`);
    }
  }
};

export default transactionService;
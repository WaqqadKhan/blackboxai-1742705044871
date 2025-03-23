import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faExchangeAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import transactionService from '../services/transactionService';
import currencyService from '../services/currencyService';

const TransactionHistory = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userTransactions = await transactionService.getTransactions(user.email);
        setTransactions(userTransactions);
        setError('');
      } catch (err) {
        setError('Failed to load transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user.email]);

  const formatAmount = (amount, currency) => {
    return currencyService.formatCurrency(amount, currency);
  };

  const TransactionItem = ({ transaction }) => {
    const isOutgoing = transaction.type === 'SEND' && transaction.senderEmail === user.email;
    const isExchange = transaction.type === 'EXCHANGE';

    let icon = isExchange ? (
      <FontAwesomeIcon icon={faExchangeAlt} className="text-blue-600" />
    ) : (
      <FontAwesomeIcon
        icon={isOutgoing ? faArrowUp : faArrowDown}
        className={isOutgoing ? 'text-red-600' : 'text-green-600'}
      />
    );

    let description = isExchange
      ? `Exchanged ${formatAmount(transaction.fromAmount, transaction.fromCurrency)} to ${formatAmount(transaction.toAmount, transaction.toCurrency)}`
      : `${isOutgoing ? 'To' : 'From'} ${isOutgoing ? transaction.recipientEmail : transaction.senderEmail}`;

    let amount = isExchange
      ? `${formatAmount(transaction.fromAmount, transaction.fromCurrency)} → ${formatAmount(transaction.toAmount, transaction.toCurrency)}`
      : formatAmount(transaction.amount, transaction.currency || 'USD');

    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${isExchange ? 'bg-blue-100' : isOutgoing ? 'bg-red-100' : 'bg-green-100'} mr-4`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-gray-900">{description}</p>
            {transaction.description && (
              <p className="text-sm text-gray-500">{transaction.description}</p>
            )}
            <p className="text-xs text-gray-400">
              {new Date(transaction.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <div className={`font-medium ${isExchange ? 'text-blue-600' : isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
          {isOutgoing && !isExchange ? '-' : ''}{amount}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faClock} spin className="text-blue-500 text-3xl" />
        <p className="ml-2">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction History</h2>

        {error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No transactions found</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
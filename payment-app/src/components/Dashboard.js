import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faExchangeAlt,
  faChartLine,
  faClock,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import transactionService from '../services/transactionService';
import currencyService from '../services/currencyService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const transactions = await transactionService.getRecentTransactions();
        setRecentTransactions(transactions);
      } catch (err) {
        setError('Failed to load recent transactions');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, []);

  const QuickActionCard = ({ icon, title, description, to, color }) => (
    <Link
      to={to}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
    >
      <div className={`inline-flex items-center justify-center p-3 rounded-full ${color} mb-4`}>
        <FontAwesomeIcon icon={icon} className="text-white text-xl" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );

  const TransactionItem = ({ transaction }) => {
    const isOutgoing = transaction.type === 'SEND';
    const amount = currencyService.formatCurrency(transaction.amount, transaction.currency);

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${isOutgoing ? 'bg-red-100' : 'bg-green-100'} mr-4`}>
            <FontAwesomeIcon
              icon={isOutgoing ? faArrowUp : faArrowDown}
              className={`${isOutgoing ? 'text-red-600' : 'text-green-600'}`}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {isOutgoing ? `To ${transaction.recipientEmail}` : `From ${transaction.senderEmail}`}
            </p>
            <p className="text-sm text-gray-500">{transaction.description}</p>
            <p className="text-xs text-gray-400">
              {new Date(transaction.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`font-medium ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
          {isOutgoing ? `-${amount}` : `+${amount}`}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Balance Card */}
      <div className="bg-blue-600 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-white text-lg font-medium mb-2">Available Balance</h2>
        <div className="text-white text-3xl font-bold mb-4">
          {currencyService.formatCurrency(user?.balance || 0, 'USD')}
        </div>
        <div className="flex space-x-4">
          <Link
            to="/payment"
            className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            Send Money
          </Link>
          <Link
            to="/exchange"
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-400 transition-colors duration-200"
          >
            Exchange Currency
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <QuickActionCard
          icon={faPaperPlane}
          title="Send Money"
          description="Transfer money to other users quickly and securely"
          to="/payment"
          color="bg-blue-500"
        />
        <QuickActionCard
          icon={faExchangeAlt}
          title="Currency Exchange"
          description="Convert between different currencies at great rates"
          to="/exchange"
          color="bg-green-500"
        />
        <QuickActionCard
          icon={faChartLine}
          title="Transaction History"
          description="View your past transactions and payment history"
          to="/transactions"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={faClock} spin className="text-gray-400 text-2xl" />
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No recent transactions</div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
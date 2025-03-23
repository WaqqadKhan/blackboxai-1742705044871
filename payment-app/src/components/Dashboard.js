import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faExchangeAlt,
  faChartLine,
  faClock,
  faArrowUp,
  faArrowDown,
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import transactionService from '../services/transactionService';
import currencyService from '../services/currencyService';
import walletService from '../services/walletService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [wallets, setWallets] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's wallets
        const userWallets = walletService.getUserWallets(user.email);
        setWallets(userWallets);

        // Fetch recent transactions
        const transactions = await transactionService.getRecentTransactions(user.email);
        setRecentTransactions(transactions);

        // Fetch transaction stats
        const transactionStats = await transactionService.getTransactionStats(user.email);
        setStats(transactionStats);

        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.email]);

  const WalletCard = ({ currency, balance }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faWallet} className="text-blue-500 text-xl mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{currency}</h3>
        </div>
        <span className="text-sm text-gray-500">Available Balance</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {currencyService.formatCurrency(balance, currency)}
      </div>
    </div>
  );

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
    const isOutgoing = transaction.type === 'SEND' && transaction.senderEmail === user.email;
    const amount = currencyService.formatCurrency(
      transaction.amount,
      transaction.currency || 'USD'
    );

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
              {transaction.type === 'EXCHANGE' 
                ? `Exchanged ${transaction.fromCurrency} to ${transaction.toCurrency}`
                : isOutgoing 
                  ? `To ${transaction.recipientEmail}` 
                  : `From ${transaction.senderEmail}`
              }
            </p>
            <p className="text-sm text-gray-500">{transaction.description}</p>
            <p className="text-xs text-gray-400">
              {new Date(transaction.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`font-medium ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
          {isOutgoing ? '-' : '+'}
          {amount}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FontAwesomeIcon icon={faClock} spin className="text-blue-500 text-3xl" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(wallets).map(([currency, balance]) => (
          <WalletCard key={currency} currency={currency} balance={balance} />
        ))}
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

      {/* Transaction Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-red-600">
                {currencyService.formatCurrency(stats.totalSent, 'USD')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold text-green-600">
                {currencyService.formatCurrency(stats.totalReceived, 'USD')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Currency Exchanges</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalExchanges}</p>
            </div>
          </div>
        </div>
      )}

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

        {error ? (
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
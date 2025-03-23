import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faSpinner,
  faFilter,
  faSort,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import transactionService from '../services/transactionService';
import currencyService from '../services/currencyService';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    searchQuery: '',
    dateRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
      setError('');
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filterTransactions = (transaction) => {
    // Filter by type
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        transaction.recipientEmail?.toLowerCase().includes(searchLower) ||
        transaction.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const txDate = new Date(transaction.timestamp);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));

      if (filters.dateRange === '30days' && txDate < thirtyDaysAgo) return false;
      if (filters.dateRange === '90days' && txDate < ninetyDaysAgo) return false;
    }

    return true;
  };

  const sortTransactions = (a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    if (key === 'amount') {
      comparison = a.amount - b.amount;
    } else if (key === 'timestamp') {
      comparison = new Date(a.timestamp) - new Date(b.timestamp);
    } else {
      comparison = String(a[key]).localeCompare(String(b[key]));
    }

    return direction === 'asc' ? comparison : -comparison;
  };

  const filteredAndSortedTransactions = transactions
    .filter(filterTransactions)
    .sort(sortTransactions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Transaction Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="SEND">Sent</option>
              <option value="RECEIVE">Received</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Search
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Search by email or description"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faSort} className="mr-2" />
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-3xl" />
            <p className="mt-2 text-gray-600">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : filteredAndSortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    Date
                    <FontAwesomeIcon icon={faSort} className="ml-1" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                    <FontAwesomeIcon icon={faSort} className="ml-1" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'SEND' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        <FontAwesomeIcon 
                          icon={transaction.type === 'SEND' ? faArrowUp : faArrowDown}
                          className="mr-1"
                        />
                        {transaction.type === 'SEND' ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{transaction.description || '-'}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.type === 'SEND' ? `To: ${transaction.recipientEmail}` : `From: ${transaction.senderEmail}`}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'SEND' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'SEND' ? '-' : '+'}
                      {currencyService.formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
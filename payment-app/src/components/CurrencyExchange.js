import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import currencyService from '../services/currencyService';
import walletService from '../services/walletService';
import transactionService from '../services/transactionService';

const CurrencyExchange = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState({});

  useEffect(() => {
    const fetchWallets = () => {
      const userWallets = walletService.getUserWallets(user.email);
      setWallets(userWallets);
    };
    fetchWallets();
  }, [user.email]);

  const handleExchange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Check if user has sufficient balance
      const fromBalance = wallets[fromCurrency] || 0;
      if (fromBalance < numAmount) {
        throw new Error('Insufficient funds');
      }

      // Perform the exchange
      const result = await currencyService.convertCurrency(
        numAmount,
        fromCurrency,
        toCurrency,
        user.email
      );

      // Record the exchange transaction
      await transactionService.recordExchange({
        userEmail: user.email,
        fromAmount: numAmount,
        fromCurrency,
        toAmount: result.amount,
        toCurrency,
        rate: result.rate
      });

      // Update wallets state
      setWallets({
        ...wallets,
        [fromCurrency]: result.fromBalance,
        [toCurrency]: result.toBalance
      });

      setSuccess(`Successfully exchanged ${numAmount} ${fromCurrency} to ${result.amount.toFixed(2)} ${toCurrency}`);
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Currency Exchange</h2>

        {/* Available Balance */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Available Balance</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(wallets).map(([currency, balance]) => (
              <div
                key={currency}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="text-sm text-gray-500">{currency}</div>
                <div className="text-lg font-semibold">
                  {currencyService.formatCurrency(balance, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Form */}
        <form onSubmit={handleExchange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="mt-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {currencyService.getSupportedCurrencies().map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faExchangeAlt} className="h-5 w-5" />
              </button>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {currencyService.getSupportedCurrencies().map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {success}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Converting...' : 'Convert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurrencyExchange;
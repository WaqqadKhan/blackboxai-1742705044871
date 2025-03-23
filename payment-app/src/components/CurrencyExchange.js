import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExchangeAlt,
  faSpinner,
  faInfoCircle,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import currencyService from '../services/currencyService';

const CurrencyExchange = () => {
  const { user } = useContext(AuthContext);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const supportedCurrencies = await currencyService.getSupportedCurrencies();
      setCurrencies(supportedCurrencies);
    } catch (err) {
      setError('Failed to load currencies');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset results when inputs change
    setConvertedAmount(null);
    setExchangeRate(null);
    setSuccess(false);
  };

  const handleSwapCurrencies = () => {
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency
    }));
    setConvertedAmount(null);
    setExchangeRate(null);
  };

  const validateForm = () => {
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (formData.fromCurrency === formData.toCurrency) {
      setError('Please select different currencies');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setConvertedAmount(null);
    setExchangeRate(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await currencyService.convertCurrency(
        parseFloat(formData.amount),
        formData.fromCurrency,
        formData.toCurrency
      );

      setConvertedAmount(result.amount);
      setExchangeRate(result.rate);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to convert currency');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Currency Exchange</h1>

        {/* Balance Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600">Available Balance</div>
          <div className="text-xl font-semibold text-gray-900">
            {currencyService.formatCurrency(user?.balance || 0, 'USD')}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faInfoCircle} className="text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && convertedAmount && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faCheck} className="text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {currencyService.formatCurrency(formData.amount, formData.fromCurrency)} = {' '}
                  {currencyService.formatCurrency(convertedAmount, formData.toCurrency)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Exchange rate: 1 {formData.fromCurrency} = {exchangeRate.toFixed(4)} {formData.toCurrency}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="amount"
                id="amount"
                value={formData.amount}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 items-end">
            <div className="col-span-2">
              <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700">
                From
              </label>
              <select
                name="fromCurrency"
                id="fromCurrency"
                value={formData.fromCurrency}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {currencies.map(currency => (
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
                className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faExchangeAlt} className="h-5 w-5" />
              </button>
            </div>

            <div className="col-span-2">
              <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <select
                name="toCurrency"
                id="toCurrency"
                value={formData.toCurrency}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Converting...
                </>
              ) : (
                'Convert'
              )}
            </button>
          </div>
        </form>

        {/* Exchange Rate Table */}
        {currencies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Popular Exchange Rates</h2>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              {['EUR', 'GBP', 'JPY', 'CAD'].map(currency => (
                <div key={currency} className="text-sm">
                  <span className="text-gray-600">1 USD = </span>
                  <span className="text-gray-900 font-medium">
                    {currencyService.formatCurrency(
                      currencies.find(c => c.code === currency)?.rate || 0,
                      currency
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyExchange;
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const CurrencyContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// ==========================================
// CURRENCY METADATA (symbols, labels, flags)
// ==========================================
const CURRENCY_META = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
  NGN: { code: 'NGN', symbol: '₦', label: 'Nigerian Naira', flag: '🇳🇬' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', flag: '🇬🇧' },
};

// ==========================================
// FALLBACK RATES (if API fails entirely)
// ==========================================
const FALLBACK_RATES = { USD: 1, NGN: 1600, GBP: 0.79 };

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved && CURRENCY_META[saved] ? saved : 'USD';
  });

  const [rates, setRates] = useState(FALLBACK_RATES);
  const [ratesSource, setRatesSource] = useState('fallback');
  const [loading, setLoading] = useState(true);

  // ✅ Fetch live rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await api.get('/rates');

        if (response.data.success) {
          setRates(response.data.rates);
          setRatesSource(response.data.source);
          console.log('✅ Rates loaded:', response.data.rates);
          console.log('📊 Source:', response.data.source);
        }
      } catch (error) {
        console.error('❌ Error loading rates:', error.message);
        // Keep fallback rates
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Save currency selection to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

    // ==========================================
    // FORMAT PRICE USING LIVE RATES
    // ==========================================
    const formatPrice = (amountInUSD) => {
    if (amountInUSD === null || amountInUSD === undefined) return '';

    const meta = CURRENCY_META[currency];
    const rate = rates[currency] || 1;
    const converted = amountInUSD * rate;

    // ✅ No decimals
    const formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return `${meta.symbol}${formatted}`;
    };

  const value = {
    currency,
    setCurrency,
    formatPrice,
    currentCurrency: CURRENCY_META[currency],
    currencies: CURRENCY_META,
    rates,
    ratesSource, // 'live' | 'cache' | 'stale-cache' | 'fallback'
    loading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
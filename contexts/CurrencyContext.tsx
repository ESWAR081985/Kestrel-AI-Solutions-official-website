import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // 1 standard Unit of Currency = X Indian Rupees (INR is our source/base)
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', rate: 1.0, label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', rate: 83.5, label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', rate: 90.2, label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', rate: 106.1, label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', rate: 0.53, label: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'C$', rate: 61.2, label: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', rate: 55.8, label: 'Australian Dollar (A$)' },
  { code: 'AED', symbol: 'AED', rate: 22.7, label: 'UAE Dirham (AED)' }
];

interface CurrencyContextType {
  activeCurrency: CurrencyConfig;
  setCurrencyByCode: (code: string) => void;
  convertAmount: (amountInInr: number) => number;
  formatAmount: (amountInInr: number, style?: 'short' | 'full' | 'chart') => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeCurrency, setActiveCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);

  useEffect(() => {
    const savedCode = localStorage.getItem('activeCurrencyCode');
    if (savedCode) {
      const matched = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
      if (matched) {
        setActiveCurrency(matched);
      }
    }
  }, []);

  const setCurrencyByCode = (code: string) => {
    const matched = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (matched) {
      setActiveCurrency(matched);
      localStorage.setItem('activeCurrencyCode', code);
    }
  };

  const convertAmount = (amountInInr: number): number => {
    // Since our database numbers are in INR: Convert to selected currency
    return amountInInr / activeCurrency.rate;
  };

  const formatAmount = (amountInInr: number, style: 'short' | 'full' | 'chart' = 'full'): string => {
    const sign = amountInInr < 0 ? '-' : '';
    const absVal = Math.abs(amountInInr);
    const converted = absVal / activeCurrency.rate;

    if (style === 'chart') {
      if (activeCurrency.code === 'INR') {
        if (converted >= 10000000) {
          return `${sign}${activeCurrency.symbol}${(converted / 10000000).toFixed(1)}Cr`;
        }
        if (converted >= 100000) {
          return `${sign}${activeCurrency.symbol}${(converted / 100000).toFixed(0)}L`;
        }
      } else {
        if (converted >= 1000000) {
          return `${sign}${activeCurrency.symbol}${(converted / 1000000).toFixed(1)}M`;
        }
        if (converted >= 1000) {
          return `${sign}${activeCurrency.symbol}${(converted / 1000).toFixed(0)}K`;
        }
      }
      return `${sign}${activeCurrency.symbol}${Math.round(converted).toLocaleString()}`;
    }

    if (style === 'short') {
      if (activeCurrency.code === 'INR') {
        if (converted >= 10000000) {
          return `${sign}${activeCurrency.symbol}${(converted / 10000000).toFixed(2)} Cr`;
        }
        if (converted >= 100000) {
          return `${sign}${activeCurrency.symbol}${(converted / 100000).toFixed(1)} L`;
        }
      } else {
        if (converted >= 1000000) {
          return `${sign}${activeCurrency.symbol}${(converted / 1000000).toFixed(2)} M`;
        }
        if (converted >= 1000) {
          return `${sign}${activeCurrency.symbol}${(converted / 1000).toFixed(1)} K`;
        }
      }
      return `${sign}${activeCurrency.symbol}${Math.round(converted).toLocaleString()}`;
    }

    // Default 'full' format using Intl.NumberFormat
    const localeString = activeCurrency.code === 'INR' ? 'en-IN' : 'en-US';
    const decimals = converted % 1 === 0 ? 0 : 2;

    try {
      const formatter = new Intl.NumberFormat(localeString, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}${activeCurrency.symbol}${formatter.format(converted)}`;
    } catch (e) {
      return `${sign}${activeCurrency.symbol}${converted.toLocaleString(localeString, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setCurrencyByCode, convertAmount, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

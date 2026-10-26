import React, { createContext, useContext, useState } from 'react';
import { SUPPORTED_CURRENCIES, type CurrencyConfig } from '../utils/formatters';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  currencies: CurrencyConfig[];
  currentCurrencyConfig: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('hotelpro_currency') || 'INR';
  });

  const setCurrency = (code: string) => {
    setCurrencyState(code);
    localStorage.setItem('hotelpro_currency', code);
  };

  const currentCurrencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencies: SUPPORTED_CURRENCIES,
        currentCurrencyConfig,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

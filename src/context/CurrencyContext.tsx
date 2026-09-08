import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrencyCode, CurrencyConfig } from "../types";

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateAgainstUSD: 1.0, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateAgainstUSD: 0.92, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateAgainstUSD: 0.79, locale: "en-GB" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rateAgainstUSD: 86.5, locale: "en-IN" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  config: CurrencyConfig;
  formatMoney: (
    amount: number,
    options?: { compact?: boolean; hideDecimals?: boolean; showSign?: boolean; autoDecimals?: boolean }
  ) => string;
  formatNumber: (value: number, options?: { maximumFractionDigits?: number }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("financehub_currency");
      if (saved && saved in CURRENCIES) {
        return saved as CurrencyCode;
      }
    }
    return "USD";
  });

  const config = CURRENCIES[currency];

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("financehub_currency", code);
    }
  };

  useEffect(() => {
    // If URL has ?curr=EUR, respect it
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("curr");
      if (c && c in CURRENCIES) {
        setCurrencyState(c as CurrencyCode);
      }
    }
  }, []);

  const formatMoney = (
    amount: number,
    options?: { compact?: boolean; hideDecimals?: boolean; showSign?: boolean; autoDecimals?: boolean }
  ): string => {
    if (isNaN(amount) || amount === null || amount === undefined) return `${config.symbol}0`;

    const sign = options?.showSign && amount > 0 ? "+" : "";
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);

    if (options?.compact) {
      if (currency === "INR") {
        if (absVal >= 10000000) {
          const valStr = (absVal / 10000000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
          return `${isNegative ? "-" : ""}${sign}${config.symbol}${valStr}\u00A0Cr`;
        }
        if (absVal >= 100000) {
          const valStr = (absVal / 100000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
          return `${isNegative ? "-" : ""}${sign}${config.symbol}${valStr}\u00A0L`;
        }
        if (absVal >= 10000) {
          const valStr = (absVal / 1000).toFixed(1).replace(/\.0$/, "");
          return `${isNegative ? "-" : ""}${sign}${config.symbol}${valStr}\u00A0k`;
        }
      }

      if (absVal >= 1_000_000_000) {
        const valStr = (absVal / 1_000_000_000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
        return `${isNegative ? "-" : ""}${sign}${config.symbol}${valStr}B`;
      }
      if (absVal >= 1_000_000) {
        const valStr = (absVal / 1_000_000).toFixed(1).replace(/\.0$/, "");
        return `${isNegative ? "-" : ""}${sign}${config.symbol}${valStr}M`;
      }
      if (absVal >= 10_000) {
        const valStr = (absVal / 1_000).toFixed(1).replace(/\.0$/, "");
        return `${isNegative ? "-" : ""}${sign}${config.symbol}${valStr}k`;
      }
    }

    const decimals = options?.hideDecimals || options?.compact
      ? 0
      : options?.autoDecimals && absVal % 1 === 0
      ? 0
      : 2;

    const formattedNum = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(absVal);

    return `${isNegative ? "-" : ""}${sign}${config.symbol}${formattedNum}`;
  };

  const formatNumber = (value: number, options?: { maximumFractionDigits?: number }): string => {
    if (isNaN(value) || value === null || value === undefined) return "0";
    return new Intl.NumberFormat(config.locale, {
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, config, formatMoney, formatNumber }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
};

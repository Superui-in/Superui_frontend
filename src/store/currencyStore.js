import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const COUNTRIES = [
  { code: 'IN', currency: 'INR', symbol: '₹', name: 'India', flag: 'https://flagcdn.com/16x12/in.png', rate: 1 },
  { code: 'US', currency: 'USD', symbol: '$', name: 'United States', flag: 'https://flagcdn.com/16x12/us.png', rate: 0.012 },
  { code: 'EU', currency: 'EUR', symbol: '€', name: 'Europe', flag: 'https://flagcdn.com/16x12/eu.png', rate: 0.011 },
  { code: 'GB', currency: 'GBP', symbol: '£', name: 'United Kingdom', flag: 'https://flagcdn.com/16x12/gb.png', rate: 0.0095 },
];

const useCurrencyStore = create(
  persist(
    (set, get) => ({
      selectedCountry: COUNTRIES[0], // Default: India INR

      setCountry: (countryCode) => {
        const found = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
        set({ selectedCountry: found });
      },

      convertPrice: (inrAmount) => {
        if (!inrAmount || isNaN(inrAmount)) return 0;
        const rate = get().selectedCountry.rate || 1;
        return Number((Number(inrAmount) * rate).toFixed(2));
      },

      formatPrice: (inrAmount) => {
        const { symbol, rate, code } = get().selectedCountry;
        if (inrAmount === undefined || inrAmount === null || isNaN(inrAmount)) return `${symbol}0`;
        const converted = Number(inrAmount) * rate;

        if (code === 'IN') {
          return `${symbol}${Math.round(converted).toLocaleString('en-IN')}`;
        } else {
          return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      },
    }),
    {
      name: 'digitalstore-currency',
    }
  )
);

export default useCurrencyStore;

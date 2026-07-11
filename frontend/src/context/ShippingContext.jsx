import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useProducts } from './ProductContext';

const ShippingContext = createContext();

export function ShippingProvider({ children }) {
  const [activeRules, setActiveRules] = useState([]);
  const [detectedRegion, setDetectedRegion] = useState(null);
  const [detectedCountry, setDetectedCountry] = useState("IN");
  const [currencyContext, setCurrencyContext] = useState({
    countryCode: "IN",
    currency: "INR",
    currencySymbol: "₹",
    conversionRate: 1
  });
  const [loading, setLoading] = useState(true);
  const { countryCode } = useProducts();

  const fetchShippingInfo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shipping/public', {
        params: { countryCode }
      });
      if (data.success) {
        setActiveRules(data.regions || data.rules || []);
        setDetectedRegion(data.detectedRegion || data.detectedRule || null);
        setDetectedCountry(data.detectedCountry || "IN");
        if (data.currencyContext) {
          setCurrencyContext(data.currencyContext);
        }
      }
    } catch (error) {
      console.error('Failed to fetch public shipping regions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingInfo();
  }, [countryCode]);

  const convertRegionToBrowsingCurrency = (amount, regionCurrency) => {
    const { currency: visitorCurrency, conversionRate, usdConversionRate } = currencyContext;
    
    if (visitorCurrency === regionCurrency) {
      return amount;
    }

    if (regionCurrency === "INR") {
      return Number((amount / (conversionRate || 1)).toFixed(2));
    } else {
      if (visitorCurrency === "INR") {
        return Number((amount * (usdConversionRate || 94.4)).toFixed(2));
      }
      const targetRate = (usdConversionRate || 94.4) / (conversionRate || 1);
      return Number((amount * targetRate).toFixed(2));
    }
  };

  const convertBrowsingToRegionCurrency = (amount, regionCurrency) => {
    const { currency: visitorCurrency, conversionRate, usdConversionRate } = currencyContext;

    if (visitorCurrency === regionCurrency) {
      return amount;
    }

    if (regionCurrency === "INR") {
      return amount * (conversionRate || 1);
    } else {
      if (visitorCurrency === "INR") {
        return amount / (usdConversionRate || 94.4);
      }
      const targetRate = (usdConversionRate || 94.4) / (conversionRate || 1);
      return amount / targetRate;
    }
  };

  // Dynamic shipping charge calculator
  const calculateShippingCost = (subtotal, totalWeight = 0) => {
    if (!detectedRegion) {
      return {
        charge: 0,
        deliveryTime: "",
        method: "Flat"
      };
    }

    const { flatShippingCharge, freeShippingThreshold, deliveryTime, weightRules } = detectedRegion;
    const regionCurrency = detectedRegion.currency || "USD";

    const subtotalInRegionCurrency = convertBrowsingToRegionCurrency(subtotal, regionCurrency);
    let rawCharge = flatShippingCharge || 0;
    let method = "Flat";

    // Weight-wise Shipping Logic
    if (weightRules && weightRules.length > 0 && totalWeight > 0) {
      const matchedWeightRule = weightRules.find(
        (r) => totalWeight >= r.minWeight && totalWeight < r.maxWeight
      );
      if (matchedWeightRule) {
        rawCharge = matchedWeightRule.charge;
        method = "Weight";
      }
    }

    // Flat Shipping / Free Threshold Logic
    if (
      freeShippingThreshold !== null &&
      freeShippingThreshold !== undefined &&
      freeShippingThreshold > 0 &&
      subtotalInRegionCurrency >= freeShippingThreshold
    ) {
      rawCharge = 0;
    }

    const convertedCharge = convertRegionToBrowsingCurrency(rawCharge, regionCurrency);

    return {
      charge: convertedCharge,
      deliveryTime,
      method
    };
  };

  return (
    <ShippingContext.Provider
      value={{
        activeRules,
        detectedRegion,
        detectedCountry,
        currencyContext,
        loading,
        calculateShippingCost,
        refreshShipping: fetchShippingInfo
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
}

export function useShipping() {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used inside a ShippingProvider');
  }
  return context;
}

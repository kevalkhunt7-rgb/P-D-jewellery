
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useProducts } from './ProductContext';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { countryCode } = useProducts();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/public', {
          params: { countryCode }
        });
      if (data.success) {
  console.log("PUBLIC SETTINGS API:", data);
  console.log("SETTINGS:", data.settings);

  setSettings(data.settings);
}
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [countryCode]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside a SettingsProvider');
  }
  return context;
}

"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext();

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}

export function RefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const value = {
    refreshKey,
    triggerRefresh,
  };

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  );
}

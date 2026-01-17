import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: CityOption[];
  setAvailableCities: (cities: CityOption[]) => void;
}

export interface CityOption {
  base: string;
  translated: string;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  // Default to Guangzhou
  const [selectedCity, setSelectedCity] = useState<string>('Guangzhou');
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);

  // Persist selection to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      setSelectedCity(saved);
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem('selectedCity', selectedCity);
    }
  }, [selectedCity]);

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, availableCities, setAvailableCities }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

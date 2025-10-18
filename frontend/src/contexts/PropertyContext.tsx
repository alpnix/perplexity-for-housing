"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Property } from "@/types";

interface PropertyContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  return (
    <PropertyContext.Provider value={{ selectedProperty, setSelectedProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
};
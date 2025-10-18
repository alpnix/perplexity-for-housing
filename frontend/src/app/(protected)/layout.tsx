"use client";

import { PropertyProvider } from "@/contexts/PropertyContext";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PropertyProvider>
      {children}
    </PropertyProvider>
  );
}
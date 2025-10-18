"use client";

import { useEffect, useMemo, useState } from "react";
import { useFetch, useMutate } from "@/hooks/useAPiCall";
import toast from "react-hot-toast";
import { ApiResponse, Property } from "@/types";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const CACHE_KEY = useMemo(() => "propertiesCache", []);
  const AGENTS_CACHE_KEY = useMemo(() => "realEstateAgentsCache", []);

  // Hydrate from cache on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: Property[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProperties(parsed);
        }
      }
    } catch (e) {
      // ignore cache errors
    }
  }, [CACHE_KEY]);

  type PropertiesFilters = {
    search?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    minBaths?: number;
    status?: string;
  } | undefined;

  const fetchProperties = useMutate<Property[], Error, PropertiesFilters, unknown>(
    async (filters: PropertiesFilters) => {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(CACHE_KEY);
        const hasCache = !!cached && cached !== "[]";
        // Show spinner only if there is no cache
        setIsLoading(!hasCache);
      }

      const params = new URLSearchParams();
      if (filters?.search) params.set("search", String(filters.search));
      if (filters?.type && filters.type !== "all") params.set("type", String(filters.type));
      if (typeof filters?.minPrice === "number" && filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
      if (typeof filters?.maxPrice === "number" && filters.maxPrice !== 10000) params.set("maxPrice", String(filters.maxPrice));
      if (typeof filters?.minBeds === "number" && filters.minBeds > 0) params.set("minBeds", String(filters.minBeds));
      if (typeof filters?.minBaths === "number" && filters.minBaths > 0) params.set("minBaths", String(filters.minBaths));
      if (filters?.status) params.set("status", String(filters.status));

      const url = `${process.env.NEXT_PUBLIC_API_URL}/properties${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await useFetch(url, "GET", null);
      const result: ApiResponse<Property[]> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch properties.");
      }
      return result.data;
    },
    {
      onSuccess: (data: Property[]) => {
        setProperties(data);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
        } catch (e) {
          // ignore cache write errors
        }
        setIsLoading(false);
        toast.success("Properties loaded successfully!");
      },
      onError: (err: Error) => {
        console.error("Fetch Properties Error", err);
        toast.error(err.message);
        setError(err.message);
        setIsLoading(false);
      },
    }
  );

  const fetchRealEstateAgents = useMutate<string[], Error, void, unknown>(
    async () => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/agents`,
        "GET",
        null
      );
      const result: ApiResponse<string[]> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch real estate agents.");
      }
      return result.data;
    },
    {
      onSuccess: (data: string[]) => {
        setAgents(data);
        try {
          if (typeof window !== "undefined") {
            const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week
            localStorage.setItem(
              AGENTS_CACHE_KEY,
              JSON.stringify({ agents: data, expiresAt })
            );
          }
        } catch {}
      },
      onError: (err: Error) => {
        console.error("Fetch Agents Error", err);
        toast.error(err.message);
      },
    }
  );

  // Public loader that prefers localStorage cache with weekly expiry
  const loadRealEstateAgents = async (): Promise<void> => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(AGENTS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { agents?: string[]; expiresAt?: number };
          if (Array.isArray(parsed?.agents) && parsed?.expiresAt && parsed.expiresAt > Date.now()) {
            setAgents(parsed.agents);
            return; // cache hit, no network call
          }
        }
      }
    } catch {}

    // fallback to API and cache via onSuccess handler
    await fetchRealEstateAgents.mutateAsync(undefined);
  };

  const fetchPropertyById = useMutate(
    async (id: string) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
        "GET",
        null
      );
      const result: ApiResponse<Property> = await response.json();
      if (result.status !== 200 || !result.data) {
        throw new Error(result.message || "Failed to fetch property.");
      }
      return result.data;
    },
    {
      onSuccess: (data: Property) => {
        setProperty(data);
        toast.success("Property loaded successfully!");
      },
      onError: (err: Error) => {
        console.error("Fetch Property By ID Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  const setHouseInterest = useMutate(
    async (variables: { houseId: string; status: "interested" | "not-interested" }) => {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${variables.houseId}/interest`,
        "POST",
        { status: variables.status }
      );
      const result: ApiResponse<any> = await response.json();
      if (result.status !== 200) {
        throw new Error(result.message || "Failed to update interest.");
      }
      return result.data;
    },
    {
      onSuccess: () => {
        // No-op here; caller can refetch as needed
      },
      onError: (err: Error) => {
        console.error("Set House Interest Error", err);
        toast.error(err.message);
        setError(err.message);
      },
    }
  );

  return { properties, fetchProperties, fetchPropertyById, setHouseInterest, property, error, isLoading, setProperties, setError, setProperty, agents, fetchRealEstateAgents, loadRealEstateAgents };
};
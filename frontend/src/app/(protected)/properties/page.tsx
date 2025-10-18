"use client";

import React, { useState, useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaBed,
  FaBath,
  FaHeart,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdFilterList, MdSearch } from "react-icons/md";
import { useProperty } from "@/contexts/PropertyContext";
import { Property } from "@/types";

const Properties = () => {
  const { properties, fetchProperties, setHouseInterest, setProperties, agents, loadRealEstateAgents } = useProperties();
  const router = useRouter();
  const { setSelectedProperty } = useProperty();

  const [activeTab, setActiveTab] = useState<"recommended" | "interested" | "not-interested">("recommended");
  const [selectedType, setSelectedType] = useState<string>("all"); // used as RealEstate agent filter
  const [searchValue, setSearchValue] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [minBaths, setMinBaths] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('propertiesSortBy');
      if (saved) return saved;
    }
    return "recommended";
  });
  
  // Filter state for localStorage
  const [appliedFilters, setAppliedFilters] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem('propertyFilters');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            search: parsed.search ?? "",
            type: parsed.type ?? "all",
            minPrice: typeof parsed.minPrice === 'number' ? parsed.minPrice : 0,
            maxPrice: typeof parsed.maxPrice === 'number' ? parsed.maxPrice : 10000,
            minBeds: typeof parsed.minBeds === 'number' ? parsed.minBeds : 0,
            minBaths: typeof parsed.minBaths === 'number' ? parsed.minBaths : 0,
          };
        }
      } catch {}
    }
    return {
      search: "",
      type: "all",
      minPrice: 0,
      maxPrice: 10000,
      minBeds: 0,
      minBaths: 0,
    };
  });
  // Prevent initial generic fetch until we've hydrated form inputs from localStorage
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Helper: check if two property arrays have the same order by _id
  const arraysHaveSameOrder = (a: Property[], b: Property[]) => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const aid = (a[i] as any)?._id;
      const bid = (b[i] as any)?._id;
      if (aid !== bid) return false;
    }
    return true;
  };

  // Client-side sorting using propertiesCache from localStorage
  const applyClientSort = (criteria: string) => {
    try {
      if (typeof window === "undefined") return;
      const cached = localStorage.getItem("propertiesCache");
      const sourceArray = cached ? (JSON.parse(cached) as Property[]) : properties;
      if (!Array.isArray(sourceArray) || sourceArray.length === 0) return;

      if (criteria === "recommended") {
        // Keep original (recommended) order from backend/cache
        setProperties(sourceArray);
        return;
      }

      const toSort = [...sourceArray];
      if (criteria === "priceLowToHigh") {
        toSort.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      } else if (criteria === "priceHighToLow") {
        toSort.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      } else if (criteria === "newest") {
        toSort.sort((a: any, b: any) => {
          const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return db - da; // newest first
        });
      }
      // Avoid triggering an update loop if order is unchanged
      if (arraysHaveSameOrder(properties, toSort)) return;
      setProperties(toSort);
    } catch (e) {
      // fail silently; keep current order
    }
  };

  // Re-apply sorting when sort criteria changes and persist locally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('propertiesSortBy', sortBy);
    }
    applyClientSort(sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  // After properties are fetched and cache updated, re-apply current sort (without new API calls)
  useEffect(() => {
    if (sortBy !== "recommended") {
      applyClientSort(sortBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  // Hydrate input controls from the already-initialized appliedFilters once on mount
  useEffect(() => {
    // fetch agents list on mount with localStorage weekly cache
    loadRealEstateAgents();
    // Sync controlled inputs with initial appliedFilters state (possibly from localStorage)
    setSearchValue(appliedFilters.search || "");
    setSelectedType(appliedFilters.type || "all");
    setPriceRange([
      typeof appliedFilters.minPrice === 'number' ? appliedFilters.minPrice : 0,
      typeof appliedFilters.maxPrice === 'number' ? appliedFilters.maxPrice : 10000,
    ]);
    setMinBeds(typeof appliedFilters.minBeds === 'number' ? appliedFilters.minBeds : 0);
    setMinBaths(typeof appliedFilters.minBaths === 'number' ? appliedFilters.minBaths : 0);
    setFiltersInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters when activeTab changes or when filters are applied
  useEffect(() => {
    if (!filtersInitialized) return; // avoid generic request before hydration
    setIsLoading(true);
    fetchProperties.mutateAsync({
      search: appliedFilters.search,
      type: appliedFilters.type,
      minPrice: appliedFilters.minPrice,
      maxPrice: appliedFilters.maxPrice,
      minBeds: appliedFilters.minBeds,
      minBaths: appliedFilters.minBaths,
      status: activeTab,
    }).finally(() => {
      setIsLoading(false);
    });
  }, [appliedFilters, activeTab, filtersInitialized]);

  const handleInterested = (property: Property) => {
    setSelectedProperty(property);
    router.push(`/properties/${property._id}`);
  };

  const firstImage = (p: Property): string => {
    const fallback = "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8";
    if (!p.image) return fallback;
    if (Array.isArray(p.image) && p.image.length > 0) return p.image[0] || fallback;
    return fallback;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-primary-dark text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1973&q=80')]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-xl md:w-2/3 opacity-90">
            Browse our curated selection of properties and find your ideal home
            with perfect roommates.
          </p>

          <div className="mt-8 relative max-w-3xl">
            <div className="flex items-center bg-white rounded-lg shadow-lg">
              <div className="px-4 text-gray-500">
                <MdSearch className="h-6 w-6" />
              </div>
              <input
                type="text"
                placeholder="Search by location or property name"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsLoading(true);
                    const newFilters = {
                      search: searchValue,
                      type: selectedType,
                      minPrice: priceRange[0],
                      maxPrice: priceRange[1],
                      minBeds,
                      minBaths,
                    };
                    setAppliedFilters(newFilters);
                    localStorage.setItem('propertyFilters', JSON.stringify(newFilters));
                  }
                }}
                className="flex-1 p-4 outline-none text-gray-700 placeholder-gray-400 rounded-l-lg"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-primary text-white p-4 rounded-r-lg flex items-center"
              >
                <MdFilterList className="h-6 w-6 mr-2" />
                <span className="hidden md:inline">Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                      }}
                      className="w-full text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Real Estate Agents</option>
                      {agents?.map((agent) => (
                        <option key={agent} value={agent}>{agent}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range (${priceRange[0]} - ${priceRange[1]})
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={Number(priceRange[0])}
                        onChange={(e) => {
                          const newMin = Number(e.target.value);
                          setPriceRange([newMin >= 0 ? newMin : 0, priceRange[1]]);
                        }}
                        className="w-full text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value);
                          if(newMax == 0){
                            setPriceRange([priceRange[0], 10000]);
                          }else{
                            setPriceRange([priceRange[0], newMax >= 0 ? newMax : 10000]);
                          }
                        }}
                        className="w-full border text-black border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Bedrooms Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Bedrooms
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={minBeds}
                      onChange={(e) => {
                        const newBeds = Number(e.target.value);
                        console.log("Min beds:", newBeds); // Debug
                        setMinBeds(newBeds >= 0 ? newBeds : 0);
                      }}
                      className="w-full text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Bathrooms
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={minBaths}
                      onChange={(e) => {
                        const newBaths = Number(e.target.value);
                        setMinBaths(newBaths >= 0 ? newBaths : 0);
                      }}
                      className="w-full text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => {
                      // Reset all filter states
                      setSearchValue("");
                      setSelectedType("all");
                      setPriceRange([0, 10000]);
                      setMinBeds(0);
                      setMinBaths(0);
                      setSelectedAmenities([]);
                      
                      // Clear applied filters
                      const resetFilters = {
                        search: "",
                        type: "all",
                        minPrice: 0,
                        maxPrice: 10000,
                        minBeds: 0,
                        minBaths: 0,
                      };
                      setAppliedFilters(resetFilters);
                      
                      // Remove from localStorage
                      localStorage.removeItem('propertyFilters');
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                  >
                    Reset Filters
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      // Apply current filter values
                      const newFilters = {
                        search: searchValue,
                        type: selectedType,
                        minPrice: priceRange[0],
                        maxPrice: priceRange[1],
                        minBeds,
                        minBaths,
                      };
                      setAppliedFilters(newFilters);
                      
                      // Save to localStorage
                      localStorage.setItem('propertyFilters', JSON.stringify(newFilters));
                      
                      // Close filter panel
                      setShowFilters(false);
                    }}
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      'Apply Filters'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {["recommended", "interested", "not-interested"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 min-w-[120px] py-4 px-4 text-center font-medium capitalize transition ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-tertiary"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span className="text-gray-700 font-medium">Loading properties...</span>
              </div>
            ) : (
              <p className="text-gray-700 font-medium">
                {properties.length} {properties.length === 1 ? "property" : "properties"} found
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                console.log("Sort by:", e.target.value); // Debug
                setSortBy(e.target.value);
              }}
              className="border border-gray-300 rounded-md p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recommended">Recommended</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              >
                <div onClick={() => setSelectedProperty(property)} className="block">
                  <div className="relative h-48 w-full">
                    <img
                      src={firstImage(property)}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-md text-sm font-bold text-primary">
                      €{property.price}/mo
                    </div>
                    {activeTab === "interested" && (
                      <div className="absolute bottom-0 inset-x-0 bg-primary text-white text-center py-1 text-sm font-medium">
                        Interested
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <Link href={`/properties/${property._id}`} className="block">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                      {property.name}
                    </h3>
                    <div className="flex items-center text-gray-500 mb-3">
                      <FaMapMarkerAlt className="mr-1 text-primary" />
                      <span className="text-sm line-clamp-1">
                        {property.propertyLocation.address}
                      </span>
                    </div>
                  </Link>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-3 text-sm">
                      <div className="flex items-center">
                        <FaBed className="mr-1 text-gray-500" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <FaBath className="mr-1 text-gray-500" />
                        <span>{property.bathrooms}</span>
                      </div>
                    </div>

                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {activeTab === "recommended" && (
                      <>
                        <button
                          onClick={async () => {
                            await setHouseInterest.mutateAsync({ houseId: property._id, status: "interested" });
                            await fetchProperties.mutateAsync({
                              search: appliedFilters.search,
                              type: appliedFilters.type,
                              minPrice: appliedFilters.minPrice,
                              maxPrice: appliedFilters.maxPrice,
                              minBeds: appliedFilters.minBeds,
                              minBaths: appliedFilters.minBaths,
                              status: activeTab,
                            });
                          }}
                          className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition flex items-center justify-center"
                        >
                          <FaHeart className="mr-2" />
                          Interested
                        </button>
                        <button
                          onClick={async () => {
                            await setHouseInterest.mutateAsync({ houseId: property._id, status: "not-interested" });
                            await fetchProperties.mutateAsync({
                              search: appliedFilters.search,
                              type: appliedFilters.type,
                              minPrice: appliedFilters.minPrice,
                              maxPrice: appliedFilters.maxPrice,
                              minBeds: appliedFilters.minBeds,
                              minBaths: appliedFilters.minBaths,
                              status: activeTab,
                            });
                          }}
                          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition flex items-center justify-center"
                        >
                          Not Interested
                        </button>
                      </>
                    )}
                    {activeTab === "interested" && (
                      <button
                        onClick={async () => {
                          await setHouseInterest.mutateAsync({ houseId: property._id, status: "not-interested" });
                          await fetchProperties.mutateAsync({
                            search: appliedFilters.search,
                            type: appliedFilters.type,
                            minPrice: appliedFilters.minPrice,
                            maxPrice: appliedFilters.maxPrice,
                            minBeds: appliedFilters.minBeds,
                            minBaths: appliedFilters.minBaths,
                            status: activeTab,
                          });
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition flex items-center justify-center"
                      >
                        Move to Not Interested
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16l2.879-2.879m0 0a3 3 0104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search filters or explore different locations
              to find more properties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
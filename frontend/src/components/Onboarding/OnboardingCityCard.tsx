'use client';

import { useMap } from "@/hooks";
import { CitySuggestion } from "@/types";
import { useEffect, useState } from "react";

interface CitySelectionCardProps {
    onSelectCity: (city: CitySuggestion) => void;
    onSkip?: () => void;
}


export function OnboardingCityCard({ onSelectCity, onSkip }: CitySelectionCardProps) {
    const {
        cityInput,
        setCityInput,
        citySuggestions,
        loading,
        handleCityChange,
        isGoogleMapsLoaded,
        error
    } = useMap();

    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (value: string) => {
        setCityInput(value);
        
        if (value.length >= 4) {
            handleCityChange(value);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleCitySelect = (city: CitySuggestion) => {
        onSelectCity(city);
        setCityInput(city.description);
        setShowSuggestions(false);
    };

    const handleCustomSubmit = () => {
        if (!cityInput.trim()) {
            return;
        }
        onSelectCity({ description: cityInput.trim(), place_id: "custom" });
    };

    return (
        <div className="flex flex-col items-center space-y-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Where are you looking to live?</h2>
            <p className="text-gray-600 text-center mb-6">
                Start typing your city to find and select it. We'll help you find roommates in your area.
            </p>
            
            <div className="relative w-full max-w-md">
                <div className="relative">
                    <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Enter your city..."
                        className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                        onFocus={() => {
                            if (cityInput.length >= 4) {
                                setShowSuggestions(true);
                            }
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                    />
                    
                    {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}

                {cityInput.length > 0 && cityInput.length < 4 && (
                    <p className="text-blue-500 text-sm mt-2">Type at least 4 characters to see city suggestions</p>
                )}

                {!isGoogleMapsLoaded && (
                    <p className="text-yellow-600 text-sm mt-2">
                        Loading city suggestions... Please wait a moment.
                    </p>
                )}

                {showSuggestions && citySuggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {citySuggestions.map((city: CitySuggestion, index) => (
                            <li
                                key={city.place_id || index}
                                onClick={() => handleCitySelect(city)}
                                className="px-4 py-3 cursor-pointer hover:bg-primary/10 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                                <div className="font-medium text-gray-900">{city.description}</div>
                            </li>
                        ))}
                    </ul>
                )}

                {showSuggestions && cityInput.length >= 4 && !loading && citySuggestions.length === 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                        <p className="text-gray-500 text-center">No cities found. Try a different search term.</p>
                    </div>
                )}

                <div className="flex justify-between mt-4 gap-3">
                    <button
                        onClick={handleCustomSubmit}
                        disabled={!cityInput.trim()}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Continue
                    </button>
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Skip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

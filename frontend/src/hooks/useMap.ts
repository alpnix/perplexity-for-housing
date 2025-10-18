import { CitySuggestion } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";

interface Location {
    lat: number;
    lng: number;
}

export function useMap() {
    const [cityInput, setCityInput] = useState<string>("");
    const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Google Maps when the script loads
    useEffect(() => {
        const checkGoogleMapsLoaded = () => {
            if (typeof window !== 'undefined' && window.google && window.google.maps) {
                setIsGoogleMapsLoaded(true);
                return true;
            }
            return false;
        };

        if (checkGoogleMapsLoaded()) {
            return;
        }

        const interval = setInterval(() => {
            if (checkGoogleMapsLoaded()) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Get user location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const handleCityChange = useCallback(async (input: string) => {
        setCityInput(input);
        setError("");
        
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (!isGoogleMapsLoaded) {
            setCitySuggestions([]);
            return;
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            const inputLength = input.trim().length;

            // Require 4+ characters to query Places
            if (inputLength < 4) {
                setCitySuggestions([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            
            try {
                const autocompleteService = new window.google.maps.places.AutocompleteService();
                
                const request: google.maps.places.AutocompletionRequest = {
                    input: input,
                    types: ['(cities)'],
                    componentRestrictions: { country: ['us', 'gb', 'nl', 'tr', 'de', 'fr'] },
                    ...(userLocation && {
                        locationBias: new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
                    })
                };

                autocompleteService.getPlacePredictions(
                    request,
                    (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                            const suggestions = predictions.map(prediction => ({
                                description: prediction.description,
                                place_id: prediction.place_id
                            }));
                            setCitySuggestions(suggestions);
                        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                            setCitySuggestions([]);
                        } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                            setError("Too many requests. Please wait a moment and try again.");
                            setCitySuggestions([]);
                        } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                            setError("City search is temporarily unavailable.");
                            setCitySuggestions([]);
                        } else {
                            console.error("Places Service Status:", status);
                            setCitySuggestions([]);
                        }
                        setLoading(false);
                    }
                );
            } catch (error) {
                console.error("Error fetching city suggestions:", error);
                setError("Failed to load city suggestions. Please try again.");
                setCitySuggestions([]);
                setLoading(false);
            }
        }, 250);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [isGoogleMapsLoaded, userLocation]);

    return {
        cityInput,
        setCityInput,
        citySuggestions,
        loading,
        handleCityChange,
        isGoogleMapsLoaded,
        error
    };
}

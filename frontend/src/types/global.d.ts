declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
            OVER_QUERY_LIMIT: string;
            REQUEST_DENIED: string;
            INVALID_REQUEST: string;
            UNKNOWN_ERROR: string;
          };
        };
        LatLng: new (lat: number, lng: number) => google.maps.LatLng;
      };
    };
  }
}

declare namespace google {
  namespace maps {
    namespace places {
      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
        types: string[];
      }

      interface AutocompletionRequest {
        input: string;
        types?: string[];
        componentRestrictions?: {
          country: string[];
        };
        locationBias?: google.maps.LatLng;
      }

      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      type PlacesServiceStatus = 
        | 'OK'
        | 'ZERO_RESULTS'
        | 'OVER_QUERY_LIMIT'
        | 'REQUEST_DENIED'
        | 'INVALID_REQUEST'
        | 'UNKNOWN_ERROR';
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
  }
}

export {};

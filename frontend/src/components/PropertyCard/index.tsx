import React from 'react';
import { MapPin, ExternalLink, Home } from 'lucide-react';

interface PropertyCardProps {
  title: string;
  location: string;
  price: string;
  description: string;
  amenities: string[];
  image_url?: string;
  source_url?: string;
}

// Property card with image
export const PropertyCardWithImage: React.FC<PropertyCardProps> = ({
  title,
  location,
  price,
  description,
  amenities,
  image_url,
  source_url
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <img 
          src={image_url} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden flex items-center justify-center h-full w-full">
          <Home className="h-12 w-12 text-gray-400" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="text-xl font-bold text-green-600 mb-3">{price}</div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{description}</p>

        {/* Amenities */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities:</h4>
          <div className="flex flex-wrap gap-1">
            {amenities.map((amenity, index) => (
              <span 
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Source Link */}
        {source_url && (
          <a 
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        )}
      </div>
    </div>
  );
};

// Property card without image
export const PropertyCardNoImage: React.FC<PropertyCardProps> = ({
  title,
  location,
  price,
  description,
  amenities,
  source_url
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Home className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
        <div className="text-xl font-bold text-green-600">{price}</div>
      </div>

      <p className="text-gray-700 text-sm mb-4">{description}</p>

      {/* Amenities */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities:</h4>
        <div className="flex flex-wrap gap-1">
          {amenities.map((amenity, index) => (
            <span 
              key={index}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Source Link */}
      {source_url && (
        <a 
          href={source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      )}
    </div>
  );
};

// Main PropertyCard component that chooses which variant to render
export const PropertyCard: React.FC<PropertyCardProps> = (props) => {
  const hasValidImage = props.image_url && props.image_url.trim() !== '';
  
  if (hasValidImage) {
    return <PropertyCardWithImage {...props} />;
  } else {
    return <PropertyCardNoImage {...props} />;
  }
};

// Legacy export for backward compatibility
export default PropertyCard;

import React from 'react';
import { User, MapPin, DollarSign } from 'lucide-react';

interface RoommateCardProps {
  name: string;
  age?: string;
  occupation: string;
  interests?: string[];
  budget?: string;
  preferred_location?: string;
  description: string;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({
  name,
  age,
  occupation,
  interests,
  budget,
  preferred_location,
  description
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-purple-200 p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            {age && (
              <span className="text-sm text-gray-500">({age})</span>
            )}
          </div>
          
          <div className="text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded mb-3 inline-block">
            {occupation}
          </div>

          <p className="text-gray-700 text-sm mb-3">{description}</p>

          {/* Budget and Location */}
          <div className="space-y-2 mb-3">
            {budget && (
              <div className="flex items-center text-gray-600 text-sm">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Budget: {budget}</span>
              </div>
            )}
            
            {preferred_location && (
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Preferred: {preferred_location}</span>
              </div>
            )}
          </div>

          {/* Interests */}
          {interests && interests.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Interests:</h4>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoommateCard;

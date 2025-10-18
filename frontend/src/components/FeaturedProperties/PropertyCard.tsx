import { Property } from '@/types';
import Link from 'next/link';
import React from 'react';
import { FaHeart, FaShareAlt, FaEnvelope, FaHome } from 'react-icons/fa';

interface PropertyCardProps {
  property: {
    id: string;
    image: string;
    owner: string;
    ownerAvatar: string;
    price: string;
    location: string;
    rooms: number;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
      <Link href={`/property/${property.id}`} aria-label={`View details of ${property.owner}'s property`} className="block">
        <img
          className="w-full h-80 object-cover rounded-lg"
          src={property.image}
          alt={`Property by ${property.owner}`}
        />
        <div className="absolute rounded-lg inset-0 bg-black bg-opacity-0 hover:bg-opacity-70 transition-opacity duration-300 flex flex-col justify-center items-center text-white opacity-0 hover:opacity-100">
          <h3 className="text-lg font-semibold">{property.location}</h3>
          <p className="text-sm">{property.price}</p>
          <p className="text-sm">{property.rooms} Rooms</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              aria-label="Rent Property"
              className="flex items-center bg-primary text-white px-3 py-1 rounded hover:bg-secondary transition-colors duration-300 text-xs"
            >
              <FaHome className="mr-1" /> Rent
            </button>
            <button
              aria-label="Like Property"
              className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors duration-300 text-xs"
            >
              <FaHeart className="mr-1" /> Like
            </button>
            <button
              aria-label="Share Property"
              className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors duration-300 text-xs"
            >
              <FaShareAlt className="mr-1" /> Share
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
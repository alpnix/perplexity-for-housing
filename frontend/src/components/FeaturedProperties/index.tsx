"use client"
import React from 'react';
import PropertyCard from './PropertyCard';
import StatCard from './StatCard';

import { FaHome, FaMoneyBillAlt, FaUser } from 'react-icons/fa';

const FeaturedProperties = () => {
  const properties = [
    {
      id: "1",
      image: '/assets/images/property1.jpg',
      owner: 'Murtaza Nikzad',
      ownerAvatar: '/assets/images/owner.jpg',
      price: '$1500',
      location: 'New York, NY',
      rooms: 3,
    },
    {
      id: "2",
      image: '/assets/images/property2.jpeg',
      owner: 'Murtaza Nikzad',
      ownerAvatar: '/assets/images/owner.jpg',
      price: '$2500',
      location: 'Los Angeles, CA',
      rooms: 2,
    },
    {
      id: "3",
      image: '/assets/images/property3.jpeg',
      owner: 'Murtaza Nikzad',
      ownerAvatar: '/assets/images/owner.jpg',
      price: '$3500',
      location: 'San Francisco, CA',
      rooms: 4,
    },
    {
      id: "4",
      image: '/assets/images/property1.jpg',
      owner: 'Murtaza Nikzad',
      ownerAvatar: '/assets/images/owner.jpg',
      price: '$2000',
      location: 'Houston, TX',
      rooms: 2,
    },
  ];

  const stats = [
    {
      "icon": FaMoneyBillAlt, 
      "label": "Capital Raised.",
      "value": "$10,000+"
    }, 
    {
      "icon": FaUser, 
      "label": "Satisfied Users.",
      "value": "520+"
    },
    {
      "icon": FaHome, 
      "label": "Available Properties.",
      "value": "20000+"
    }, 
  ]

  return (
    <section id={"properties"} className="px-4 py-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-primary mb-4 md:mb-0">
            Featured Properties
          </h2>
          <div className="container flex flex-col md:flex-row items-center md:items-start mt-4 md:mt-0 space-x-4">
            <div className="text-5xl">🏡</div>
            <p className="text-lg text-secondary text-center md:text-left">
              Browse our featured properties to find your next home! From solo spaces to roommate-ready rentals, GrotN brings you a curated selection of top listings. Dive in and see what’s waiting for you!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="flex justify-around items-center flex-wrap">
          {stats.map((stat, index) => (
          <StatCard
            key={index}
            Icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
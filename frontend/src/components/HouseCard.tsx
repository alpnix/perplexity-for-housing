"use client";

import React from 'react';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';

interface HouseCardProps {
  title: string;
  image: string;
  link?: string;
}

const HouseCard: React.FC<HouseCardProps> = ({ title, image, link }) => {
  if (link) {
    return (
      <Link href={link} className='border-2 border-dashed border-theme-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-theme-hover transition-colors'>
        <FaPlus className='text-4xl text-theme-hover mb-2' />
        <span className='text-lg text-theme-hover'>Add New House</span>
      </Link>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg overflow-hidden'>
      <img src={image} alt={title} className='w-full h-40 object-cover' />
      <div className='p-4'>
        <h3 className='text-xl font-semibold text-theme-text'>{title}</h3>
      </div>
    </div>
  );
}

export default HouseCard;
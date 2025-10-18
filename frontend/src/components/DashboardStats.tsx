"use client";

import React from 'react';
import { FaDollarSign, FaChartLine, FaHome, FaThumbsUp } from 'react-icons/fa';

interface Stats {
  assetValue: number;
  monthlyEarnings: number;
  houseViews: number;
  likesShares: number;
}

const DashboardStats: React.FC<{ stats: Stats }> = ({ stats }) => {
  const statsData = [
    { icon: <FaDollarSign className='text-4xl text-green-500 mr-4' />, value: `$${stats.assetValue}`, label: 'Asset Value' },
    { icon: <FaChartLine className='text-4xl text-yellow-500 mr-4' />, value: `$${stats.monthlyEarnings}`, label: 'Monthly Earnings' },
    { icon: <FaHome className='text-4xl text-indigo-500 mr-4' />, value: stats.houseViews, label: 'House Views' },
    { icon: <FaThumbsUp className='text-4xl text-pink-500 mr-4' />, value: stats.likesShares, label: 'Likes & Shares' },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {statsData.map((stat, index) => (
        <div key={index} className='bg-theme-100 shadow rounded-lg p-6 flex items-center'>
          {stat.icon}
          <div>
            <p className='text-2xl font-semibold text-theme-text'>{stat.value}</p>
            <p className='text-gray-600'>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardStats;
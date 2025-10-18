import Link from 'next/link';
import React from 'react';

const GetStarted: React.FC = () => {
  return (
    <div
      className="get-started relative bg-cover bg-center text-center text-white py-10"
      style={{
        backgroundImage: `url('assets/footer/get-started-background.jpeg')`, // Reference the public directory image
        backgroundSize: 'cover',
        backgroundPosition: 'center ', // Adjust the vertical position (50px higher)
        opacity: 0.95,
      }}
    >
      {/* Overlay for better visibility */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold mb-6">Get Started With GrotN!</h1>
        <div className="flex justify-center items-center gap-8 flex-wrap">
        <Link
        className="bg-primary px-5 py-2 text-white rounded-lg hover:bg-secondary"
        href='/sign-up'
        >
            Find Housing
        </Link>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;

"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { Link as ScrollLink }  from 'react-scroll';

const Menu = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Landing section is roughly the viewport height (100vh)
      const landingHeight = window.innerHeight;
      
      // Check if we're still in the landing section
      const inLandingSection = currentScrollY < landingHeight * 0.8;
      setIsAtTop(inLandingSection);
      
      // Show header only when scrolling up (or at the very top)
      if (currentScrollY === 0) {
        // Always show at the very top of the page
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsVisible(false);
      }
      // If scrollY === lastScrollY (no movement), maintain current visibility state
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`
        ${isAtTop ? 'relative' : 'fixed top-0 left-0 right-0 z-50'} 
        ${isAtTop ? 'bg-transparent' : 'bg-black/30 backdrop-blur-md shadow-lg'} 
        ${isVisible ? 'translate-y-0' : '-translate-y-full'} 
        transition-all duration-300 ease-in-out w-full
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav
        className="flex items-center justify-between"
        aria-label="Global"
        >
        <div className="flex items-center flex-shrink-0">
            <Link href="/">
                <span className="sr-only">GrotN</span>
                <img 
                  alt="logo" 
                  className="h-12 w-auto sm:h-14 object-contain" 
                  src={"/assets/images/logo.png"} 
                />
            </Link>
        </div>
        <div className="flex items-center space-x-6 md:space-x-8">
            <ScrollLink
                spy={true}
                smooth={true}
                duration={200}
                to={"properties"}
                className="font-medium text-white hover:text-gray-300 cursor-pointer transition-colors"
            >
                Properties
            </ScrollLink>
            <ScrollLink
                spy={true}
                smooth={true}
                duration={200}
                to={"features"}
                className="font-medium text-white hover:text-gray-300 cursor-pointer transition-colors"
            >
                Features
            </ScrollLink>
            <ScrollLink
                spy={true}
                smooth={true}
                duration={200}
                to={"about"}
                className="font-medium text-white hover:text-gray-300 cursor-pointer transition-colors"
            >
                About
            </ScrollLink>
            <Link
            href='/sign-in'
            className="font-semibold text-primary hover:text-secondary transition-colors"
            >
            Start Now!
            </Link>
        </div>
        </nav>
      </div>
    </div>
    );
};

export default Menu;

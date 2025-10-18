"use client"
import React, { useState, useEffect, useRef } from 'react';

interface StatCardProps {
  Icon: React.ElementType,
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ Icon, label, value }) => {
  const [animatedValue, setAnimatedValue] = useState<number>(0);
  const [isInView, setIsInView] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // Trigger when 50% of the element is in the viewport
    });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      const targetValue = parseInt(value.replace(/[^\d]/g, ''));
      let currentValue = 0;

      const interval = setInterval(() => {
        if (currentValue < targetValue) {
          currentValue += Math.ceil(targetValue / 30);
          setAnimatedValue(currentValue);
        } else {
          setAnimatedValue(targetValue);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isInView, value]);

  const formatNumber = (num: number) => {
    try {
      return num.toLocaleString();
    } catch {
      return String(num);
    }
  };

  return (
    <div
      className="text-center border border-gray-200 rounded-xl p-4 bg-white shadow-sm w-full sm:w-64"
      ref={cardRef}
    >
      <div className="flex items-center justify-center space-x-2">
        <span className="icon text-xl text-secondary">
          <Icon />
        </span>
        <div className="label text-lg text-secondary font-regular">
          {label}
        </div>
      </div>
      <div className="value text-3xl text-primary font-semibold mt-2">
        {value.includes('$') ? '$' : ''}
        {formatNumber(animatedValue)}{value.includes('+') ? '+' : ''}
      </div>
    </div>
  );
};

export default StatCard;
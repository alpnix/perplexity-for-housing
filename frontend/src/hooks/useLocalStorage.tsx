'use client';
import { useEffect, useState } from 'react';

const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((prop: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && storedValue === initialValue) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
  }, [key, initialValue]);

  const setValue = (value: T | ((prop: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;

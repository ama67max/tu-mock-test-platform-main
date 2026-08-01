import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          // Quota exceeded or storage unavailable — state still updates in memory.
        }
        return valueToStore;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore — nothing to clean up if storage isn't available.
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  // Keep state in sync if the same key changes in another tab/window.
  useEffect(() => {
    function handleStorageEvent(event) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setStoredValue(JSON.parse(event.newValue));
      } catch {
        // Foreign/corrupt value in that key — ignore rather than crash.
      }
    }

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
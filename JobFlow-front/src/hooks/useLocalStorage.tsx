import { useEffect, useState } from "react";

export default function useLocalStorage(key: string, defaultValue?: string) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    if (value === undefined) return;
    if (value === null) return localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}

import { useState, useEffect } from "react";
import { Device } from "../types/device";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/devices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDevices(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('Failed to fetch devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return { 
    devices, 
    // setDevices, 
    isLoading, 
    error,
    refreshDevices: fetchDevices 
  };
}

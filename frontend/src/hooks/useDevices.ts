import { useState, useEffect } from "react";
import { Device } from "../types/device";
import { API_BASE_URL } from "../constants/api";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/devices`);
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

import { useState, useEffect } from "react";
import { Device } from "../types/device";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>(() => {
    const savedDevices = localStorage.getItem('devices');
    return savedDevices ? JSON.parse(savedDevices) : [];
  });

  useEffect(() => {
    localStorage.setItem('devices', JSON.stringify(devices));
  }, [devices]);

  return { devices, setDevices };
}
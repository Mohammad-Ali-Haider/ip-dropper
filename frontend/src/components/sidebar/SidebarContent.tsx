import { useState, useEffect } from 'react';
import ListGroup from "../common/ListGroup";
import YourDeviceCard from "../device/YourDeviceCard";
import { PAGES } from "../../constants/navigation";
import { API_BASE_URL } from "../../constants/api";

interface SidebarContentProps {
  isReceiving: boolean;
  setIsReceiving: (value: boolean) => void;
  activeTab: number;
  setActiveTab: (index: number) => void;
}

function SidebarContent({
  isReceiving,
  setIsReceiving,
  activeTab,
  setActiveTab,
}: SidebarContentProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial state
  useEffect(() => {
    const fetchCurrentDevice = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/devices/current`);
        if (!response.ok) throw new Error('Failed to fetch device status');
        const device = await response.json();
        setIsReceiving(device.isReceiving);
      } catch (error) {
        console.error('Error fetching device status:', error);
      }
    };

    fetchCurrentDevice();
  }, [setIsReceiving]);

  const handleReceivingToggle = async () => {
    const newValue = !isReceiving;
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/devices/current/receiving`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isReceiving: newValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update receiving status: ${response.statusText}`);
      }

      const updatedDevice = await response.json();
      console.log('Receiving status updated:', updatedDevice);
      setIsReceiving(updatedDevice.isReceiving); // Use the server's response
    } catch (error) {
      console.error('Error updating receiving status:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to server');
      setIsReceiving(isReceiving); // Revert the toggle
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <h1 className="sidebar-title">
        <i className="fas fa-network-wired me-2"></i>
        IP Dropper
      </h1>
      <button
        className={`receiving-btn ${isReceiving ? "active" : ""}`}
        onClick={handleReceivingToggle}
        disabled={isUpdating}
      >
        <i className={`fas fa-${isUpdating ? 'spinner fa-spin' : 'wifi'}`}></i>
        {isUpdating ? 'Updating...' : `Receiving ${isReceiving ? 'ON' : 'OFF'}`}
      </button>
      <ListGroup
        items={PAGES}
        selectedItem={activeTab}
        onSelectItem={setActiveTab}
      />
      <YourDeviceCard />
    </>
  );
}

export default SidebarContent;

import { useEffect, useState } from "react";
import { websocketService } from "../services/websocketService";

/**
 * Custom hook to manage receiving state.
 * - Initializes receiving state from localStorage (default false)
 * - Resets receiving state to false on mount and notifies backend
 * - Persists state changes to localStorage
 * - Notifies backend on state changes
 * 
 * @returns [isReceiving, setIsReceiving]
 */
function useReceiving(): [boolean, (value: boolean) => void] {
  const [isReceiving, setIsReceiving] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem("app.isReceiving") ?? "false");
  });

  // On mount, reset receiving state to false and notify backend
  useEffect(() => {
    localStorage.setItem("app.isReceiving", "false");
    setIsReceiving(false);
  }, []);

  // Persist changes and notify backend
  useEffect(() => {
    localStorage.setItem("app.isReceiving", JSON.stringify(isReceiving));

    if (websocketService.getConnectionStatus()) {
      websocketService.send({
        type: "receiver",
        action: isReceiving ? "start" : "stop",
      });
    }
  }, [isReceiving]);

  return [isReceiving, setIsReceiving];
}

export default useReceiving;
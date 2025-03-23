import { useEffect } from 'react';
import { FileReceiver } from '../../../services/fileReceiver';

interface ReceivingButtonProps {
  isReceiving: boolean;
  onToggle: () => void;
  deviceIp: string;
}

export function ReceivingButton({ isReceiving, onToggle, deviceIp }: ReceivingButtonProps) {
  const fileReceiver = new FileReceiver();

  useEffect(() => {
    if (isReceiving) {
      fileReceiver.startReceiving(deviceIp)
        .catch(error => {
          console.error('Failed to start receiving:', error);
          onToggle(); // Turn off receiving mode on error
        });
    } else {
      fileReceiver.stopReceiving();
    }

    return () => {
      fileReceiver.stopReceiving();
    };
  }, [isReceiving, deviceIp]);

  return (
    <button
      className={`receiving-btn ${isReceiving ? "active" : ""}`}
      onClick={onToggle}
    >
      <i className="fas fa-wifi"></i>
      {`Receiving ${isReceiving ? 'ON' : 'OFF'}`}
    </button>
  );
}



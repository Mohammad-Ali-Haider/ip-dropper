interface ReceivingButtonProps {
  isReceiving: boolean;
  onToggle: () => void;
}

export function ReceivingButton({ isReceiving, onToggle }: ReceivingButtonProps) {
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

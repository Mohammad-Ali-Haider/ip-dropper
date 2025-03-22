interface Props {
  children: React.ReactNode;
  onClick: () => void;
}

function Button({ children, onClick }: Props) {
  return (
    <button className="add-device-btn mb-4" onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;

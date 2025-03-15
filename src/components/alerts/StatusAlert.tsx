import { Alert } from 'react-bootstrap';

interface Props {
  variant: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

function StatusAlert({ variant, message, onClose }: Props) {
  return (
    <Alert variant={variant} dismissible={!!onClose} onClose={onClose}>
      {message}
    </Alert>
  );
}

export default StatusAlert;
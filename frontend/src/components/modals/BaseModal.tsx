import { Modal } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
}

function BaseModal({
  show,
  onHide,
  title,
  children,
  centered = true,
  className = "",
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={centered}
      dialogClassName={className}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}

export default BaseModal;

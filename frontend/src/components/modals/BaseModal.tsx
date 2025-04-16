import { Modal } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
  size?: "sm" | "lg" | "xl";
  fullscreen?:
    | true
    | "sm-down"
    | "md-down"
    | "lg-down"
    | "xl-down"
    | "xxl-down";
}

function BaseModal({
  show,
  onHide,
  title,
  children,
  centered = true,
  className = "",
  size = "lg",
  fullscreen,
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={centered}
      dialogClassName={className}
      size={size}
      fullscreen={fullscreen}
      backdropClassName="modal-backdrop"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}

export default BaseModal;

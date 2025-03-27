import BaseModal from "./BaseModal";

interface Props {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  itemName: string;
  title?: string;
}

function ConfirmationModal({ show, onHide, onConfirm, itemName, title = "Confirm Delete" }: Props) {
  return (
    <BaseModal show={show} onHide={onHide} title={title}>
      <div>
        <p>Are you sure you want to delete {itemName}? This action cannot be undone.</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onHide}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export default ConfirmationModal;

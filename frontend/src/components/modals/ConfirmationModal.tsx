import BaseModal from "./BaseModal";

interface Props {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  itemName: string;
}

function ConfirmationModal({ show, onHide, onConfirm, itemName }: Props) {
  return (
    <BaseModal show={show} onHide={onHide} title="Confirm Delete">
      <div>
        <p>Are you sure you want to delete device "{itemName}"?</p>
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

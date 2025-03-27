import BaseModal from "./BaseModal";

interface Props {
  show: boolean;
  onHide: () => void;
  onAccept: () => void;
  onReject: () => void;
  fileName: string;
  size: number;
  sourceIp: string;
}

function FileTransferConfirmModal({ 
  show, 
  onHide, 
  onAccept, 
  onReject, 
  fileName, 
  size, 
  sourceIp 
}: Props) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <BaseModal show={show} onHide={onHide} title="Incoming File Transfer">
      <div>
        <p>Would you like to accept the following file?</p>
        <div className="mb-3">
          <strong>File:</strong> {fileName}<br />
          <strong>Size:</strong> {formatSize(size)}<br />
          <strong>From:</strong> {sourceIp}
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onReject}>
            Reject
          </button>
          <button className="btn btn-primary" onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export default FileTransferConfirmModal;
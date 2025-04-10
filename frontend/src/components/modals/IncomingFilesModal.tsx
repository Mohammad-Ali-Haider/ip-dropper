import BaseModal from "./BaseModal";
import "../../styles/IncomingFilesModal.css";

interface IncomingFile {
  fileName: string;
  fileSize: number;
  downloadUrl: string;
}

interface Props {
  show: boolean;
  files: IncomingFile[];
  onAccept: (file: IncomingFile) => void;
  onReject: (file: IncomingFile) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onHide: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function IncomingFilesModal({ show, files, onAccept, onReject, onAcceptAll, onRejectAll, onHide }: Props) {
  return (
    <BaseModal show={show} onHide={onHide} title="Incoming Files">
      {files.length === 0 ? (
        <p>No incoming files.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, maxHeight: "300px", overflowY: "auto" }}>
            {files.map((file, idx) => (
              <li key={idx} className="incoming-file-item">
                <div className="incoming-file-info">
                  <div><strong>{file.fileName}</strong></div>
                  <div>Size: {formatFileSize(file.fileSize)}</div>
                </div>
                <div className="incoming-file-buttons">
                  <button
                    className="accept-btn"
                    onClick={() => onAccept(file)}
                    title="Accept"
                  >
                    ✓
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => onReject(file)}
                    title="Reject"
                  >
                    ✗
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onRejectAll}
              style={{ marginRight: "0.5rem" }}
            >
              Reject All
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={onAcceptAll}
            >
              Accept All
            </button>
          </div>
        </>
      )}
    </BaseModal>
  );
}

export default IncomingFilesModal;
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { websocketService } from "../services/websocketService";
import "../styles/Received.css";

interface FileInfo {
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  timestamp: Date;
}

interface TransferGroup {
  sourceDevice: {
    name: string;
    ipAddress: string;
  };
  timestamp: Date;
  files: FileInfo[];
}

function Received() {
  const [transferGroups, setTransferGroups] = useState<TransferGroup[]>(() => {
    const saved = localStorage.getItem("received-transfers");
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((group: any) => ({
        ...group,
        timestamp: new Date(group.timestamp),
        files: group.files.map((file: any) => ({
          ...file,
          timestamp: new Date(file.timestamp),
        })),
        isExpanded: false,
      }));
    } catch (error) {
      console.error("Error parsing saved transfers:", error);
      return [];
    }
  });
  const [selectedGroup, setSelectedGroup] = useState<TransferGroup | null>(
    null
  );

  useEffect(() => {
    const handleFileAvailable = (event: any) => {
      if (event.type === "fileAvailable") {
        const newFile: FileInfo = {
          fileName: event.fileName,
          fileSize: event.fileSize,
          downloadUrl: event.downloadUrl,
          timestamp: new Date(),
        };

        setTransferGroups((prev) => {
          const now = new Date();
          const recentGroupIndex = prev.findIndex(
            (group) =>
              group.sourceDevice.ipAddress === event.sourceDevice.ipAddress &&
              now.getTime() - group.timestamp.getTime() < 5000
          );

          let updated;
          if (recentGroupIndex !== -1) {
            updated = [...prev];
            updated[recentGroupIndex] = {
              ...updated[recentGroupIndex],
              files: [...updated[recentGroupIndex].files, newFile],
            };
          } else {
            updated = [
              {
                sourceDevice: {
                  name: event.sourceDevice.name,
                  ipAddress: event.sourceDevice.ipAddress,
                },
                timestamp: new Date(),
                files: [newFile],
                isExpanded: false,
              },
              ...prev,
            ];
          }

          try {
            localStorage.setItem("received-transfers", JSON.stringify(updated));
          } catch (error) {
            console.error("Error saving to localStorage:", error);
          }

          return updated;
        });
      }
    };

    websocketService.addEventListener(handleFileAvailable);
    return () => websocketService.removeEventListener(handleFileAvailable);
  }, []);

  const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDetailedTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(date);
  };

  const deleteTransferGroup = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding when clicking delete
    setTransferGroups((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem("received-transfers", JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      return updated;
    });
  };

  return (
    <div className="received-container">
      {transferGroups.length === 0 ? (
        <div className="received-empty">
          <i className="fas fa-inbox fa-3x"></i>
          <p>No received files yet</p>
        </div>
      ) : (
        transferGroups.map((group, index) => (
          <div
            key={`${group.sourceDevice.ipAddress}-${group.timestamp.getTime()}`}
            className="list-item-card"
          >
            <div className="item-left" onClick={() => setSelectedGroup(group)}>
              <div className="item-timestamp">
                <i className="fas fa-clock"></i>
                {formatTimestamp(group.timestamp)}
              </div>
              <div className="item-brief">
                <span className="file-count">
                  <i className="fas fa-file"></i>
                  {group.files.length} file{group.files.length !== 1 ? "s" : ""}{" "}
                  from <strong>{group.sourceDevice.name}</strong>
                </span>
              </div>
            </div>
            <div className="item-right">
              <button
                className="info-btn"
                onClick={() => setSelectedGroup(group)}
                title="View details"
              >
                <i className="fas fa-info-circle"></i>
              </button>
              <button
                className="delete-history-btn"
                onClick={(e) => deleteTransferGroup(index, e)}
                title="Delete this record"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}

      <Modal
        show={selectedGroup !== null}
        onHide={() => setSelectedGroup(null)}
        centered
        className="received-detail-modal"
      >
        {selectedGroup && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Received Files</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="received-detail-content">
                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-desktop"></i>
                    <span>Source Device</span>
                  </div>
                  <div className="detail-value">
                    {selectedGroup.sourceDevice.name} (
                    {selectedGroup.sourceDevice.ipAddress})
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-clock"></i>
                    <span>Timestamp</span>
                  </div>
                  <div className="detail-value">
                    {formatDetailedTimestamp(selectedGroup.timestamp)}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-file"></i>
                    <span>Files</span>
                  </div>
                  <div className="files-list">
                    {selectedGroup.files.map((file) => (
                      <div
                        key={`${file.fileName}-${file.timestamp.getTime()}`}
                        className="file-item"
                      >
                        <div className="file-info">
                          <span className="file-name">{file.fileName}</span>
                          <span className="file-size">
                            {formatFileSize(file.fileSize)}
                          </span>
                        </div>
                        <a
                          href={file.downloadUrl}
                          className="download-link"
                          download
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-download"></i>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Received;

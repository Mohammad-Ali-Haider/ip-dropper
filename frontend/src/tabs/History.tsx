import { useState } from "react";
import { Modal } from "react-bootstrap";
import "../styles/History.css";
import { TransferRecord } from "../types/history";

const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatDetailedTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  }).format(date);
};

const HistoryItem = ({ record, onClick, onDelete }: { 
  record: TransferRecord; 
  onClick: () => void;
  onDelete: (id: string) => void;
}) => {
  const fileCount = record.files.length;
  const deviceCount = record.targetDevices.length;
  
  // Get the first device name for display
  const primaryDevice = record.targetDevices[0];
  const hasMultipleDevices = deviceCount > 1;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent item click when clicking delete
    onDelete(record.id);
  };

  return (
    <div className="list-item-card">
      <div className="item-left" onClick={onClick}>
        <div className="item-timestamp">
          <i className="fas fa-clock"></i>
          {formatTimestamp(record.timestamp)}
        </div>
        <div className="item-brief">
          <span className="file-count">
            <i className="fas fa-file"></i>
            {fileCount} file{fileCount !== 1 ? 's' : ''} to{' '}
            <strong>{primaryDevice.name}</strong>
            {hasMultipleDevices && ` + ${deviceCount - 1} other${deviceCount > 2 ? 's' : ''}`}
          </span>
        </div>
      </div>
      <div className="item-right">
        <button 
          className="info-btn" 
          onClick={onClick}
          title="View details"
        >
          <i className="fas fa-info-circle"></i>
        </button>
        <button 
          className="delete-history-btn" 
          onClick={handleDelete}
          title="Delete this record"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

function History() {
  const [history, setHistory] = useState<TransferRecord[]>(() => {
    const saved = localStorage.getItem("transfer-history");
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((record: any) => ({
        ...record,
        id: record.id || `legacy-${new Date().getTime()}-${Math.random()}`,  // Ensure old records have IDs
        timestamp: new Date(record.timestamp)
      }));
    } catch (error) {
      console.error('Error parsing transfer history:', error);
      return [];
    }
  });

  const [selectedRecord, setSelectedRecord] = useState<TransferRecord | null>(null);

  const handleDelete = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(record => record.id !== id);
      localStorage.setItem('transfer-history', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="history-container">
      {history.length === 0 ? (
        <div className="history-empty">
          <i className="fas fa-history fa-3x"></i>
          <p>No transfer history available</p>
        </div>
      ) : (
        <>
          {history.map((record) => (
            <HistoryItem 
              key={record.id} 
              record={record} 
              onClick={() => setSelectedRecord(record)}
              onDelete={handleDelete}
            />
          ))}
        </>
      )}

      <Modal
        show={selectedRecord !== null}
        onHide={() => setSelectedRecord(null)}
        centered
        className="history-detail-modal"
      >
        {selectedRecord && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Transfer Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="history-detail-content">
                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-clock"></i>
                    <span>Timestamp</span>
                  </div>
                  <div className="detail-value">
                    {formatDetailedTimestamp(selectedRecord.timestamp)}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-file"></i>
                    <span>Files</span>
                  </div>
                  <ul className="detail-list">
                    {selectedRecord.files.map(file => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-desktop"></i>
                    <span>Target Devices</span>
                  </div>
                  <ul className="detail-list">
                    {selectedRecord.targetDevices.map(device => (
                      <li key={device.ipaddress}>
                        {device.name} ({device.ipaddress})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-info-circle"></i>
                    <span>Status</span>
                  </div>
                  <div className={`detail-status status-${selectedRecord.status}`}>
                    {selectedRecord.status}
                    {selectedRecord.error && (
                      <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i>
                        {selectedRecord.error}
                      </div>
                    )}
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

export default History;

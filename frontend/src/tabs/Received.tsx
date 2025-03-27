import { useState, useEffect } from 'react';
import { websocketService } from '../services/websocketService';
import '../styles/Received.css';

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
  isExpanded: boolean;
}

function Received() {
  const [transferGroups, setTransferGroups] = useState<TransferGroup[]>(() => {
    const saved = localStorage.getItem('received-transfers');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((group: any) => ({
        ...group,
        timestamp: new Date(group.timestamp),
        files: group.files.map((file: any) => ({
          ...file,
          timestamp: new Date(file.timestamp)
        })),
        isExpanded: false
      }));
    } catch (error) {
      console.error('Error parsing saved transfers:', error);
      return [];
    }
  });

  useEffect(() => {
    const handleFileAvailable = (event: any) => {
      if (event.type === 'fileAvailable') {
        const newFile: FileInfo = {
          fileName: event.fileName,
          fileSize: event.fileSize,
          downloadUrl: event.downloadUrl,
          timestamp: new Date()
        };

        setTransferGroups(prev => {
          const now = new Date();
          const recentGroupIndex = prev.findIndex(group => 
            group.sourceDevice.ipAddress === event.sourceDevice.ipAddress &&
            (now.getTime() - group.timestamp.getTime()) < 5000
          );

          let updated;
          if (recentGroupIndex !== -1) {
            updated = [...prev];
            updated[recentGroupIndex] = {
              ...updated[recentGroupIndex],
              files: [...updated[recentGroupIndex].files, newFile]
            };
          } else {
            updated = [{
              sourceDevice: {
                name: event.sourceDevice.name,
                ipAddress: event.sourceDevice.ipAddress
              },
              timestamp: new Date(),
              files: [newFile],
              isExpanded: false
            }, ...prev];
          }

          try {
            localStorage.setItem('received-transfers', JSON.stringify(updated));
          } catch (error) {
            console.error('Error saving to localStorage:', error);
          }

          return updated;
        });
      }
    };

    websocketService.addEventListener(handleFileAvailable);
    return () => websocketService.removeEventListener(handleFileAvailable);
  }, []);

  const toggleExpand = (index: number) => {
    setTransferGroups(prev => 
      prev.map((group, i) => 
        i === index ? { ...group, isExpanded: !group.isExpanded } : group
      )
    );
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

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

  const deleteTransferGroup = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding when clicking delete
    setTransferGroups(prev => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem('received-transfers', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      return updated;
    });
  };

  if (transferGroups.length === 0) {
    return (
      <div className="received-empty">
        <i className="fas fa-inbox fa-3x"></i>
        <p>No received files yet</p>
      </div>
    );
  }

  return (
    <div className="received-container">
      {transferGroups.map((group, index) => (
        <div 
          key={`${group.sourceDevice.ipAddress}-${group.timestamp.getTime()}`}
          className={`transfer-group ${group.isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleExpand(index)}
        >
          <div className="transfer-group-header">
            <div className="source-info">
              <i className="fas fa-desktop"></i>
              <span className="device-name">{group.sourceDevice.name}</span>
              <span className="device-ip">({group.sourceDevice.ipAddress})</span>
            </div>
            <div className="transfer-meta">
              <span className="timestamp">{formatTimestamp(group.timestamp)}</span>
              <span className="file-count">
                {group.files.length} file{group.files.length !== 1 ? 's' : ''}
              </span>
              <button 
                className="delete-group-btn"
                onClick={(e) => deleteTransferGroup(index, e)}
                title="Delete transfer group"
              >
                <i className="fas fa-trash"></i>
              </button>
              <i className={`fas fa-chevron-${group.isExpanded ? 'up' : 'down'}`}></i>
            </div>
          </div>
          
          {group.isExpanded && (
            <div className="transfer-details">
              {group.files.map(file => (
                <div 
                  key={`${file.fileName}-${file.timestamp.getTime()}`}
                  className="file-item"
                >
                  <div className="file-info">
                    <i className="fas fa-file"></i>
                    <span className="file-name">{file.fileName}</span>
                    <span className="file-size">{formatFileSize(file.fileSize)}</span>
                  </div>
                  <div className="file-actions">
                    <a 
                      href={`${file.downloadUrl}`}
                      className="download-link"
                      onClick={(e) => e.stopPropagation()}
                      download
                    >
                      <i className="fas fa-download"></i>
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Received;

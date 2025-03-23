import BaseModal from "../modals/BaseModal";
import { useState } from "react";
import "./NetworkInterfacesModal.css";

interface NetworkInterface {
  name: string;
  ipv4?: string;
  ipv6?: string;
  isInternal?: boolean;
}

interface Props {
  show: boolean;
  onHide: () => void;
  interfaces: NetworkInterface[];
}

function NetworkInterfacesModal({ show, onHide, interfaces }: Props) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const sortedInterfaces = [...interfaces].sort((a, b) => {
    // Sort internal interfaces last
    if (a.isInternal && !b.isInternal) return 1;
    if (!a.isInternal && b.isInternal) return -1;
    return a.name.localeCompare(b.name);
  });

  return (
    <BaseModal show={show} onHide={onHide} title="Network Interfaces">
      <div className="network-interfaces-list">
        {sortedInterfaces.length === 0 ? (
          <div className="no-interfaces">
            <p>No network interfaces found</p>
          </div>
        ) : (
          sortedInterfaces.map((iface, index) => (
            <div 
              key={index} 
              className={`interface-item ${iface.isInternal ? 'internal' : ''}`}
            >
              <div className="interface-header">
                <h6 className="interface-name">
                  {iface.name}
                  {iface.isInternal && (
                    <span className="internal-badge">Internal</span>
                  )}
                </h6>
              </div>
              
              <div className="interface-addresses">
                {iface.ipv4 && (
                  <div 
                    className={`interface-address ${copiedAddress === iface.ipv4 ? 'copied' : ''}`}
                    onClick={() => handleCopyAddress(iface.ipv4!)}
                  >
                    <div className="address-content">
                      <span className="address-label">IPv4</span>
                      <code className="address-value">{iface.ipv4}</code>
                    </div>
                    <div className="copy-indicator">
                      <i className="fas fa-copy"></i>
                      {copiedAddress === iface.ipv4 && (
                        <span className="copied-tooltip">Copied!</span>
                      )}
                    </div>
                  </div>
                )}
                
                {iface.ipv6 && (
                  <div 
                    className={`interface-address ${copiedAddress === iface.ipv6 ? 'copied' : ''}`}
                    onClick={() => handleCopyAddress(iface.ipv6!)}
                  >
                    <div className="address-content">
                      <span className="address-label">IPv6</span>
                      <code className="address-value">{iface.ipv6}</code>
                    </div>
                    <div className="copy-indicator">
                      <i className="fas fa-copy"></i>
                      {copiedAddress === iface.ipv6 && (
                        <span className="copied-tooltip">Copied!</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </BaseModal>
  );
}

export default NetworkInterfacesModal;


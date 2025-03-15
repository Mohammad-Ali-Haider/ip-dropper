import { Form } from 'react-bootstrap';
import { Device } from '../../tabs/Devices';

interface Props {
  name: string;
  setName: (name: string) => void;
  ipaddress: string;
  setIpaddress: (ip: string) => void;
  type: Device['type'];
  setType: (type: Device['type']) => void;
  error?: string | null;
}

function DeviceForm({
  name,
  setName,
  ipaddress,
  setIpaddress,
  type,
  setType,
  error
}: Props) {
  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter device name"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>IP Address</Form.Label>
        <Form.Control
          type="text"
          value={ipaddress}
          onChange={(e) => setIpaddress(e.target.value)}
          placeholder="Enter IP address"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Type</Form.Label>
        <Form.Select
          value={type}
          onChange={(e) => setType(e.target.value as Device['type'])}
        >
          <option value="windows">Windows</option>
          <option value="mac">Mac</option>
          <option value="linux">Linux</option>
        </Form.Select>
      </Form.Group>
    </>
  );
}

export default DeviceForm;
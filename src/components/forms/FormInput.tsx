import { Form } from "react-bootstrap";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function FormInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text" 
}: FormInputProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Form.Group>
  );
}

export default FormInput;
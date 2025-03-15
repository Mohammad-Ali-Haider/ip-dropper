import { Form as BootstrapForm } from "react-bootstrap";

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  actions?: React.ReactNode;
}

function Form({ children, onSubmit, actions }: FormProps) {
  return (
    <BootstrapForm onSubmit={onSubmit}>
      {children}
      {actions && (
        <div className="d-flex justify-content-end gap-2">
          {actions}
        </div>
      )}
    </BootstrapForm>
  );
}

export default Form;
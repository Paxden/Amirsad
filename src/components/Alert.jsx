
import { Alert as BootstrapAlert } from "react-bootstrap";

const Alert = ({ variant, message, onClose }) => {
  if (!message) return null;

  return (
    <BootstrapAlert
      variant={variant}
      onClose={onClose}
      dismissible={!!onClose}
      className="animate__animated animate__fadeIn"
    >
      {message}
    </BootstrapAlert>
  );
};

export default Alert;

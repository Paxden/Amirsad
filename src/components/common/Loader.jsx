
import { Spinner } from "react-bootstrap";

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="loading-spinner mb-3"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-5">
      <Spinner animation="border" variant="warning" />
    </div>
  );
};

export default Loader;

// pages/VerifyEmail.jsx
import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from "../../api/axios";


const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage(response.data.message);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed');
      }
    };
    
    verifyEmail();
  }, [token]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="text-center mb-0">Email Verification</h3>
            </div>
            
            <div className="card-body p-4 text-center">
              {status === 'verifying' && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Verifying...</span>
                  </div>
                  <p>Verifying your email address...</p>
                </>
              )}
              
              {status === 'success' && (
                <>
                  <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                  <h4 className="text-success">Verification Successful!</h4>
                  <p className="mt-3">{message}</p>
                  <Link to="/login" className="btn btn-primary mt-3">
                    Proceed to Login
                  </Link>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <i className="bi bi-x-circle-fill text-danger fs-1 mb-3"></i>
                  <h4 className="text-danger">Verification Failed</h4>
                  <p className="mt-3">{message}</p>
                  <Link to="/resend-verification" className="btn btn-primary mt-3">
                    Resend Verification Email
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
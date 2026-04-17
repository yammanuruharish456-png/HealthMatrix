import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { promptGoogleSignIn } from '../utils/googleSignIn';
import './Auth.css';

const Login = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/patient-login-otp', { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/patient-verify-otp', { email, otp });
      login(res.data.token, res.data.user);
      toast.success('Login successful!');
      navigate('/patient-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const credential = await promptGoogleSignIn();
      const res = await axios.post('/api/auth/google-login', {
        credential,
        role: 'patient'
      });

      login(res.data.token, res.data.user);
      toast.success('Google Sign-In successful!');
      navigate('/patient-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/patient-login-otp', { email });
      toast.success('OTP resent successfully!');
      setOtp('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Patient Login</h2>
          <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>
            {step === 1 ? 'Enter your email to receive OTP' : 'Enter the OTP sent to your email'}
          </p>
          
          {step === 1 ? (
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <div className="auth-divider">or</div>
              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.99 11.99 0 001 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11.96 11.96 0 0012 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Connecting Google...' : 'Continue with Google'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{background: '#f5f5f5', cursor: 'not-allowed'}}
                />
              </div>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  disabled={loading}
                  style={{fontSize: '20px', letterSpacing: '5px', textAlign: 'center'}}
                />
                <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                  OTP is valid for 10 minutes
                </p>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <div style={{marginTop: '15px', textAlign: 'center'}}>
                <button 
                  type="button" 
                  onClick={handleResendOTP} 
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0066cc',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Resend OTP
                </button>
                <span style={{margin: '0 10px', color: '#ccc'}}>|</span>
                <button 
                  type="button" 
                  onClick={() => { setStep(1); setOtp(''); }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0066cc',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px'
                  }}
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
          
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
          <p className="auth-link-row">
            <Link to="/doctor-login">Doctor</Link> | <Link to="/admin-login">Admin</Link> | <Link to="/receptionist-login">Receptionist</Link> | <Link to="/nurse-login">Nurse</Link> | <Link to="/lab-technician-login">Lab Technician</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

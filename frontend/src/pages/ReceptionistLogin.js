import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { promptGoogleSignIn } from '../utils/googleSignIn';
import './Auth.css';

const ReceptionistLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.user.role !== 'receptionist') {
        toast.error('Access denied. Receptionist credentials required.');
        return;
      }

      login(res.data.token, res.data.user);
      toast.success('Login successful!');
      navigate('/receptionist-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const credential = await promptGoogleSignIn();
      const res = await axios.post('/api/auth/google-login', {
        credential,
        role: 'receptionist'
      });

      login(res.data.token, res.data.user);
      toast.success('Receptionist Google Sign-In successful!');
      navigate('/receptionist-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Receptionist Login</h2>
          <p className="auth-subtitle">Front Desk Portal</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary">Login</button>
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
          <p className="auth-footer">
            Don't have an account? <Link to="/receptionist-register">Register here</Link>
          </p>
          <p className="auth-link-row">
            <Link to="/login">Patient</Link> | <Link to="/doctor-login">Doctor</Link> | <Link to="/admin-login">Admin</Link> | <Link to="/nurse-login">Nurse</Link> | <Link to="/lab-technician-login">Lab Technician</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistLogin;

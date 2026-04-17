import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    adminCode: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Admin secret code verification
    if (formData.adminCode !== 'AMEDIC-ADMIN-2024') {
      toast.error('Invalid admin authorization code');
      return;
    }

    try {
      const adminData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'admin'
      };

      await axios.post('/api/auth/register', adminData);
      toast.success('Admin account created successfully!');
      navigate('/admin-login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Admin Registration</h2>
          <p className="auth-subtitle">Hospital Administration Account</p>
          
          <div className="warning-box">
            <p><strong>⚠️ Restricted Access:</strong> Admin registration requires authorization code.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Admin Authorization Code</label>
              <input
                type="password"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                placeholder="Enter admin authorization code"
                required
              />
              <small>Contact hospital management for authorization code</small>
            </div>

            <button type="submit" className="btn-primary">Create Admin Account</button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/admin-login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';

const LabTechnicianRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    department: 'Laboratory',
    qualification: '',
    experience: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const qualificationArray = formData.qualification.split(',').map(q => q.trim());
      await axios.post('/api/auth/staff-register', {
        ...formData,
        role: 'lab_technician',
        qualification: qualificationArray,
        experience: parseInt(formData.experience)
      });
      toast.success('Registration submitted! Please wait for admin verification.');
      navigate('/lab-technician-login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card large">
          <h2>Lab Technician Registration</h2>
          <p className="auth-subtitle">Join Our Laboratory Team</p>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Employee ID *</label>
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-LAB-001" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Qualifications (comma separated) *</label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="B.Sc MLT, DMLT" required />
            </div>
            <div className="form-group">
              <label>Experience (years) *</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary">Register</button>
          </form>
          <p className="auth-footer">
            Already registered? <Link to="/lab-technician-login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabTechnicianRegister;

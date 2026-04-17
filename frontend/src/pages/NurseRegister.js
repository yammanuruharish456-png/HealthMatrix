import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';

const NurseRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    department: 'Nursing',
    qualification: '',
    experience: '',
    shift: 'morning'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const qualificationArray = formData.qualification
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean);

      await axios.post('/api/auth/staff-register', {
        ...formData,
        role: 'nurse',
        qualification: qualificationArray,
        experience: parseInt(formData.experience, 10)
      });

      toast.success('Nurse registration submitted! Please wait for admin verification.');
      navigate('/nurse-login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card large">
          <h2>Nurse Registration</h2>
          <p className="auth-subtitle">Join Our Nursing Care Team</p>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Employee ID *</label>
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-NUR-001" required />
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
              <div className="form-group">
                <label>Shift *</label>
                <select name="shift" value={formData.shift} onChange={handleChange} required>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Qualifications (comma separated) *</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="B.Sc Nursing, ICU Certification"
                required
              />
            </div>
            <div className="form-group">
              <label>Experience (years) *</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary">Register</button>
          </form>
          <p className="auth-footer">
            Already registered? <Link to="/nurse-login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NurseRegister;

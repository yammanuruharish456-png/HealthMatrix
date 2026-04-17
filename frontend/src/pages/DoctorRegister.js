import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Auth.css';

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    nmcRegistrationNumber: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    about: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const qualificationArray = formData.qualification.split(',').map(q => q.trim());
      
      const doctorData = {
        ...formData,
        qualification: qualificationArray,
        experience: parseInt(formData.experience),
        consultationFee: parseInt(formData.consultationFee),
        role: 'doctor',
        isVerified: false // Pending admin verification
      };

      await axios.post('/api/auth/doctor-register', doctorData);
      toast.success('Registration submitted! Please wait for admin verification.');
      navigate('/doctor-login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card large-card">
          <h2>Doctor Registration</h2>
          <p className="auth-subtitle">Join Health Matrix Hospital Medical Team</p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0123"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>NMC Registration Number *</label>
                <input
                  type="text"
                  name="nmcRegistrationNumber"
                  value={formData.nmcRegistrationNumber}
                  onChange={handleChange}
                  placeholder="Enter your NMC registration number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Pulmonology">Pulmonology</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Qualifications * (comma separated)</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="MD, MBBS, Fellowship in Cardiology"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience *</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Consultation Fee ($) *</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>About Yourself *</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows="4"
                placeholder="Brief description about your expertise and experience..."
                required
              />
            </div>

            <button type="submit" className="btn-primary">Submit Registration</button>
          </form>

          <p className="auth-footer">
            Already registered? <Link to="/doctor-login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;

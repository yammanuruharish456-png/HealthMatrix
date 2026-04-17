import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Appointment.css';

const Appointment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    timeSlot: { startTime: '', endTime: '' },
    specialty: '',
    reasonForVisit: '',
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: ''
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }
    fetchDoctors();
  }, [user, navigate]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/doctors');
      setDoctors(res.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startTime' || name === 'endTime') {
      setFormData({
        ...formData,
        timeSlot: { ...formData.timeSlot, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/appointments', formData);
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  return (
    <div className="appointment-page">
      <div className="page-header">
        <div className="container">
          <h1>Book an Appointment</h1>
          <p>Schedule your visit with our expert doctors</p>
        </div>
      </div>

      <div className="container">
        <div className="appointment-form-container">
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <select name="specialty" value={formData.specialty} onChange={handleChange} required>
                  <option value="">Select Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Select Doctor</label>
              <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Appointment Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select name="startTime" value={formData.timeSlot.startTime} onChange={handleChange} required>
                  <option value="">Select Time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Visit</label>
              <textarea
                name="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-primary">Book Appointment</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointment;

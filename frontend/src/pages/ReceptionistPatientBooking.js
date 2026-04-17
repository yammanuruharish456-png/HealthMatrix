import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ReceptionistPatientBooking.css';

const ReceptionistPatientBooking = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('register');
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Patient Registration Form
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    city: '',
    email: ''
  });

  // Appointment Booking Form
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: '',
    reasonForVisit: '',
    specialty: ''
  });

  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/receptionist/available-doctors');
      setDoctors(res.data.doctors);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  };

  const handlePatientFormChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const handleAppointmentFormChange = (e) => {
    setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value });
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/receptionist/register-patient', patientForm);
      setRegisteredPatient(res.data.patient);
      setAppointmentForm({ ...appointmentForm, patientId: res.data.patient.id });
      toast.success('Patient registered successfully');
      setPatientForm({ name: '', phone: '', city: '', email: '' });
      setActiveTab('book');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSlots = async () => {
    if (!appointmentForm.doctorId || !appointmentForm.appointmentDate) {
      toast.error('Please select doctor and date');
      return;
    }

    try {
      const res = await axios.get(
        `/api/schedules/available-slots/${appointmentForm.doctorId}/${appointmentForm.appointmentDate}`
      );
      setAvailableSlots(res.data.slots);
      if (res.data.slots.length === 0) {
        toast.info('No available slots for this date');
      }
    } catch (error) {
      toast.error('Failed to fetch available slots');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedDoctor = doctors.find(d => d.id === appointmentForm.doctorId);
      const res = await axios.post('/api/receptionist/book-appointment', {
        ...appointmentForm,
        specialty: selectedDoctor?.specialization
      });
      toast.success('Appointment booked successfully');
      setAppointmentForm({
        patientId: registeredPatient?.id || '',
        doctorId: '',
        appointmentDate: '',
        timeSlot: '',
        reasonForVisit: '',
        specialty: ''
      });
      setAvailableSlots([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receptionist-booking-container">
      <div className="booking-header">
        <h2>👥 Patient Registration & Appointment Booking</h2>
        <p>Register new patients and book appointments based on doctor availability</p>
      </div>

      <div className="booking-tabs">
        <button
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          📝 Register Patient
        </button>
        <button
          className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          📅 Book Appointment
        </button>
      </div>

      {/* Register Patient Tab */}
      {activeTab === 'register' && (
        <div className="booking-content">
          <div className="form-card">
            <h3>Register New Patient</h3>
            <form onSubmit={handleRegisterPatient}>
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  name="name"
                  value={patientForm.name}
                  onChange={handlePatientFormChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientFormChange}
                    placeholder="+1-555-0123"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={patientForm.city}
                    onChange={handlePatientFormChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={patientForm.email}
                  onChange={handlePatientFormChange}
                  placeholder="patient@email.com"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register Patient'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Tab */}
      {activeTab === 'book' && (
        <div className="booking-content">
          <div className="form-card">
            <h3>Book Appointment</h3>
            
            {registeredPatient && (
              <div className="patient-info">
                <p><strong>Patient:</strong> {registeredPatient.name}</p>
                <p><strong>Phone:</strong> {registeredPatient.phone}</p>
                <p><strong>City:</strong> {registeredPatient.city}</p>
              </div>
            )}

            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Select Doctor *</label>
                <select
                  name="doctorId"
                  value={appointmentForm.doctorId}
                  onChange={handleAppointmentFormChange}
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={appointmentForm.appointmentDate}
                    onChange={handleAppointmentFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleFetchSlots}
                  disabled={!appointmentForm.doctorId || !appointmentForm.appointmentDate}
                >
                  Check Availability
                </button>
              </div>

              {availableSlots.length > 0 && (
                <div className="form-group">
                  <label>Available Time Slots *</label>
                  <div className="slots-grid">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-btn ${appointmentForm.timeSlot === slot ? 'selected' : ''}`}
                        onClick={() => setAppointmentForm({ ...appointmentForm, timeSlot: slot })}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea
                  name="reasonForVisit"
                  value={appointmentForm.reasonForVisit}
                  onChange={handleAppointmentFormChange}
                  placeholder="Enter reason for visit (optional)"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !appointmentForm.timeSlot}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistPatientBooking;

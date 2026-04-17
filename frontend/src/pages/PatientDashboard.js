import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaCalendar, FaFileAlt, FaReceipt, FaCog, FaSignOutAlt, FaEdit, FaSave, FaTimes, FaHeartbeat, FaIdCard, FaEnvelope, FaHistory } from 'react-icons/fa';
import MedicalHistory from '../components/MedicalHistory';
import VitalSigns from '../components/VitalSigns';
import Insurance from '../components/Insurance';
import Messages from '../components/Messages';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [upiInputs, setUpiInputs] = useState({});
  const [payingBillId, setPayingBillId] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointmentId: '',
    appointmentDate: '',
    startTime: '',
    endTime: ''
  });

  const formatINR = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      const [appointmentsRes, reportsRes, billsRes, prescriptionsRes, profileRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/lab-reports'),
        axios.get('/api/bills'),
        axios.get('/api/prescriptions'),
        axios.get('/api/auth/me')
      ]);
      
      setAppointments(appointmentsRes.data.appointments || []);
      setLabReports(reportsRes.data.reports || []);
      setBills(billsRes.data.bills || []);
      setPrescriptions(prescriptionsRes.data || []);
      setProfile(profileRes.data.user || {});
      setProfileForm(profileRes.data.user || {});
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put('/api/auth/profile', profileForm);
      setProfile(profileForm);
      setEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const canManageAppointment = (appointment) => {
    if (!appointment || appointment.status === 'cancelled' || appointment.status === 'completed') {
      return false;
    }
    return new Date(appointment.appointmentDate) > new Date();
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) {
      return;
    }

    try {
      await axios.delete(`/api/appointments/${appointmentId}`);
      toast.success('Appointment cancelled successfully');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const openRescheduleModal = (appointment) => {
    setRescheduleModal({
      open: true,
      appointmentId: appointment._id,
      appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '',
      startTime: appointment.timeSlot?.startTime || '',
      endTime: appointment.timeSlot?.endTime || appointment.timeSlot?.startTime || ''
    });
  };

  const submitReschedule = async () => {
    if (!rescheduleModal.appointmentDate || !rescheduleModal.startTime) {
      toast.error('Date and start time are required');
      return;
    }

    try {
      await axios.put(`/api/appointments/${rescheduleModal.appointmentId}/reschedule`, {
        appointmentDate: rescheduleModal.appointmentDate,
        timeSlot: {
          startTime: rescheduleModal.startTime,
          endTime: rescheduleModal.endTime || rescheduleModal.startTime
        }
      });

      toast.success('Appointment rescheduled successfully');
      setRescheduleModal({ open: false, appointmentId: '', appointmentDate: '', startTime: '', endTime: '' });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
  };

  const updateUpiInput = (billId, field, value) => {
    setUpiInputs((prev) => ({
      ...prev,
      [billId]: {
        ...(prev[billId] || { upiId: 'healthmatrix@upi', upiPin: '' }),
        [field]: value
      }
    }));
  };

  const payBillWithUpi = async (billId) => {
    const input = upiInputs[billId] || { upiId: 'healthmatrix@upi', upiPin: '' };
    if (!input.upiId || !input.upiPin) {
      toast.error('Please enter UPI ID and PIN');
      return;
    }

    try {
      setPayingBillId(billId);
      await axios.post(`/api/bills/${billId}/pay-upi`, {
        upiId: input.upiId,
        upiPin: input.upiPin
      });
      toast.success('UPI payment successful');
      setUpiInputs((prev) => ({
        ...prev,
        [billId]: { upiId: 'healthmatrix@upi', upiPin: '' }
      }));
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'UPI payment failed');
    } finally {
      setPayingBillId('');
    }
  };

  const printPrescription = (prescription) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>E-Prescription</title><style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 25px; font-size: 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        .med { background: #f8f9fa; padding: 10px; margin: 8px 0; border-left: 3px solid #28a745; }
        .lab { background: #fff3cd; padding: 10px; margin-top: 15px; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 13px; color: #666; }
        @media print { button { display: none; } }
      </style></head><body>
        <h1>Health Matrix Hospital — E-Prescription</h1>
        <div class="info-grid">
          <p><strong>Patient:</strong> ${prescription.patientName}</p>
          <p><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</p>
          <p><strong>Doctor:</strong> Dr. ${prescription.doctorName}${prescription.doctorSpecialization ? ' (' + prescription.doctorSpecialization + ')' : ''}</p>
          ${prescription.chiefComplaint ? `<p><strong>Chief Complaint:</strong> ${prescription.chiefComplaint}</p>` : ''}
        </div>
        <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
        <h2>Medications</h2>
        ${prescription.medications.map((m, i) => `
          <div class="med">
            <strong>${i + 1}. ${m.name}</strong> — ${m.dosage}<br/>
            ${m.frequency} | ${m.duration}
            ${m.instructions ? '<br/><em>' + m.instructions + '</em>' : ''}
          </div>`).join('')}
        ${prescription.labTests?.length ? `<div class="lab"><strong>Lab Tests:</strong> ${prescription.labTests.join(', ')}</div>` : ''}
        ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
        ${prescription.followUpDate ? `<p><strong>Follow-up:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</p>` : ''}
        <div class="footer">This is a computer-generated prescription from Health Matrix Hospital.</div>
        <br/><button onclick="window.print()">Print</button>
      </body></html>`);
    win.document.close();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => new Date(apt.appointmentDate) >= today && apt.status !== 'cancelled');
  };

  const getRecentActivity = () => {
    const allActivity = [
      ...appointments.map(apt => ({ ...apt, type: 'appointment', date: apt.createdAt })),
      ...prescriptions.map(rx => ({ ...rx, type: 'prescription', date: rx.createdAt })),
      ...labReports.map(report => ({ ...report, type: 'lab_report', date: report.createdAt })),
      ...bills.map(bill => ({ ...bill, type: 'bill', date: bill.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    return allActivity;
  };

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="user-info">
              <h1>Welcome, {user?.name}</h1>
              <p>Patient Dashboard</p>
            </div>
            <div className="header-actions">
              <button className="settings-btn" onClick={() => setActiveTab('settings')}>
                <FaCog /> Settings
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <FaUser /> Overview
          </button>
          <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
            <FaCalendar /> Appointments
          </button>
          <button className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => setActiveTab('prescriptions')}>
            <FaFileAlt /> Prescriptions
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            <FaFileAlt /> Lab Reports
          </button>
          <button className={activeTab === 'bills' ? 'active' : ''} onClick={() => setActiveTab('bills')}>
            <FaReceipt /> Bills
          </button>
          <button className={activeTab === 'medical-history' ? 'active' : ''} onClick={() => setActiveTab('medical-history')}>
            <FaHistory /> Medical History
          </button>
          <button className={activeTab === 'vitals' ? 'active' : ''} onClick={() => setActiveTab('vitals')}>
            <FaHeartbeat /> Vital Signs
          </button>
          <button className={activeTab === 'insurance' ? 'active' : ''} onClick={() => setActiveTab('insurance')}>
            <FaIdCard /> Insurance
          </button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            <FaEnvelope /> Messages
          </button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <FaCog /> Settings
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <FaCalendar />
                  <div>
                    <h3>{appointments.length}</h3>
                    <p>Total Appointments</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaFileAlt />
                  <div>
                    <h3>{prescriptions.length}</h3>
                    <p>Prescriptions</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaFileAlt />
                  <div>
                    <h3>{labReports.length}</h3>
                    <p>Lab Reports</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaReceipt />
                  <div>
                    <h3>{bills.length}</h3>
                    <p>Bills</p>
                  </div>
                </div>
              </div>

              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Upcoming Appointments</h3>
                  {getUpcomingAppointments().length === 0 ? (
                    <p className="no-data">No upcoming appointments</p>
                  ) : (
                    <div className="upcoming-list">
                      {getUpcomingAppointments().slice(0, 3).map(apt => (
                        <div key={apt._id} className="upcoming-item">
                          <div className="apt-date">
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="apt-details">
                            <strong>Dr. {apt.doctorId?.name}</strong>
                            <p>{apt.timeSlot?.startTime} - {apt.specialty}</p>
                          </div>
                          <span className={`status ${getStatusClass(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="view-all-btn" onClick={() => setActiveTab('appointments')}>
                    View All Appointments
                  </button>
                </div>

                <div className="overview-card">
                  <h3>Recent Activity</h3>
                  {getRecentActivity().length === 0 ? (
                    <p className="no-data">No recent activity</p>
                  ) : (
                    <div className="activity-list">
                      {getRecentActivity().map((item, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-icon">
                            {item.type === 'appointment' && <FaCalendar />}
                            {item.type === 'prescription' && <FaFileAlt />}
                            {item.type === 'lab_report' && <FaFileAlt />}
                            {item.type === 'bill' && <FaReceipt />}
                          </div>
                          <div className="activity-details">
                            <p>
                              {item.type === 'appointment' && `Appointment with Dr. ${item.doctorId?.name}`}
                              {item.type === 'prescription' && `Prescription from Dr. ${item.doctorName}`}
                              {item.type === 'lab_report' && `Lab Report: ${item.testType}`}
                              {item.type === 'bill' && `Bill #${item.billNumber}`}
                            </p>
                            <span className="activity-date">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-section">
              <div className="section-header">
                <h2>My Appointments</h2>
                <button className="btn-primary btn-appointment-compact" onClick={() => navigate('/appointment')}>
                  Book New Appointment
                </button>
              </div>
              
              {appointments.length === 0 ? (
                <div className="no-data-card">
                  <p>You don't have any appointments yet.</p>
                  <button onClick={() => navigate('/appointment')} className="btn-primary">
                    Book Your First Appointment
                  </button>
                </div>
              ) : (
                <div className="appointments-grid">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-card">
                      <div className="card-header">
                        <span className={`status ${getStatusClass(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        <span className="appointment-date">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="card-body">
                        <h3>Dr. {appointment.doctorId?.name}</h3>
                        <p className="specialty">{appointment.specialty}</p>
                        <p className="time">{appointment.timeSlot?.startTime}</p>
                        <p className="reason">{appointment.reasonForVisit}</p>
                        {appointment.notes && (
                          <p className="notes"><strong>Notes:</strong> {appointment.notes}</p>
                        )}
                        {canManageAppointment(appointment) && (
                          <div className="appointment-actions-inline">
                            <button className="btn-manage btn-reschedule" onClick={() => openRescheduleModal(appointment)}>
                              Reschedule
                            </button>
                            <button className="btn-manage btn-cancel-appointment" onClick={() => cancelAppointment(appointment._id)}>
                              Cancel Appointment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="prescriptions-section">
              <h2>My Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <p className="no-data">No prescriptions available</p>
              ) : (
                <div className="prescriptions-grid">
                  {prescriptions.map(prescription => (
                    <div key={prescription._id} className="prescription-card">
                      <div className="card-header">
                        <h3>E-Prescription</h3>
                        <div className="header-actions">
                          <span className="prescription-date">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </span>
                          <button className="btn-print" onClick={() => printPrescription(prescription)}>
                            Print
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="prescription-info">
                          <p><strong>Doctor:</strong> Dr. {prescription.doctorName}</p>
                          <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                          {prescription.chiefComplaint && (
                            <p><strong>Chief Complaint:</strong> {prescription.chiefComplaint}</p>
                          )}
                        </div>
                        <div className="medications">
                          <h4>Medications ({prescription.medications.length})</h4>
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={index} className="medication-item">
                              <strong>{med.name}</strong> - {med.dosage}
                              <br />
                              <small>{med.frequency} | {med.duration}</small>
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <p className="more-meds">+{prescription.medications.length - 2} more medications</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <h2>My Lab Reports</h2>
              {labReports.length === 0 ? (
                <p className="no-data">No lab reports available</p>
              ) : (
                <div className="reports-grid">
                  {labReports.map(report => (
                    <div key={report._id} className="report-card">
                      <div className="card-header">
                        <h3>{report.testType}</h3>
                        <span className={`status ${report.status}`}>{report.status}</span>
                      </div>
                      <div className="card-body">
                        <p><strong>Report #:</strong> {report.reportNumber}</p>
                        <p><strong>Category:</strong> {report.testCategory}</p>
                        <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                        {report.doctorName && (
                          <p><strong>Ordered by:</strong> Dr. {report.doctorName}</p>
                        )}
                        {report.findings && (
                          <div className="findings">
                            <strong>Findings:</strong>
                            <p>{report.findings}</p>
                          </div>
                        )}
                        {report.reportFile && (
                          <a href={report.reportFile} download={report.reportFileName} className="btn-download">
                            Download Report
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="bills-section">
              <h2>My Bills</h2>
              {bills.length === 0 ? (
                <p className="no-data">No bills available</p>
              ) : (
                <div className="bills-grid">
                  {bills.map(bill => (
                    <div key={bill._id} className="bill-card">
                      <div className="card-header">
                        <h3>Bill #{bill.billNumber}</h3>
                        <span className={`status ${bill.paymentStatus}`}>{bill.paymentStatus}</span>
                      </div>
                      <div className="card-body">
                        <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>
                        <p><strong>Amount:</strong> {formatINR(bill.totalAmount)}</p>
                        <p><strong>Payment Mode:</strong> {bill.paymentMode}</p>
                        {bill.paymentStatus === 'paid' && bill.upiTransactionId && (
                          <p><strong>Transaction:</strong> {bill.upiTransactionId}</p>
                        )}
                        {bill.description && (
                          <p><strong>Description:</strong> {bill.description}</p>
                        )}
                        {bill.paymentStatus !== 'paid' && (
                          <div className="upi-payment-box">
                            <p className="upi-title"><strong>Pay with UPI</strong> (Demo PIN: 1234)</p>
                            <input
                              type="text"
                              value={(upiInputs[bill._id] && upiInputs[bill._id].upiId) || 'healthmatrix@upi'}
                              onChange={(e) => updateUpiInput(bill._id, 'upiId', e.target.value)}
                              placeholder="UPI ID"
                            />
                            <input
                              type="password"
                              value={(upiInputs[bill._id] && upiInputs[bill._id].upiPin) || ''}
                              onChange={(e) => updateUpiInput(bill._id, 'upiPin', e.target.value)}
                              placeholder="UPI PIN"
                              maxLength="6"
                            />
                            <button
                              type="button"
                              className="btn-upi-pay"
                              onClick={() => payBillWithUpi(bill._id)}
                              disabled={payingBillId === bill._id}
                            >
                              {payingBillId === bill._id ? 'Processing...' : 'Pay Now'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <div className="settings-card">
                <div className="profile-section">
                  <div className="section-header">
                    <h3>Profile Information</h3>
                    {!editingProfile ? (
                      <button className="btn-edit" onClick={() => setEditingProfile(true)}>
                        <FaEdit /> Edit Profile
                      </button>
                    ) : (
                      <div className="edit-actions">
                        <button className="btn-save" onClick={updateProfile}>
                          <FaSave /> Save
                        </button>
                        <button className="btn-cancel" onClick={() => {
                          setEditingProfile(false);
                          setProfileForm(profile);
                        }}>
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="profile-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profileForm.name || ''}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        />
                      ) : (
                        <p>{profile.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      {editingProfile ? (
                        <input
                          type="email"
                          value={profileForm.email || ''}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        />
                      ) : (
                        <p>{profile.email}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      {editingProfile ? (
                        <input
                          type="tel"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      ) : (
                        <p>{profile.phone}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Date of Birth</label>
                      {editingProfile ? (
                        <input
                          type="date"
                          value={profileForm.dateOfBirth ? profileForm.dateOfBirth.split('T')[0] : ''}
                          onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                        />
                      ) : (
                        <p>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Gender</label>
                      {editingProfile ? (
                        <select
                          value={profileForm.gender || ''}
                          onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <p>{profile.gender || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      {editingProfile ? (
                        <textarea
                          value={profileForm.address || ''}
                          onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                          rows="3"
                        />
                      ) : (
                        <p>{profile.address || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="account-actions">
                  <h3>Account Actions</h3>
                  <button className="btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical-history' && (
            <MedicalHistory />
          )}

          {activeTab === 'vitals' && (
            <VitalSigns />
          )}

          {activeTab === 'insurance' && (
            <Insurance />
          )}

          {activeTab === 'messages' && (
            <Messages />
          )}

          {rescheduleModal.open && (
            <div className="modal-overlay" onClick={() => setRescheduleModal({ open: false, appointmentId: '', appointmentDate: '', startTime: '', endTime: '' })}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Reschedule Appointment</h2>
                <div className="form-group">
                  <label>New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleModal.appointmentDate}
                    onChange={(e) => setRescheduleModal((prev) => ({ ...prev, appointmentDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={rescheduleModal.startTime}
                    onChange={(e) => setRescheduleModal((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={rescheduleModal.endTime}
                    onChange={(e) => setRescheduleModal((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-primary" onClick={submitReschedule}>Save Changes</button>
                  <button className="btn-secondary" onClick={() => setRescheduleModal({ open: false, appointmentId: '', appointmentDate: '', startTime: '', endTime: '' })}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
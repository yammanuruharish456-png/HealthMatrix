import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCalendar, FaUser, FaClock, FaCheckCircle, FaHeartbeat, FaHistory, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import VitalSigns from '../components/VitalSigns';
import MedicalHistory from '../components/MedicalHistory';
import Messages from '../components/Messages';
import DoctorSchedule from './DoctorSchedule';
import './DoctorDashboard.css';

const emptyPrescription = {
  patientEmail: '',
  chiefComplaint: '',
  diagnosis: '',
  medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  labTests: [],
  labTestsInput: '',
  notes: '',
  followUpDate: ''
};

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabRequestModal, setShowLabRequestModal] = useState(false);
  const [showLabReviewModal, setShowLabReviewModal] = useState(false);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [labRequestData, setLabRequestData] = useState({
    patientId: '',
    patientName: '',
    testType: '',
    testCategory: 'blood_test',
    appointmentId: ''
  });
  const [prescriptionData, setPrescriptionData] = useState(emptyPrescription);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/doctor-login');
      return;
    }
    fetchAppointments();
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const [appointmentsRes, reportsRes, prescriptionsRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/lab-reports'),
        axios.get('/api/prescriptions')
      ]);
      setAppointments(appointmentsRes.data.appointments || []);
      setLabReports(reportsRes.data.reports || []);
      setPrescriptions(prescriptionsRes.data || []);
      const apts = appointmentsRes.data.appointments || [];
      setStats({
        total: apts.length,
        pending: apts.filter(a => a.status === 'pending').length,
        confirmed: apts.filter(a => a.status === 'confirmed').length,
        completed: apts.filter(a => a.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const openLabRequestModal = (appointment) => {
    setSelectedAppointment(appointment);
    setLabRequestData({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      testType: '',
      testCategory: 'blood_test',
      appointmentId: appointment._id
    });
    setShowLabRequestModal(true);
  };

  const submitLabRequest = async () => {
    if (!labRequestData.testType) {
      toast.error('Please enter test type');
      return;
    }
    if (!labRequestData.patientId) {
      toast.error('Patient information is missing');
      return;
    }
    
    try {
      console.log('Submitting lab request:', labRequestData);
      const response = await axios.post('/api/lab-reports', labRequestData);
      console.log('Lab request response:', response.data);
      toast.success('Lab report requested successfully');
      setShowLabRequestModal(false);
      setLabRequestData({ patientId: '', patientName: '', testType: '', testCategory: 'blood_test', appointmentId: '' });
      fetchAppointments();
    } catch (error) {
      console.error('Error requesting lab report:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to request lab report';
      toast.error(errorMsg);
    }
  };

  const reviewLabReport = async () => {
    if (!reviewNotes.trim()) {
      toast.error('Please enter diagnosis notes');
      return;
    }
    try {
      await axios.put(`/api/lab-reports/${selectedLabReport._id}`, {
        status: 'reviewed',
        reviewNotes
      });
      toast.success('Lab report reviewed successfully');
      setShowLabReviewModal(false);
      setSelectedLabReport(null);
      setReviewNotes('');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to review lab report');
    }
  };

  const openLabReviewModal = (report) => {
    setSelectedLabReport(report);
    setReviewNotes(report.reviewNotes || '');
    setShowLabReviewModal(true);
  };

  const openPrescriptionModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditingPrescriptionId('');
    setPrescriptionData({ ...emptyPrescription, patientEmail: appointment.patientEmail || '' });
    setShowPrescriptionModal(true);
  };

  const openPrescriptionEditModal = (prescription) => {
    setSelectedAppointment(null);
    setEditingPrescriptionId(prescription._id);
    setPrescriptionData({
      patientEmail: prescription.patientEmail || '',
      chiefComplaint: prescription.chiefComplaint || '',
      diagnosis: prescription.diagnosis || '',
      medications: prescription.medications?.length ? prescription.medications : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      labTests: prescription.labTests || [],
      labTestsInput: (prescription.labTests || []).join(', '),
      notes: prescription.notes || '',
      followUpDate: prescription.followUpDate ? prescription.followUpDate.split('T')[0] : ''
    });
    setShowPrescriptionModal(true);
  };

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => {
      const meds = [...prev.medications];
      meds[index][field] = value;
      return { ...prev, medications: meds };
    });
  };

  const savePrescription = async () => {
    if (!prescriptionData.patientEmail) {
      toast.error('Please enter patient email');
      return;
    }
    if (!prescriptionData.diagnosis) {
      toast.error('Please enter diagnosis');
      return;
    }
    try {
      const { labTestsInput, ...payload } = prescriptionData;

      if (editingPrescriptionId) {
        await axios.put(`/api/prescriptions/${editingPrescriptionId}`, payload);
        toast.success('Prescription updated successfully');
      } else {
        await axios.post('/api/prescriptions', {
          ...payload,
          appointment: selectedAppointment?._id
        });

        if (selectedAppointment) {
          await axios.put(`/api/appointments/${selectedAppointment._id}`, { status: 'completed' });
        }

        toast.success('E-Prescription created successfully');
      }

      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
      setEditingPrescriptionId('');
      setPrescriptionData(emptyPrescription);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(apt => new Date(apt.appointmentDate).toDateString() === today);
  };

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Doctor Dashboard</h1>
            <p>Welcome, Dr. {user?.name}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/doctor-login');
              toast.success('Logged out successfully');
            }}
            className="btn-logout"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="stats-cards">
          <div className="stat-card">
            <FaCalendar />
            <div><h3>{stats.total}</h3><p>Total Appointments</p></div>
          </div>
          <div className="stat-card pending">
            <FaClock />
            <div><h3>{stats.pending}</h3><p>Pending</p></div>
          </div>
          <div className="stat-card confirmed">
            <FaCheckCircle />
            <div><h3>{stats.confirmed}</h3><p>Confirmed</p></div>
          </div>
          <div className="stat-card completed">
            <FaCheckCircle />
            <div><h3>{stats.completed}</h3><p>Completed</p></div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="tabs">
            <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>Appointments</button>
            <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Lab Reports</button>
            <button className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => setActiveTab('prescriptions')}>Prescriptions</button>
            <button className={activeTab === 'vitals' ? 'active' : ''} onClick={() => setActiveTab('vitals')}>
              <FaHeartbeat /> Patient Vitals
            </button>
            <button className={activeTab === 'medical-history' ? 'active' : ''} onClick={() => setActiveTab('medical-history')}>
              <FaHistory /> Medical History
            </button>
            <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
              <FaEnvelope /> Messages
            </button>
            <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
              <FaCalendar /> My Schedule
            </button>
          </div>

          {activeTab === 'appointments' && (
            <div className="appointments-section">
              <h2>Today's Appointments</h2>
              <div className="appointments-list">
                {getTodayAppointments().length === 0 ? (
                  <p className="no-data">No appointments for today</p>
                ) : (
                  getTodayAppointments().map(appointment => (
                    <div key={appointment._id} className="appointment-item">
                      <div className="appointment-info">
                        <div className="patient-info">
                          <FaUser />
                          <div>
                            <strong>{appointment.patientName}</strong>
                            <p>{appointment.patientEmail}</p>
                            <p>{appointment.patientPhone}</p>
                          </div>
                        </div>
                        <div className="appointment-details">
                          <p><strong>Time:</strong> {appointment.timeSlot?.startTime}</p>
                          <p><strong>Reason:</strong> {appointment.reasonForVisit}</p>
                          <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>
                        </div>
                      </div>
                      <div className="appointment-actions">
                        {appointment.status === 'pending' && (
                          <>
                            <button onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')} className="btn-confirm">Confirm</button>
                            <button onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')} className="btn-cancel">Cancel</button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button onClick={() => openLabRequestModal(appointment)} className="btn-lab">Request Lab Test</button>
                            <button onClick={() => openPrescriptionModal(appointment)} className="btn-complete">
                              Create E-Prescription
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <h2>All Appointments</h2>
              <div className="appointments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appointment => (
                      <tr key={appointment._id}>
                        <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                        <td>{appointment.timeSlot?.startTime}</td>
                        <td>{appointment.patientName}</td>
                        <td>{appointment.reasonForVisit}</td>
                        <td><span className={`status ${appointment.status}`}>{appointment.status}</span></td>
                        <td>
                          {appointment.status === 'pending' && (
                            <button onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')} className="btn-sm btn-confirm">Confirm</button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <>
                              <button onClick={() => openLabRequestModal(appointment)} className="btn-sm btn-lab">Lab Test</button>
                              <button onClick={() => openPrescriptionModal(appointment)} className="btn-sm btn-complete">E-Prescription</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <h2>Patient Lab Reports</h2>
              {labReports.length === 0 ? (
                <p className="no-data">No lab reports available</p>
              ) : (
                <div className="reports-grid">
                  {labReports.map(report => (
                    <div key={report._id} className="report-card">
                      <h3>{report.testType}</h3>
                      <p><strong>Patient:</strong> {report.patientName}</p>
                      <p><strong>Report #:</strong> {report.reportNumber}</p>
                      <p><strong>Category:</strong> {report.testCategory}</p>
                      <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> <span className={`status ${report.status}`}>{report.status}</span></p>
                      
                      {report.findings && (
                        <div style={{marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '5px'}}>
                          <strong>Findings:</strong>
                          <p style={{margin: '5px 0 0 0'}}>{report.findings}</p>
                        </div>
                      )}
                      
                      {report.testResults && report.testResults.length > 0 && (
                        <div style={{marginTop: '10px'}}>
                          <strong>Test Results:</strong>
                          <div style={{fontSize: '14px', marginTop: '5px'}}>
                            {report.testResults.slice(0, 3).map((result, idx) => (
                              <div key={idx} style={{padding: '5px 0', borderBottom: '1px solid #eee'}}>
                                {result.parameter}: {result.value} {result.unit}
                              </div>
                            ))}
                            {report.testResults.length > 3 && (
                              <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>+{report.testResults.length - 3} more...</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {report.status === 'completed' && (
                        <>
                          {report.reportFile && (
                            <a href={report.reportFile} download={report.reportFileName} className="btn-download">Download Report</a>
                          )}
                          <button onClick={() => openLabReviewModal(report)} className="btn-review">Review & Diagnose</button>
                        </>
                      )}
                      {report.status === 'reviewed' && (
                        <>
                          {report.reportFile && (
                            <a href={report.reportFile} download={report.reportFileName} className="btn-download">Download Report</a>
                          )}
                          <div className="review-notes">
                            <strong>Diagnosis:</strong> {report.reviewNotes}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="reports-section">
              <h2>My Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <p className="no-data">No prescriptions created yet</p>
              ) : (
                <div className="reports-grid">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="report-card">
                      <h3>{prescription.patientName}</h3>
                      <p><strong>Date:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                      <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                      <p><strong>Medicines:</strong> {prescription.medications?.length || 0}</p>
                      <button onClick={() => openPrescriptionEditModal(prescription)} className="btn-review">Edit Prescription</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="vitals-section">
              <h2>Patient Vital Signs</h2>
              <p className="section-note">Select a patient to view their vital signs history and record new measurements.</p>
              <VitalSigns patientId={null} />
            </div>
          )}

          {activeTab === 'medical-history' && (
            <div className="medical-history-section">
              <h2>Patient Medical History</h2>
              <p className="section-note">Select a patient to view and manage their medical history.</p>
              <MedicalHistory patientId={null} />
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-section">
              <Messages />
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-section">
              <DoctorSchedule />
            </div>
          )}
        </div>
      </div>

      {showLabReviewModal && selectedLabReport && (
        <div className="modal-overlay" onClick={() => setShowLabReviewModal(false)}>
          <div className="modal-content prescription-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Review Lab Report & Diagnose</h2>

            <div className="patient-details">
              <p><strong>Patient:</strong> {selectedLabReport.patientName}</p>
              <p><strong>Test Type:</strong> {selectedLabReport.testType}</p>
              <p><strong>Category:</strong> {selectedLabReport.testCategory}</p>
              <p><strong>Report #:</strong> {selectedLabReport.reportNumber}</p>
              <p><strong>Date:</strong> {new Date(selectedLabReport.createdAt).toLocaleDateString()}</p>
            </div>

            {selectedLabReport.testResults && selectedLabReport.testResults.length > 0 && (
              <div style={{marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
                <h3 style={{marginBottom: '15px', fontSize: '16px'}}>Test Results</h3>
                <table style={{width: '100%', fontSize: '14px'}}>
                  <thead>
                    <tr style={{borderBottom: '2px solid #ddd'}}>
                      <th style={{textAlign: 'left', padding: '8px'}}>Parameter</th>
                      <th style={{textAlign: 'left', padding: '8px'}}>Value</th>
                      <th style={{textAlign: 'left', padding: '8px'}}>Normal Range</th>
                      <th style={{textAlign: 'left', padding: '8px'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLabReport.testResults.map((result, idx) => (
                      <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '8px'}}>{result.parameter}</td>
                        <td style={{padding: '8px'}}>{result.value} {result.unit}</td>
                        <td style={{padding: '8px'}}>{result.normalRange}</td>
                        <td style={{padding: '8px'}}>
                          <span className={`status ${result.status}`}>{result.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedLabReport.findings && (
              <div className="form-group">
                <label>Lab Technician Findings</label>
                <div style={{padding: '12px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #ddd'}}>
                  {selectedLabReport.findings}
                </div>
              </div>
            )}

            {selectedLabReport.recommendations && (
              <div className="form-group">
                <label>Lab Technician Recommendations</label>
                <div style={{padding: '12px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #ddd'}}>
                  {selectedLabReport.recommendations}
                </div>
              </div>
            )}

            {selectedLabReport.reportFile && (
              <div className="form-group">
                <label>Report File</label>
                <a href={selectedLabReport.reportFile} download={selectedLabReport.reportFileName} className="btn-download">
                  Download {selectedLabReport.reportFileName}
                </a>
              </div>
            )}

            <div className="form-group">
              <label>Doctor's Diagnosis & Review Notes *</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows="5"
                placeholder="Enter your diagnosis based on the lab report findings..."
                required
                style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px'}}
              />
            </div>

            <div className="modal-actions">
              <button onClick={reviewLabReport} className="btn-primary">Submit Diagnosis</button>
              <button onClick={() => setShowLabReviewModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLabRequestModal && (
        <div className="modal-overlay" onClick={() => setShowLabRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Lab Test</h2>
            {selectedAppointment && (
              <div className="patient-details">
                <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            )}
            <div className="form-group">
              <label>Test Type *</label>
              <input
                type="text"
                value={labRequestData.testType}
                onChange={(e) => setLabRequestData({ ...labRequestData, testType: e.target.value })}
                placeholder="e.g., Complete Blood Count, Lipid Profile"
                required
              />
            </div>
            <div className="form-group">
              <label>Test Category *</label>
              <select
                value={labRequestData.testCategory}
                onChange={(e) => setLabRequestData({ ...labRequestData, testCategory: e.target.value })}
              >
                <option value="blood_test">Blood Test</option>
                <option value="urine_test">Urine Test</option>
                <option value="xray">X-Ray</option>
                <option value="mri">MRI</option>
                <option value="ct_scan">CT Scan</option>
                <option value="ultrasound">Ultrasound</option>
                <option value="ecg">ECG</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={submitLabRequest} className="btn-primary">Request Test</button>
              <button onClick={() => setShowLabRequestModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="modal-overlay" onClick={() => {
          setShowPrescriptionModal(false);
          setEditingPrescriptionId('');
          setPrescriptionData(emptyPrescription);
        }}>
          <div className="modal-content prescription-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPrescriptionId ? 'Update Prescription' : 'Create E-Prescription'}</h2>

            {selectedAppointment && (
              <div className="patient-details">
                <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            )}

            <div className="form-group">
              <label>Patient Email *</label>
              <input
                type="email"
                value={prescriptionData.patientEmail}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, patientEmail: e.target.value })}
                placeholder="patient@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Chief Complaint</label>
              <input
                type="text"
                value={prescriptionData.chiefComplaint}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, chiefComplaint: e.target.value })}
                placeholder="e.g., Fever, Headache, Chest pain"
              />
            </div>

            <div className="form-group">
              <label>Diagnosis *</label>
              <input
                type="text"
                value={prescriptionData.diagnosis}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                placeholder="Enter diagnosis"
                required
              />
            </div>

            <div className="medications-section">
              <h3>Medications</h3>
              {prescriptionData.medications.map((med, index) => (
                <div key={index} className="medication-item">
                  <input placeholder="Medicine Name" value={med.name} onChange={(e) => updateMedication(index, 'name', e.target.value)} />
                  <input placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={(e) => updateMedication(index, 'dosage', e.target.value)} />
                  <input placeholder="Frequency (e.g., Twice daily)" value={med.frequency} onChange={(e) => updateMedication(index, 'frequency', e.target.value)} />
                  <input placeholder="Duration (e.g., 7 days)" value={med.duration} onChange={(e) => updateMedication(index, 'duration', e.target.value)} />
                  <input placeholder="Instructions (e.g., After meals)" value={med.instructions} onChange={(e) => updateMedication(index, 'instructions', e.target.value)} />
                  {prescriptionData.medications.length > 1 && (
                    <button type="button" onClick={() => removeMedication(index)} className="btn-remove">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addMedication} className="btn-add">+ Add Medication</button>
            </div>

            <div className="form-group">
              <label>Lab Tests (comma separated)</label>
              <input
                type="text"
                value={prescriptionData.labTestsInput}
                placeholder="e.g., Blood Test, X-Ray"
                onChange={(e) => setPrescriptionData({
                  ...prescriptionData,
                  labTestsInput: e.target.value,
                  labTests: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                rows="3"
                placeholder="Any additional instructions or notes"
              />
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                value={prescriptionData.followUpDate}
                onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button onClick={savePrescription} className="btn-primary">{editingPrescriptionId ? 'Update Prescription' : 'Create Prescription'}</button>
              <button onClick={() => {
                setShowPrescriptionModal(false);
                setEditingPrescriptionId('');
                setPrescriptionData(emptyPrescription);
              }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

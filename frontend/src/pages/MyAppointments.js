import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import './MyAppointments.css';

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [appointmentsRes, reportsRes, billsRes, prescriptionsRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/lab-reports'),
        axios.get('/api/bills'),
        axios.get('/api/prescriptions')
      ]);
      setAppointments(appointmentsRes.data.appointments || []);
      setLabReports(reportsRes.data.reports || []);
      setBills(billsRes.data.bills || []);
      setPrescriptions(prescriptionsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <h1>HealthMatrix Hospital — E-Prescription</h1>
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

  const cancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${id}`);
        toast.success('Appointment cancelled successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
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

  return (
    <div className="my-appointments-page">
      <div className="page-header">
        <div className="container">
          <h1>My Appointments</h1>
          <p>View and manage your appointments</p>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>Appointments</button>
          <button className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => setActiveTab('prescriptions')}>E-Prescriptions</button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Lab Reports</button>
          <button className={activeTab === 'bills' ? 'active' : ''} onClick={() => setActiveTab('bills')}>Bills</button>
        </div>

        {activeTab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <div className="no-appointments">
                <p>You don't have any appointments yet.</p>
                <button onClick={() => navigate('/appointment')} className="btn-primary">
                  Book an Appointment
                </button>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <span className={`status ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="appointment-body">
                      <div className="appointment-info">
                        <div className="info-item">
                          <FaUser />
                          <div>
                            <strong>Doctor</strong>
                            <p>Dr. {appointment.doctorId?.name}</p>
                          </div>
                        </div>
                        <div className="info-item">
                          <FaCalendar />
                          <div>
                            <strong>Date</strong>
                            <p>{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="info-item">
                          <FaClock />
                          <div>
                            <strong>Time</strong>
                            <p>{appointment.timeSlot?.startTime}</p>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-details">
                        <p><strong>Specialty:</strong> {appointment.specialty}</p>
                        <p><strong>Reason:</strong> {appointment.reasonForVisit}</p>
                      </div>
                    </div>
                    {appointment.status === 'pending' && (
                      <div className="appointment-actions">
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          className="btn-cancel"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="prescriptions-section">
            {prescriptions.length === 0 ? (
              <p className="no-data">No prescriptions available</p>
            ) : (
              <div className="prescriptions-list">
                {prescriptions.map(prescription => (
                  <div key={prescription._id} className="prescription-card">
                    <div className="prescription-header">
                      <div>
                        <h3>E-Prescription</h3>
                        <span className="prescription-date">{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button className="btn-print" onClick={() => printPrescription(prescription)}>🖨 Print</button>
                    </div>
                    <div className="prescription-body">
                      <div className="rx-info-grid">
                        <p><strong>Doctor:</strong> Dr. {prescription.doctorName} {prescription.doctorSpecialization && `(${prescription.doctorSpecialization})`}</p>
                        <p><strong>Patient:</strong> {prescription.patientName}</p>
                        {prescription.chiefComplaint && <p><strong>Chief Complaint:</strong> {prescription.chiefComplaint}</p>}
                        <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                      </div>

                      <div className="medications">
                        <h4>Medications</h4>
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="medication">
                            <p><strong>{index + 1}. {med.name}</strong> — {med.dosage}</p>
                            <p>{med.frequency} &nbsp;|&nbsp; {med.duration}</p>
                            {med.instructions && <p className="med-instructions">📌 {med.instructions}</p>}
                          </div>
                        ))}
                      </div>

                      {prescription.labTests?.length > 0 && (
                        <div className="lab-tests">
                          <h4>Recommended Lab Tests</h4>
                          <ul>{prescription.labTests.map((test, i) => <li key={i}>{test}</li>)}</ul>
                        </div>
                      )}

                      {prescription.notes && (
                        <div className="prescription-notes">
                          <h4>Additional Notes</h4>
                          <p>{prescription.notes}</p>
                        </div>
                      )}

                      {prescription.followUpDate && (
                        <p className="followup"><strong>Follow-up Date:</strong> {new Date(prescription.followUpDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            {labReports.length === 0 ? (
              <p className="no-data">No lab reports available</p>
            ) : (
              <div className="reports-list">
                {labReports.map(report => (
                  <div key={report._id} className="report-card">
                    <h3>{report.testType}</h3>
                    <p><strong>Report #:</strong> {report.reportNumber}</p>
                    <p><strong>Category:</strong> {report.testCategory}</p>
                    <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span className={`status ${report.status}`}>{report.status}</span></p>
                    {report.reportFile && (
                      <a href={report.reportFile} download={report.reportFileName} className="btn-download">Download Report</a>
                    )}
                    {report.findings && <p><strong>Findings:</strong> {report.findings}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="bills-section">
            {bills.length === 0 ? (
              <p className="no-data">No bills available</p>
            ) : (
              <div className="bills-list">
                {bills.map(bill => (
                  <div key={bill._id} className="bill-card">
                    <h3>Bill #{bill.billNumber}</h3>
                    <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> ${bill.totalAmount}</p>
                    <p><strong>Payment Mode:</strong> {bill.paymentMode}</p>
                    <p><strong>Status:</strong> {bill.paymentStatus}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;

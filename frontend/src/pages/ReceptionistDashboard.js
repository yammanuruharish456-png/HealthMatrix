import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileInvoiceDollar, FaDownload, FaEye, FaSignOutAlt } from 'react-icons/fa';
import ReceptionistPatientBooking from './ReceptionistPatientBooking';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('billing');
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentId: '',
    consultationFee: 0,
    labTests: [],
    medicines: [],
    procedures: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    totalAmount: 0,
    paymentMode: 'cash',
    paidAmount: 0,
    notes: ''
  });

  const formatINR = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

  useEffect(() => {
    if (!user || user.role !== 'receptionist') {
      navigate('/receptionist-login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [billsRes, appointmentsRes, patientsRes, nursesRes] = await Promise.all([
        axios.get('/api/bills'),
        axios.get('/api/appointments'),
        axios.get('/api/patients'),
        axios.get('/api/staff?role=nurse')
      ]);
      setBills(billsRes.data.bills || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setPatients(patientsRes.data.patients || []);
      setNurses(nursesRes.data.staff || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBillForm({ ...billForm, [name]: value });
  };

  const calculateTotal = () => {
    const labTotal = billForm.labTests.reduce((sum, test) => sum + (parseFloat(test.price) || 0), 0);
    const medTotal = billForm.medicines.reduce((sum, med) => sum + (parseFloat(med.price) * parseFloat(med.quantity) || 0), 0);
    const procTotal = billForm.procedures.reduce((sum, proc) => sum + (parseFloat(proc.price) || 0), 0);
    const subtotal = parseFloat(billForm.consultationFee || 0) + labTotal + medTotal + procTotal;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax - parseFloat(billForm.discount || 0);
    
    setBillForm({
      ...billForm,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: total.toFixed(2),
      paidAmount: total.toFixed(2)
    });
  };

  const addLabTest = () => {
    setBillForm({
      ...billForm,
      labTests: [...billForm.labTests, { testName: '', price: 0 }]
    });
  };

  const updateLabTest = (index, field, value) => {
    const updated = [...billForm.labTests];
    updated[index][field] = value;
    setBillForm({ ...billForm, labTests: updated });
  };

  const removeLabTest = (index) => {
    const updated = billForm.labTests.filter((_, i) => i !== index);
    setBillForm({ ...billForm, labTests: updated });
  };

  const addMedicine = () => {
    setBillForm({
      ...billForm,
      medicines: [...billForm.medicines, { name: '', quantity: 1, price: 0 }]
    });
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...billForm.medicines];
    updated[index][field] = value;
    setBillForm({ ...billForm, medicines: updated });
  };

  const removeMedicine = (index) => {
    const updated = billForm.medicines.filter((_, i) => i !== index);
    setBillForm({ ...billForm, medicines: updated });
  };

  const addProcedure = () => {
    setBillForm({
      ...billForm,
      procedures: [...billForm.procedures, { name: '', price: 0 }]
    });
  };

  const updateProcedure = (index, field, value) => {
    const updated = [...billForm.procedures];
    updated[index][field] = value;
    setBillForm({ ...billForm, procedures: updated });
  };

  const removeProcedure = (index) => {
    const updated = billForm.procedures.filter((_, i) => i !== index);
    setBillForm({ ...billForm, procedures: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!billForm.patientId) {
      toast.error('Please select a patient');
      return;
    }
    
    if (parseFloat(billForm.totalAmount) <= 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }
    
    try {
      // Prepare bill data - remove empty appointmentId
      const billData = { ...billForm };
      if (!billData.appointmentId) {
        delete billData.appointmentId;
      }
      
      console.log('Submitting bill:', billData);
      const response = await axios.post('/api/bills', billData);
      console.log('Bill created:', response.data);
      toast.success('Bill created successfully');
      setShowBillForm(false);
      setBillForm({
        patientId: '', patientName: '', patientPhone: '', patientEmail: '',
        appointmentId: '', consultationFee: 0, labTests: [], medicines: [],
        procedures: [], subtotal: 0, tax: 0, discount: 0, totalAmount: 0,
        paymentMode: 'cash', paidAmount: 0, notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating bill:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create bill';
      toast.error(errorMsg);
    }
  };

  const downloadBill = (bill) => {
    const content = `
AMEDIC HOSPITAL
Bill Receipt
---------------------------------
Bill Number: ${bill.billNumber}
Date: ${new Date(bill.createdAt).toLocaleString()}

Patient Details:
Name: ${bill.patientName}
Phone: ${bill.patientPhone}
Email: ${bill.patientEmail}

---------------------------------
CHARGES:
Consultation Fee: ${formatINR(bill.consultationFee)}
${bill.labTests.map(t => `${t.testName}: ${formatINR(t.price)}`).join('\n')}
${bill.medicines.map(m => `${m.name} (${m.quantity}): ${formatINR(m.price * m.quantity)}`).join('\n')}
${bill.procedures.map(p => `${p.name}: ${formatINR(p.price)}`).join('\n')}

Subtotal: ${formatINR(bill.subtotal)}
Tax (5%): ${formatINR(bill.tax)}
Discount: ${formatINR(bill.discount)}
---------------------------------
TOTAL: ${formatINR(bill.totalAmount)}

Payment Mode: ${bill.paymentMode.toUpperCase()}
Amount Paid: ${formatINR(bill.paidAmount)}

Receptionist: ${bill.receptionistName}
---------------------------------
Thank you for choosing Amedic Hospital!
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${bill.billNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { 
        status, 
        receptionistApproved: status === 'confirmed',
        receptionistId: user.id,
        receptionistName: user.name
      });
      toast.success(`Appointment ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const assignNurse = async (appointmentId, nurseId) => {
    if (!nurseId) {
      return;
    }

    const selectedNurse = nurses.find((nurse) => nurse._id === nurseId);
    if (!selectedNurse) {
      toast.error('Selected nurse not found');
      return;
    }

    try {
      await axios.put(`/api/appointments/${appointmentId}/assign-nurse`, {
        nurseId,
        nurseName: selectedNurse.name
      });
      toast.success(`Assigned ${selectedNurse.name} successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign nurse');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Receptionist Dashboard</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/receptionist-login');
              toast.success('Logged out successfully');
            }}
            className="btn-logout"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-tabs">
          <button className={activeTab === 'billing' ? 'active' : ''} onClick={() => setActiveTab('billing')}>
            Billing
          </button>
          <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
            Appointments
          </button>
          <button className={activeTab === 'patient-booking' ? 'active' : ''} onClick={() => setActiveTab('patient-booking')}>
            Patient Booking
          </button>
        </div>

        {activeTab === 'billing' && (
          <div className="section">
            <div className="section-header">
              <h2>Patient Billing</h2>
              <button onClick={() => setShowBillForm(true)} className="btn-primary">
                <FaFileInvoiceDollar /> Create Bill
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill._id}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.patientName}</td>
                    <td>{formatINR(bill.totalAmount)}</td>
                    <td>{bill.paymentMode}</td>
                    <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon" onClick={() => downloadBill(bill)}><FaDownload /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="section">
            <h2>Appointment Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Nurse</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt._id}>
                    <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                    <td>{apt.timeSlot?.startTime}</td>
                    <td>{apt.patientName}</td>
                    <td>Dr. {apt.doctorId?.name}</td>
                    <td>
                      <select
                        value={apt.assignedNurseId || ''}
                        onChange={(e) => assignNurse(apt._id, e.target.value)}
                        className="nurse-select"
                      >
                        <option value="">Assign Nurse</option>
                        {nurses.map((nurse) => (
                          <option key={nurse._id} value={nurse._id}>
                            {nurse.name}
                          </option>
                        ))}
                      </select>
                      {apt.assignedNurseName && (
                        <div className="assigned-label">Assigned: {apt.assignedNurseName}</div>
                      )}
                    </td>
                    <td><span className={`status ${apt.status}`}>{apt.status}</span></td>
                    <td>
                      {apt.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                            className="btn-sm btn-confirm"
                            style={{marginRight: '5px'}}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                            className="btn-sm btn-cancel"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <span className="status-badge confirmed">✓ Approved</span>
                      )}
                      {apt.status === 'cancelled' && (
                        <span className="status-badge cancelled">✗ Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'patient-booking' && (
          <div className="section">
            <ReceptionistPatientBooking />
          </div>
        )}
      </div>

      {showBillForm && (
        <div className="modal-overlay" onClick={() => setShowBillForm(false)}>
          <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
            <h2>Create Patient Bill</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient *</label>
                  <select name="patientId" value={billForm.patientId} onChange={(e) => {
                    const patient = patients.find(p => p._id === e.target.value);
                    if (patient) {
                      setBillForm({
                        ...billForm,
                        patientId: e.target.value,
                        patientName: patient.name || '',
                        patientPhone: patient.phone || '',
                        patientEmail: patient.email || ''
                      });
                    }
                  }} required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.phone}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹)</label>
                  <input type="number" name="consultationFee" value={billForm.consultationFee} onChange={handleFormChange} onBlur={calculateTotal} placeholder="Enter amount" />
                </div>
              </div>

              <div className="form-group">
                <label>Lab Tests</label>
                <button type="button" onClick={addLabTest} className="btn-secondary">Add Test</button>
                {billForm.labTests.map((test, index) => (
                  <div key={index} className="item-row">
                    <input placeholder="Test Name" value={test.testName} onChange={(e) => updateLabTest(index, 'testName', e.target.value)} />
                    <input type="number" placeholder="Price" value={test.price} onChange={(e) => updateLabTest(index, 'price', e.target.value)} onBlur={calculateTotal} />
                    <button type="button" onClick={() => removeLabTest(index)}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Medicines</label>
                <button type="button" onClick={addMedicine} className="btn-secondary">Add Medicine</button>
                {billForm.medicines.map((med, index) => (
                  <div key={index} className="item-row">
                    <input placeholder="Medicine Name" value={med.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} />
                    <input type="number" placeholder="Qty" value={med.quantity} onChange={(e) => updateMedicine(index, 'quantity', e.target.value)} onBlur={calculateTotal} />
                    <input type="number" placeholder="Price" value={med.price} onChange={(e) => updateMedicine(index, 'price', e.target.value)} onBlur={calculateTotal} />
                    <button type="button" onClick={() => removeMedicine(index)}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Procedures</label>
                <button type="button" onClick={addProcedure} className="btn-secondary">Add Procedure</button>
                {billForm.procedures.map((proc, index) => (
                  <div key={index} className="item-row">
                    <input placeholder="Procedure Name" value={proc.name} onChange={(e) => updateProcedure(index, 'name', e.target.value)} />
                    <input type="number" placeholder="Price" value={proc.price} onChange={(e) => updateProcedure(index, 'price', e.target.value)} onBlur={calculateTotal} />
                    <button type="button" onClick={() => removeProcedure(index)}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount</label>
                  <input type="number" name="discount" value={billForm.discount} onChange={handleFormChange} onBlur={calculateTotal} />
                </div>
                <div className="form-group">
                  <label>Payment Mode *</label>
                  <select name="paymentMode" value={billForm.paymentMode} onChange={handleFormChange} required>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>

              <div style={{marginBottom: '20px', textAlign: 'center'}}>
                <button type="button" onClick={calculateTotal} className="btn-secondary" style={{padding: '12px 30px', fontSize: '16px'}}>
                  Calculate Total
                </button>
              </div>

              <div className="bill-summary">
                <p>Subtotal: {formatINR(billForm.subtotal)}</p>
                <p>Tax (5%): {formatINR(billForm.tax)}</p>
                <p>Discount: {formatINR(billForm.discount)}</p>
                <h3>Total: {formatINR(billForm.totalAmount)}</h3>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={billForm.notes} onChange={handleFormChange} rows="2" />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Generate Bill</button>
                <button type="button" onClick={() => setShowBillForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;

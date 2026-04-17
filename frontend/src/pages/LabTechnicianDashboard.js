import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFlask, FaUpload, FaEye, FaSignOutAlt } from 'react-icons/fa';
import './LabTechnicianDashboard.css';

const LabTechnicianDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [completedReports, setCompletedReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reportForm, setReportForm] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    doctorId: '',
    doctorName: '',
    testType: '',
    testCategory: 'blood_test',
    findings: '',
    recommendations: '',
    status: 'completed',
    testResults: [],
    reportFile: '',
    reportFileName: '',
    reportFileType: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'lab_technician') {
      navigate('/lab-technician-login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [reportsRes, patientsRes, doctorsRes] = await Promise.all([
        axios.get('/api/lab-reports'),
        axios.get('/api/patients'),
        axios.get('/api/doctors')
      ]);
      const allReports = reportsRes.data.reports || [];
      setReports(allReports);
      setPendingReports(allReports.filter(r => r.status === 'requested' || r.status === 'in_progress'));
      setCompletedReports(allReports.filter(r => r.status === 'completed' || r.status === 'reviewed'));
      setPatients(patientsRes.data.patients || []);
      setDoctors(doctorsRes.data.doctors || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File size too large. Please upload a file smaller than 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportForm({
          ...reportForm,
          reportFile: reader.result,
          reportFileName: file.name,
          reportFileType: file.type
        });
        toast.success(`File "${file.name}" uploaded successfully`);
      };
      reader.onerror = () => {
        toast.error('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  };

  const addTestResult = () => {
    setReportForm({
      ...reportForm,
      testResults: [...reportForm.testResults, { parameter: '', value: '', unit: '', normalRange: '', status: 'normal' }]
    });
  };

  const updateTestResult = (index, field, value) => {
    const updated = [...reportForm.testResults];
    updated[index][field] = value;
    setReportForm({ ...reportForm, testResults: updated });
  };

  const removeTestResult = (index) => {
    const updated = reportForm.testResults.filter((_, i) => i !== index);
    setReportForm({ ...reportForm, testResults: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!reportForm.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!reportForm.testType) {
      toast.error('Please enter test type');
      return;
    }
    
    try {
      if (reportForm._id) {
        // Update existing report
        const updatePayload = {
          testResults: reportForm.testResults,
          findings: reportForm.findings,
          recommendations: reportForm.recommendations,
          reportFile: reportForm.reportFile,
          reportFileName: reportForm.reportFileName,
          reportFileType: reportForm.reportFileType,
          status: 'completed'
        };
        
        console.log('Updating report:', reportForm._id, updatePayload);
        const response = await axios.put(`/api/lab-reports/${reportForm._id}`, updatePayload);
        console.log('Update response:', response.data);
        toast.success('Lab report completed successfully');
      } else {
        // Create new report
        const createPayload = {
          patientId: reportForm.patientId,
          patientName: reportForm.patientName,
          patientAge: reportForm.patientAge,
          patientGender: reportForm.patientGender,
          doctorId: reportForm.doctorId || undefined,
          doctorName: reportForm.doctorName || undefined,
          testType: reportForm.testType,
          testCategory: reportForm.testCategory,
          testResults: reportForm.testResults,
          findings: reportForm.findings,
          recommendations: reportForm.recommendations,
          reportFile: reportForm.reportFile,
          reportFileName: reportForm.reportFileName,
          reportFileType: reportForm.reportFileType,
          status: 'completed'
        };
        
        console.log('Creating report:', createPayload);
        const response = await axios.post('/api/lab-reports', createPayload);
        console.log('Create response:', response.data);
        toast.success('Lab report created successfully');
      }
      
      setShowReportForm(false);
      setReportForm({
        patientId: '', patientName: '', patientAge: '', patientGender: '',
        doctorId: '', doctorName: '', testType: '', testCategory: 'blood_test',
        findings: '', recommendations: '', status: 'completed', testResults: [],
        reportFile: '', reportFileName: '', reportFileType: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving report:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save report';
      toast.error(errorMsg);
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      await axios.put(`/api/lab-reports/${reportId}`, { status });
      toast.success(`Report ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const completeReport = async (report) => {
    setReportForm({
      ...report,
      status: 'completed',
      testResults: report.testResults || []
    });
    setShowReportForm(true);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Lab Technician Dashboard</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/lab-technician-login');
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
          <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
            Pending Requests ({pendingReports.length})
          </button>
          <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>
            Completed Reports ({completedReports.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="section">
            <div className="section-header">
              <h2>Pending Lab Test Requests</h2>
            </div>

            {pendingReports.length === 0 ? (
              <p className="no-data">No pending lab test requests</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Report #</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Test Type</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Requested Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReports.map(report => (
                    <tr key={report._id}>
                      <td>{report.reportNumber}</td>
                      <td>{report.patientName}</td>
                      <td>{report.doctorName || 'N/A'}</td>
                      <td>{report.testType}</td>
                      <td>{report.testCategory}</td>
                      <td><span className={`status ${report.status}`}>{report.status}</span></td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        {report.status === 'requested' && (
                          <button onClick={() => updateReportStatus(report._id, 'in_progress')} className="btn-sm btn-primary">Start</button>
                        )}
                        {report.status === 'in_progress' && (
                          <button onClick={() => completeReport(report)} className="btn-sm btn-success">Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="section">
            <div className="section-header">
              <h2>Completed Lab Reports</h2>
              <button onClick={() => setShowReportForm(true)} className="btn-primary">
                <FaUpload /> Create New Report
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Report #</th>
                  <th>Patient</th>
                  <th>Test Type</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedReports.map(report => (
                  <tr key={report._id}>
                    <td>{report.reportNumber}</td>
                    <td>{report.patientName}</td>
                    <td>{report.testType}</td>
                    <td>{report.testCategory}</td>
                    <td><span className={`status ${report.status}`}>{report.status}</span></td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-icon"><FaEye /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showReportForm && (
        <div className="modal-overlay" onClick={() => setShowReportForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{reportForm._id ? 'Complete Lab Report' : 'Create Lab Report'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient *</label>
                  {reportForm._id ? (
                    <input type="text" value={reportForm.patientName} disabled />
                  ) : (
                    <select name="patientId" value={reportForm.patientId} onChange={(e) => {
                    const patient = patients.find(p => p._id === e.target.value);
                    if (patient) {
                      const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '';
                      setReportForm({
                        ...reportForm,
                        patientId: e.target.value,
                        patientName: patient.name || '',
                        patientAge: age,
                        patientGender: patient.gender || ''
                      });
                    }
                  }} required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.email}</option>)}
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  {reportForm._id ? (
                    <input type="text" value={reportForm.doctorName || 'N/A'} disabled />
                  ) : (
                    <select name="doctorId" value={reportForm.doctorId} onChange={(e) => {
                    const doctor = doctors.find(d => d._id === e.target.value);
                    if (doctor) {
                      setReportForm({
                        ...reportForm,
                        doctorId: e.target.value,
                        doctorName: doctor.name || ''
                      });
                    }
                  }}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} - {d.specialization}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Test Type *</label>
                  <input type="text" name="testType" value={reportForm.testType} onChange={handleFormChange} disabled={!!reportForm._id} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="testCategory" value={reportForm.testCategory} onChange={handleFormChange} disabled={!!reportForm._id} required>
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
              </div>

              <div className="form-group">
                <label>Upload Report File (Optional - PDF, Image, Document)</label>
                <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>Maximum file size: 5MB. You can also submit without a file.</p>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                />
                {reportForm.reportFileName && (
                  <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <p style={{color: '#28a745', fontWeight: '500', margin: 0}}>✓ Selected: {reportForm.reportFileName}</p>
                    <button 
                      type="button" 
                      onClick={() => setReportForm({...reportForm, reportFile: '', reportFileName: '', reportFileType: ''})}
                      style={{padding: '5px 10px', fontSize: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Test Results</label>
                <button type="button" onClick={addTestResult} className="btn-secondary">Add Parameter</button>
                {reportForm.testResults.map((result, index) => (
                  <div key={index} className="test-result-row">
                    <input placeholder="Parameter" value={result.parameter} onChange={(e) => updateTestResult(index, 'parameter', e.target.value)} />
                    <input placeholder="Value" value={result.value} onChange={(e) => updateTestResult(index, 'value', e.target.value)} />
                    <input placeholder="Unit" value={result.unit} onChange={(e) => updateTestResult(index, 'unit', e.target.value)} />
                    <input placeholder="Normal Range" value={result.normalRange} onChange={(e) => updateTestResult(index, 'normalRange', e.target.value)} />
                    <select value={result.status} onChange={(e) => updateTestResult(index, 'status', e.target.value)}>
                      <option value="normal">Normal</option>
                      <option value="abnormal">Abnormal</option>
                      <option value="critical">Critical</option>
                    </select>
                    <button type="button" onClick={() => removeTestResult(index)}>Remove</button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Findings</label>
                <textarea name="findings" value={reportForm.findings} onChange={handleFormChange} rows="3" />
              </div>

              <div className="form-group">
                <label>Recommendations</label>
                <textarea name="recommendations" value={reportForm.recommendations} onChange={handleFormChange} rows="3" />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">{reportForm._id ? 'Complete Report' : 'Create Report'}</button>
                <button type="button" onClick={() => setShowReportForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTechnicianDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSignOutAlt, FaHeartbeat, FaUserInjured, FaUserNurse } from 'react-icons/fa';
import './NurseDashboard.css';

const NurseDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientVitals, setPatientVitals] = useState([]);
  const [saving, setSaving] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    appointmentId: '',
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'nurse') {
      navigate('/nurse-login');
      return;
    }
    fetchAssignedPatients();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientVitals(selectedPatientId);
    } else {
      setPatientVitals([]);
    }
  }, [selectedPatientId]);

  const fetchAssignedPatients = async () => {
    try {
      const res = await axios.get('/api/nurse/assigned-patients');
      const data = res.data.appointments || [];
      setAssignedPatients(data);
      if (data.length > 0) {
        setSelectedPatientId(data[0].patientId);
        setVitalsForm((prev) => ({ ...prev, appointmentId: data[0]._id }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load assigned patients');
    }
  };

  const fetchPatientVitals = async (patientId) => {
    try {
      const res = await axios.get(`/api/nurse/patient/${patientId}/vitals`);
      setPatientVitals(res.data.vitalSigns || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load patient vitals');
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatientId(patientId);
    const selected = assignedPatients.find((apt) => apt.patientId === patientId);
    setVitalsForm((prev) => ({
      ...prev,
      appointmentId: selected?._id || '',
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      notes: ''
    }));
  };

  const updateField = (field, value) => {
    setVitalsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatientId || !vitalsForm.appointmentId) {
      toast.error('Please choose a patient appointment first');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patientId: selectedPatientId,
        appointmentId: vitalsForm.appointmentId,
        bloodPressure: {
          systolic: Number(vitalsForm.bloodPressure.systolic),
          diastolic: Number(vitalsForm.bloodPressure.diastolic)
        },
        heartRate: Number(vitalsForm.heartRate),
        temperature: Number(vitalsForm.temperature),
        respiratoryRate: Number(vitalsForm.respiratoryRate),
        oxygenSaturation: Number(vitalsForm.oxygenSaturation),
        weight: Number(vitalsForm.weight),
        height: Number(vitalsForm.height),
        notes: vitalsForm.notes
      };

      await axios.post('/api/nurse/vitals', payload);
      toast.success('Vitals recorded and shared with doctor in real time');

      setVitalsForm((prev) => ({
        ...prev,
        bloodPressure: { systolic: '', diastolic: '' },
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        notes: ''
      }));
      fetchPatientVitals(selectedPatientId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vitals');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/nurse-login');
  };

  const uniquePatients = assignedPatients.filter(
    (appointment, index, self) =>
      index === self.findIndex((a) => a.patientId === appointment.patientId)
  );

  return (
    <div className="nurse-dashboard">
      <div className="nurse-header">
        <div>
          <h1>Nurse Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button className="nurse-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="nurse-stats">
        <div className="nurse-stat-card">
          <FaUserNurse />
          <div>
            <h3>{assignedPatients.length}</h3>
            <p>Assigned Appointments</p>
          </div>
        </div>
        <div className="nurse-stat-card">
          <FaUserInjured />
          <div>
            <h3>{uniquePatients.length}</h3>
            <p>Assigned Patients</p>
          </div>
        </div>
        <div className="nurse-stat-card">
          <FaHeartbeat />
          <div>
            <h3>{patientVitals.length}</h3>
            <p>Vitals Records</p>
          </div>
        </div>
      </div>

      <div className="nurse-grid">
        <div className="nurse-card">
          <h2>Care Coordination</h2>
          {uniquePatients.length === 0 ? (
            <p className="no-data">No patients assigned yet.</p>
          ) : (
            <div className="patient-list">
              {uniquePatients.map((appointment) => (
                <button
                  key={appointment._id}
                  className={`patient-pill ${selectedPatientId === appointment.patientId ? 'active' : ''}`}
                  onClick={() => handlePatientChange(appointment.patientId)}
                >
                  <strong>{appointment.patientName}</strong>
                  <span>{appointment.timeSlot?.startTime || 'Time TBD'} | Dr. {appointment.doctorId?.name || 'Assigned doctor'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nurse-card">
          <h2>Record Vital Signs</h2>
          <form onSubmit={handleVitalsSubmit} className="vitals-form">
            <div className="input-grid">
              <label>
                Systolic (mmHg)
                <input
                  type="number"
                  value={vitalsForm.bloodPressure.systolic}
                  onChange={(e) =>
                    setVitalsForm((prev) => ({
                      ...prev,
                      bloodPressure: { ...prev.bloodPressure, systolic: e.target.value }
                    }))
                  }
                  required
                />
              </label>
              <label>
                Diastolic (mmHg)
                <input
                  type="number"
                  value={vitalsForm.bloodPressure.diastolic}
                  onChange={(e) =>
                    setVitalsForm((prev) => ({
                      ...prev,
                      bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value }
                    }))
                  }
                  required
                />
              </label>
              <label>
                Heart Rate (bpm)
                <input type="number" value={vitalsForm.heartRate} onChange={(e) => updateField('heartRate', e.target.value)} required />
              </label>
              <label>
                Temperature (C)
                <input type="number" step="0.1" value={vitalsForm.temperature} onChange={(e) => updateField('temperature', e.target.value)} required />
              </label>
              <label>
                Respiratory Rate
                <input type="number" value={vitalsForm.respiratoryRate} onChange={(e) => updateField('respiratoryRate', e.target.value)} required />
              </label>
              <label>
                Oxygen Saturation (%)
                <input type="number" value={vitalsForm.oxygenSaturation} onChange={(e) => updateField('oxygenSaturation', e.target.value)} required />
              </label>
              <label>
                Weight (kg)
                <input type="number" step="0.1" value={vitalsForm.weight} onChange={(e) => updateField('weight', e.target.value)} />
              </label>
              <label>
                Height (cm)
                <input type="number" step="0.1" value={vitalsForm.height} onChange={(e) => updateField('height', e.target.value)} />
              </label>
            </div>

            <label>
              Nursing Notes
              <textarea value={vitalsForm.notes} onChange={(e) => updateField('notes', e.target.value)} rows="3" placeholder="Observation and care coordination notes" />
            </label>

            <button type="submit" className="save-vitals-btn" disabled={saving || uniquePatients.length === 0}>
              {saving ? 'Saving...' : 'Save Vitals'}
            </button>
          </form>
        </div>
      </div>

      <div className="nurse-card vitals-history">
        <h2>Latest Patient Vitals</h2>
        {patientVitals.length === 0 ? (
          <p className="no-data">No vitals recorded for the selected patient.</p>
        ) : (
          <div className="history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>BP</th>
                  <th>Heart Rate</th>
                  <th>Temp</th>
                  <th>Resp</th>
                  <th>SpO2</th>
                </tr>
              </thead>
              <tbody>
                {patientVitals.map((vital) => (
                  <tr key={vital._id}>
                    <td>{new Date(vital.recordedAt).toLocaleString()}</td>
                    <td>{vital.bloodPressure?.systolic}/{vital.bloodPressure?.diastolic}</td>
                    <td>{vital.heartRate}</td>
                    <td>{vital.temperature}</td>
                    <td>{vital.respiratoryRate}</td>
                    <td>{vital.oxygenSaturation}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseDashboard;

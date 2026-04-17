import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaHeartbeat, FaThermometerHalf, FaWeight, FaRuler, FaPlus, FaChartLine } from 'react-icons/fa';
import './VitalSigns.css';

const VitalSigns = ({ patientId }) => {
  const { user } = useContext(AuthContext);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vitals: {
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: { value: '' },
      temperature: { value: '', unit: 'celsius' },
      respiratoryRate: { value: '' },
      oxygenSaturation: { value: '' },
      weight: { value: '', unit: 'kg' },
      height: { value: '', unit: 'cm' }
    },
    notes: ''
  });

  const targetPatientId = patientId || user?.id;

  useEffect(() => {
    fetchVitalSigns();
  }, [targetPatientId, activeTab]);

  const fetchVitalSigns = async () => {
    try {
      const res = await axios.get(`/api/vital-signs/${targetPatientId}`);
      setVitals(res.data.vitals || []);
    } catch (error) {
      console.error('Error fetching vital signs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/vital-signs', {
        ...formData,
        patientId: targetPatientId
      });
      toast.success('Vital signs recorded successfully');
      setShowModal(false);
      setFormData({
        vitals: {
          bloodPressure: { systolic: '', diastolic: '' },
          heartRate: { value: '' },
          temperature: { value: '', unit: 'celsius' },
          respiratoryRate: { value: '' },
          oxygenSaturation: { value: '' },
          weight: { value: '', unit: 'kg' },
          height: { value: '', unit: 'cm' }
        },
        notes: ''
      });
      fetchVitalSigns();
    } catch (error) {
      toast.error('Failed to record vital signs');
    }
  };

  const updateVital = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [category]: {
          ...prev.vitals[category],
          [field]: value
        }
      }
    }));
  };

  if (loading) return <div className="loading">Loading vital signs...</div>;

  return (
    <div className="vital-signs">
      <div className="vital-signs-header">
        <h2>Vital Signs</h2>
        {(user?.role === 'doctor' || user?.role === 'receptionist' || user?.role === 'admin') && (
          <button onClick={() => setShowModal(true)} className="btn-add">
            <FaPlus /> Record Vitals
          </button>
        )}
      </div>

      <div className="vital-tabs">
        <button 
          className={activeTab === 'current' ? 'active' : ''}
          onClick={() => setActiveTab('current')}
          title="Current Vitals"
        >
          <FaHeartbeat />
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
          title="History"
        >
          📋
        </button>
        <button 
          className={activeTab === 'trends' ? 'active' : ''}
          onClick={() => setActiveTab('trends')}
          title="Trends"
        >
          <FaChartLine />
        </button>
      </div>

      <div className="vital-content">
        {activeTab === 'current' && (
          <div className="current-vitals">
            {vitals.length === 0 ? (
              <p className="no-data">No vital signs recorded</p>
            ) : (
              <div className="vitals-grid">
                <div className="vital-card">
                  <div className="vital-icon">
                    <FaHeartbeat style={{ color: '#dc3545' }} />
                  </div>
                  <div className="vital-info">
                    <h4>Blood Pressure</h4>
                    <div className="vital-value">
                      {vitals[0]?.vitals?.bloodPressure ? (
                        <>
                          <span className="value">
                            {vitals[0].vitals.bloodPressure.systolic}/{vitals[0].vitals.bloodPressure.diastolic}
                          </span>
                          <span className="unit">mmHg</span>
                        </>
                      ) : (
                        <span className="no-value">Not recorded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="vital-card">
                  <div className="vital-icon">
                    <FaHeartbeat style={{ color: '#28a745' }} />
                  </div>
                  <div className="vital-info">
                    <h4>Heart Rate</h4>
                    <div className="vital-value">
                      {vitals[0]?.vitals?.heartRate?.value ? (
                        <>
                          <span className="value">{vitals[0].vitals.heartRate.value}</span>
                          <span className="unit">bpm</span>
                        </>
                      ) : (
                        <span className="no-value">Not recorded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="vital-card">
                  <div className="vital-icon">
                    <FaThermometerHalf style={{ color: '#fd7e14' }} />
                  </div>
                  <div className="vital-info">
                    <h4>Temperature</h4>
                    <div className="vital-value">
                      {vitals[0]?.vitals?.temperature?.value ? (
                        <>
                          <span className="value">{vitals[0].vitals.temperature.value}</span>
                          <span className="unit">°{vitals[0].vitals.temperature.unit === 'celsius' ? 'C' : 'F'}</span>
                        </>
                      ) : (
                        <span className="no-value">Not recorded</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="vital-card">
                  <div className="vital-icon">
                    <FaWeight style={{ color: '#6f42c1' }} />
                  </div>
                  <div className="vital-info">
                    <h4>Weight</h4>
                    <div className="vital-value">
                      {vitals[0]?.vitals?.weight?.value ? (
                        <>
                          <span className="value">{vitals[0].vitals.weight.value}</span>
                          <span className="unit">{vitals[0].vitals.weight.unit}</span>
                        </>
                      ) : (
                        <span className="no-value">Not recorded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {vitals.length > 0 && (
              <div className="last-recorded">
                <p>Last recorded: {new Date(vitals[0].recordedAt).toLocaleString()}</p>
                <p>Recorded by: {vitals[0].recordedByName}</p>
                {vitals[0].notes && <p>Notes: {vitals[0].notes}</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="vitals-history">
            {vitals.length === 0 ? (
              <p className="no-data">No vital signs history</p>
            ) : (
              <div className="history-list">
                {vitals.map((vital, index) => (
                  <div key={vital._id} className="history-item">
                    <div className="history-date">
                      {new Date(vital.recordedAt).toLocaleDateString()}
                      <br />
                      <small>{new Date(vital.recordedAt).toLocaleTimeString()}</small>
                    </div>
                    <div className="history-vitals">
                      {vital.vitals.bloodPressure?.systolic && (
                        <span>BP: {vital.vitals.bloodPressure.systolic}/{vital.vitals.bloodPressure.diastolic}</span>
                      )}
                      {vital.vitals.heartRate?.value && (
                        <span>HR: {vital.vitals.heartRate.value} bpm</span>
                      )}
                      {vital.vitals.temperature?.value && (
                        <span>Temp: {vital.vitals.temperature.value}°{vital.vitals.temperature.unit === 'celsius' ? 'C' : 'F'}</span>
                      )}
                      {vital.vitals.weight?.value && (
                        <span>Weight: {vital.vitals.weight.value} {vital.vitals.weight.unit}</span>
                      )}
                    </div>
                    <div className="history-meta">
                      <small>By: {vital.recordedByName}</small>
                      {vital.notes && <small>Notes: {vital.notes}</small>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="vitals-trends">
            <p className="no-data">Trends visualization would be implemented here with a charting library like Chart.js</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>Record Vital Signs</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="vitals-form-grid">
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <div className="bp-inputs">
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={formData.vitals.bloodPressure.systolic}
                      onChange={(e) => updateVital('bloodPressure', 'systolic', e.target.value)}
                    />
                    <span>/</span>
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={formData.vitals.bloodPressure.diastolic}
                      onChange={(e) => updateVital('bloodPressure', 'diastolic', e.target.value)}
                    />
                    <span>mmHg</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Heart Rate</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      placeholder="Heart rate"
                      value={formData.vitals.heartRate.value}
                      onChange={(e) => updateVital('heartRate', 'value', e.target.value)}
                    />
                    <span>bpm</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Temperature</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Temperature"
                      value={formData.vitals.temperature.value}
                      onChange={(e) => updateVital('temperature', 'value', e.target.value)}
                    />
                    <select
                      value={formData.vitals.temperature.unit}
                      onChange={(e) => updateVital('temperature', 'unit', e.target.value)}
                    >
                      <option value="celsius">°C</option>
                      <option value="fahrenheit">°F</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Weight</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Weight"
                      value={formData.vitals.weight.value}
                      onChange={(e) => updateVital('weight', 'value', e.target.value)}
                    />
                    <select
                      value={formData.vitals.weight.unit}
                      onChange={(e) => updateVital('weight', 'unit', e.target.value)}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes or observations..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Record Vitals</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalSigns;
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaAllergies, FaHeartbeat, FaUserMd } from 'react-icons/fa';
import './MedicalHistory.css';

const MedicalHistory = ({ patientId }) => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('allergies');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const targetPatientId = patientId || user?.id;

  useEffect(() => {
    fetchMedicalHistory();
  }, [targetPatientId]);

  const fetchMedicalHistory = async () => {
    try {
      const res = await axios.get(`/api/medical-history/${targetPatientId}`);
      setHistory(res.data.history);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'allergy') {
        await axios.post(`/api/medical-history/${targetPatientId}/allergies`, formData);
        toast.success('Allergy added successfully');
      } else if (modalType === 'surgery') {
        await axios.post(`/api/medical-history/${targetPatientId}/surgeries`, formData);
        toast.success('Surgery record added successfully');
      } else if (modalType === 'condition') {
        await axios.post(`/api/medical-history/${targetPatientId}/conditions`, formData);
        toast.success('Chronic condition added successfully');
      }
      
      setShowModal(false);
      setFormData({});
      fetchMedicalHistory();
    } catch (error) {
      toast.error('Failed to save record');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe': return '#dc3545';
      case 'moderate': return '#fd7e14';
      case 'mild': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) return <div className="loading">Loading medical history...</div>;

  return (
    <div className="medical-history">
      <div className="medical-history-header">
        <h2>Medical History</h2>
        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <div className="header-actions">
            <button onClick={() => openModal('allergy')} className="btn-add">
              <FaPlus /> Add Allergy
            </button>
            <button onClick={() => openModal('surgery')} className="btn-add">
              <FaPlus /> Add Surgery
            </button>
            <button onClick={() => openModal('condition')} className="btn-add">
              <FaPlus /> Add Condition
            </button>
          </div>
        )}
      </div>

      <div className="medical-tabs">
        <button 
          className={activeTab === 'allergies' ? 'active' : ''}
          onClick={() => setActiveTab('allergies')}
          title="Allergies"
        >
          <FaAllergies />
        </button>
        <button 
          className={activeTab === 'conditions' ? 'active' : ''}
          onClick={() => setActiveTab('conditions')}
          title="Chronic Conditions"
        >
          <FaHeartbeat />
        </button>
        <button 
          className={activeTab === 'surgeries' ? 'active' : ''}
          onClick={() => setActiveTab('surgeries')}
          title="Surgeries"
        >
          <FaUserMd />
        </button>
        <button 
          className={activeTab === 'family' ? 'active' : ''}
          onClick={() => setActiveTab('family')}
          title="Family History"
        >
          👨‍👩‍👧‍👦
        </button>
      </div>

      <div className="medical-content">
        {activeTab === 'allergies' && (
          <div className="allergies-section">
            {!history?.allergies?.length ? (
              <p className="no-data">No allergies recorded</p>
            ) : (
              <div className="allergies-grid">
                {history.allergies.map((allergy, index) => (
                  <div key={index} className="allergy-card">
                    <div className="allergy-header">
                      <h4>{allergy.allergen}</h4>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(allergy.severity) }}
                      >
                        {allergy.severity}
                      </span>
                    </div>
                    <p><strong>Reaction:</strong> {allergy.reaction}</p>
                    {allergy.dateIdentified && (
                      <p><strong>Identified:</strong> {new Date(allergy.dateIdentified).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'conditions' && (
          <div className="conditions-section">
            {!history?.chronicConditions?.length ? (
              <p className="no-data">No chronic conditions recorded</p>
            ) : (
              <div className="conditions-grid">
                {history.chronicConditions.map((condition, index) => (
                  <div key={index} className="condition-card">
                    <div className="condition-header">
                      <h4>{condition.condition}</h4>
                    </div>
                    {condition.diagnosedDate && (
                      <p><strong>Diagnosed:</strong> {new Date(condition.diagnosedDate).toLocaleDateString()}</p>
                    )}
                    {condition.notes && (
                      <p><strong>Notes:</strong> {condition.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === 'allergy' && 'Add Allergy'}
              {modalType === 'surgery' && 'Add Surgery'}
              {modalType === 'condition' && 'Add Chronic Condition'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {modalType === 'allergy' && (
                <>
                  <div className="form-group">
                    <label>Allergen *</label>
                    <input
                      type="text"
                      value={formData.allergen || ''}
                      onChange={(e) => setFormData({...formData, allergen: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reaction *</label>
                    <input
                      type="text"
                      value={formData.reaction || ''}
                      onChange={(e) => setFormData({...formData, reaction: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      value={formData.severity || 'mild'}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save</button>
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

export default MedicalHistory;
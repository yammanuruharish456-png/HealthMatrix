import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaIdCard, FaMoneyBillWave, FaFileInvoice, FaCheckCircle, FaTimesCircle, FaClock, FaPlus, FaEdit } from 'react-icons/fa';
import './Insurance.css';

const Insurance = ({ patientId }) => {
  const { user } = useContext(AuthContext);
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const targetPatientId = patientId || user?.id;
  const isStaff = ['admin', 'receptionist'].includes(user?.role);

  useEffect(() => {
    fetchInsurance();
  }, [targetPatientId]);

  const fetchInsurance = async () => {
    try {
      const res = await axios.get(`/api/insurance/${targetPatientId}`);
      setInsurance(res.data.insurance);
    } catch (error) {
      console.error('Error fetching insurance:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    if (type === 'insurance') {
      setFormData(insurance || {
        primaryInsurance: {
          provider: '',
          policyNumber: '',
          groupNumber: '',
          subscriberName: '',
          subscriberDOB: '',
          relationshipToSubscriber: 'self',
          effectiveDate: '',
          expirationDate: '',
          copay: '',
          deductible: '',
          outOfPocketMax: ''
        }
      });
    } else if (type === 'claim') {
      setFormData({
        serviceDate: '',
        provider: 'Health Matrix Hospital',
        diagnosis: '',
        amountBilled: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'insurance') {
        await axios.post('/api/insurance', {
          ...formData,
          patientId: targetPatientId
        });
        toast.success('Insurance information saved successfully');
      } else if (modalType === 'claim') {
        await axios.post(`/api/insurance/${targetPatientId}/claims`, formData);
        toast.success('Insurance claim submitted successfully');
      }
      
      setShowModal(false);
      setFormData({});
      fetchInsurance();
    } catch (error) {
      toast.error('Failed to save insurance information');
    }
  };

  const verifyInsurance = async (status) => {
    try {
      await axios.post(`/api/insurance/${targetPatientId}/verify`, { status });
      toast.success(`Insurance ${status} successfully`);
      fetchInsurance();
    } catch (error) {
      toast.error('Failed to verify insurance');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
      case 'approved':
      case 'paid':
        return <FaCheckCircle style={{ color: '#28a745' }} />;
      case 'denied':
      case 'expired':
      case 'invalid':
        return <FaTimesCircle style={{ color: '#dc3545' }} />;
      case 'pending':
      case 'processing':
      case 'submitted':
        return <FaClock style={{ color: '#ffc107' }} />;
      default:
        return <FaClock style={{ color: '#6c757d' }} />;
    }
  };

  if (loading) return <div className="loading">Loading insurance information...</div>;

  return (
    <div className="insurance">
      <div className="insurance-header">
        <h2>Insurance Information</h2>
        <div className="header-actions">
          {!insurance && (
            <button onClick={() => openModal('insurance')} className="btn-add">
              <FaPlus /> Add Insurance
            </button>
          )}
          {insurance && (
            <button onClick={() => openModal('insurance')} className="btn-edit">
              <FaEdit /> Edit Insurance
            </button>
          )}
          {isStaff && (
            <button onClick={() => openModal('claim')} className="btn-add">
              <FaPlus /> Submit Claim
            </button>
          )}
        </div>
      </div>

      <div className="insurance-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <FaIdCard /> Insurance Card
        </button>
        <button 
          className={activeTab === 'coverage' ? 'active' : ''}
          onClick={() => setActiveTab('coverage')}
        >
          <FaMoneyBillWave /> Coverage
        </button>
        <button 
          className={activeTab === 'claims' ? 'active' : ''}
          onClick={() => setActiveTab('claims')}
        >
          <FaFileInvoice /> Claims
        </button>
      </div>

      <div className="insurance-content">
        {activeTab === 'overview' && (
          <div className="insurance-overview">
            {!insurance ? (
              <div className="no-insurance">
                <FaIdCard size={64} color="#ccc" />
                <h3>No Insurance Information</h3>
                <p>Add your insurance information to get started</p>
                <button onClick={() => openModal('insurance')} className="btn-primary">
                  Add Insurance Information
                </button>
              </div>
            ) : (
              <div className="insurance-cards">
                <div className="insurance-card primary">
                  <div className="card-header">
                    <h3>Primary Insurance</h3>
                    <div className="verification-status">
                      {getStatusIcon(insurance.verificationStatus)}
                      <span className={`status ${insurance.verificationStatus}`}>
                        {insurance.verificationStatus}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="provider-info">
                      <h4>{insurance.primaryInsurance?.provider || 'Insurance Provider'}</h4>
                      <p className="policy-number">Policy: {insurance.primaryInsurance?.policyNumber}</p>
                      <p className="group-number">Group: {insurance.primaryInsurance?.groupNumber}</p>
                    </div>
                    <div className="subscriber-info">
                      <p><strong>Subscriber:</strong> {insurance.primaryInsurance?.subscriberName}</p>
                      <p><strong>Relationship:</strong> {insurance.primaryInsurance?.relationshipToSubscriber}</p>
                      <p><strong>Effective:</strong> {insurance.primaryInsurance?.effectiveDate ? new Date(insurance.primaryInsurance.effectiveDate).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Expires:</strong> {insurance.primaryInsurance?.expirationDate ? new Date(insurance.primaryInsurance.expirationDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  {isStaff && (
                    <div className="card-actions">
                      {insurance.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => verifyInsurance('verified')} className="btn-verify">
                            Verify
                          </button>
                          <button onClick={() => verifyInsurance('invalid')} className="btn-deny">
                            Mark Invalid
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coverage' && (
          <div className="coverage-details">
            {!insurance?.primaryInsurance ? (
              <p className="no-data">No insurance information available</p>
            ) : (
              <div className="coverage-grid">
                <div className="coverage-card">
                  <h4>Copayments</h4>
                  <div className="coverage-item">
                    <span>Office Visit:</span>
                    <span>${insurance.primaryInsurance.copay || 'N/A'}</span>
                  </div>
                </div>
                <div className="coverage-card">
                  <h4>Deductibles</h4>
                  <div className="coverage-item">
                    <span>Annual Deductible:</span>
                    <span>${insurance.primaryInsurance.deductible || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="claims-section">
            {!insurance?.claims?.length ? (
              <p className="no-data">No insurance claims</p>
            ) : (
              <div className="claims-list">
                {insurance.claims.map((claim, index) => (
                  <div key={index} className="claim-card">
                    <div className="claim-header">
                      <div className="claim-info">
                        <h4>Claim #{claim.claimNumber}</h4>
                        <p>{claim.service || claim.diagnosis}</p>
                      </div>
                      <div className="claim-status">
                        {getStatusIcon(claim.status)}
                        <span className={`status ${claim.status}`}>{claim.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === 'insurance' && 'Insurance Information'}
              {modalType === 'claim' && 'Submit Insurance Claim'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {modalType === 'insurance' && (
                <div className="insurance-form">
                  <h4>Primary Insurance</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Insurance Provider *</label>
                      <input
                        type="text"
                        value={formData.primaryInsurance?.provider || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          primaryInsurance: {
                            ...formData.primaryInsurance,
                            provider: e.target.value
                          }
                        })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Policy Number *</label>
                      <input
                        type="text"
                        value={formData.primaryInsurance?.policyNumber || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          primaryInsurance: {
                            ...formData.primaryInsurance,
                            policyNumber: e.target.value
                          }
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {modalType === 'insurance' ? 'Save Insurance' : 'Submit Claim'}
                </button>
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

export default Insurance;
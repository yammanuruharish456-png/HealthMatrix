import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUsers, FaUserMd, FaCalendarAlt, FaEnvelope, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, contacts: 0 });
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [verifyingStaffId, setVerifyingStaffId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [systemConfig, setSystemConfig] = useState({
    hospitalName: '',
    supportEmail: '',
    defaultAppointmentDuration: 30,
    allowSelfRegistration: true,
    themeAccent: '#2D9CDB'
  });
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    isVerified: true
  });
  const [specialtyForm, setSpecialtyForm] = useState({ id: '', name: '', description: '' });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [verifyingDoctorId, setVerifyingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    about: ''
  });

  const formatINR = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [doctorsRes, appointmentsRes, contactsRes, staffRes, callbacksRes, usersRes, specialtiesRes, configRes] = await Promise.all([
        axios.get('/api/doctors'),
        axios.get('/api/appointments'),
        axios.get('/api/contact'),
        axios.get('/api/staff'),
        axios.get('/api/callbacks'),
        axios.get('/api/admin/users'),
        axios.get('/api/specialties'),
        axios.get('/api/admin/config')
      ]);

      const allDoctors = doctorsRes.data.doctors;
      const verifiedDoctors = allDoctors.filter(d => d.isVerified !== false);
      const pendingDocs = allDoctors.filter(d => d.isVerified === false);
      const allStaff = staffRes.data.staff || [];
      const pendingStaffList = allStaff.filter(s => s.isVerified === false);

      setDoctors(verifiedDoctors);
      setPendingDoctors(pendingDocs);
      setPendingStaff(pendingStaffList);
      setAppointments(appointmentsRes.data.appointments);
      setContacts(contactsRes.data.contacts);
      setCallbacks(callbacksRes.data.callbacks || []);
      setUsers(usersRes.data.users || []);
      setSpecialties(specialtiesRes.data.specialties || []);
      setSystemConfig(configRes.data.config || {});

      setStats({
        patients: appointmentsRes.data.appointments.length,
        doctors: verifiedDoctors.length,
        appointments: appointmentsRes.data.appointments.length,
        contacts: contactsRes.data.contacts.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const openNMCVerification = (doctorId) => {
    window.open('https://www.nmc.org.in/information-desk/indian-medical-register/', '_blank');
    setVerifyingDoctorId(doctorId);
  };

  const approveDoctor = async (doctorId) => {
    try {
      await axios.put(`/api/doctors/${doctorId}/verify`, { isVerified: true, isActive: true });
      toast.success('Doctor verified and approved successfully');
      setVerifyingDoctorId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to verify doctor');
    }
  };

  const rejectDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to reject this doctor application?')) {
      try {
        await axios.delete(`/api/doctors/${doctorId}`);
        toast.success('Doctor application rejected');
        setVerifyingDoctorId(null);
        fetchData();
      } catch (error) {
        toast.error('Failed to reject doctor');
      }
    }
  };

  const approveStaff = async (staffId) => {
    try {
      await axios.put(`/api/staff/${staffId}/verify`, { isVerified: true, isActive: true });
      toast.success('Staff verified and approved successfully');
      setVerifyingStaffId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to verify staff');
    }
  };

  const rejectStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to reject this staff application?')) {
      try {
        await axios.delete(`/api/staff/${staffId}`);
        toast.success('Staff application rejected');
        setVerifyingStaffId(null);
        fetchData();
      } catch (error) {
        toast.error('Failed to reject staff');
      }
    }
  };

  const handleDoctorFormChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const addDoctor = async (e) => {
    e.preventDefault();
    try {
      const qualificationArray = doctorForm.qualification.split(',').map(q => q.trim());
      await axios.post('/api/doctors/add', {
        ...doctorForm,
        qualification: qualificationArray,
        experience: parseInt(doctorForm.experience),
        consultationFee: parseInt(doctorForm.consultationFee)
      });
      toast.success('Doctor added successfully');
      setShowDoctorForm(false);
      setDoctorForm({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        about: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add doctor');
    }
  };

  const deleteDoctor = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`/api/doctors/${id}`);
        toast.success('Doctor deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete doctor');
      }
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      toast.success('Appointment updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const updateCallbackStatus = async (id, status) => {
    try {
      await axios.put(`/api/callbacks/${id}`, { status });
      toast.success('Callback status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update callback status');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      id: '',
      name: '',
      email: '',
      password: '',
      role: 'patient',
      phone: '',
      isVerified: true
    });
  };

  const submitUser = async (e) => {
    e.preventDefault();
    try {
      if (userForm.id) {
        await axios.put(`/api/admin/users/${userForm.id}`, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          phone: userForm.phone,
          isVerified: userForm.isVerified
        });
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/admin/users', userForm);
        toast.success('User created successfully');
      }
      resetUserForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const editUser = (selectedUser) => {
    setUserForm({
      id: selectedUser._id,
      name: selectedUser.name,
      email: selectedUser.email,
      password: '',
      role: selectedUser.role,
      phone: selectedUser.phone || '',
      isVerified: !!selectedUser.isVerified
    });
    setActiveTab('users');
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const resetSpecialtyForm = () => {
    setSpecialtyForm({ id: '', name: '', description: '' });
  };

  const submitSpecialty = async (e) => {
    e.preventDefault();
    try {
      if (specialtyForm.id) {
        await axios.put(`/api/specialties/${specialtyForm.id}`, {
          name: specialtyForm.name,
          description: specialtyForm.description
        });
        toast.success('Department updated successfully');
      } else {
        await axios.post('/api/specialties', {
          name: specialtyForm.name,
          description: specialtyForm.description
        });
        toast.success('Department added successfully');
      }
      resetSpecialtyForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const editSpecialty = (item) => {
    setSpecialtyForm({ id: item._id, name: item.name, description: item.description || '' });
    setActiveTab('departments');
  };

  const deleteSpecialty = async (id) => {
    if (!window.confirm('Are you sure you want to remove this department?')) {
      return;
    }

    try {
      await axios.delete(`/api/specialties/${id}`);
      toast.success('Department removed successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove department');
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/admin/config', systemConfig);
      toast.success('System configuration saved');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/admin-login');
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
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'pending' ? 'active' : ''} 
            onClick={() => setActiveTab('pending')}
          >
            Pending Doctors ({pendingDoctors.length})
          </button>
          <button 
            className={activeTab === 'staff' ? 'active' : ''} 
            onClick={() => setActiveTab('staff')}
          >
            Pending Staff ({pendingStaff.length})
          </button>
          <button 
            className={activeTab === 'doctors' ? 'active' : ''} 
            onClick={() => setActiveTab('doctors')}
          >
            Doctors
          </button>
          <button 
            className={activeTab === 'appointments' ? 'active' : ''} 
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button 
            className={activeTab === 'contacts' ? 'active' : ''} 
            onClick={() => setActiveTab('contacts')}
          >
            Contact Inquiries
          </button>
          <button 
            className={activeTab === 'callbacks' ? 'active' : ''} 
            onClick={() => setActiveTab('callbacks')}
          >
            Callback Requests ({callbacks.length})
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            User Accounts ({users.length})
          </button>
          <button 
            className={activeTab === 'departments' ? 'active' : ''} 
            onClick={() => setActiveTab('departments')}
          >
            Departments ({specialties.length})
          </button>
          <button 
            className={activeTab === 'configuration' ? 'active' : ''} 
            onClick={() => setActiveTab('configuration')}
          >
            System Config
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <FaUsers />
                <div>
                  <h3>{stats.patients}</h3>
                  <p>Total Patients</p>
                </div>
              </div>
              <div className="stat-card">
                <FaUserMd />
                <div>
                  <h3>{stats.doctors}</h3>
                  <p>Verified Doctors</p>
                </div>
              </div>
              <div className="stat-card">
                <FaCalendarAlt />
                <div>
                  <h3>{stats.appointments}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <FaEnvelope />
                <div>
                  <h3>{stats.contacts}</h3>
                  <p>Contact Inquiries</p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h2>Recent Appointments</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(apt => (
                    <tr key={apt._id}>
                      <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                      <td>{apt.patientName}</td>
                      <td>Dr. {apt.doctorId?.name}</td>
                      <td><span className={`status ${apt.status}`}>{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-section">
            <h2>Pending Doctor Verifications</h2>
            {pendingDoctors.length === 0 ? (
              <p className="no-data">No pending verifications</p>
            ) : (
              <div className="pending-list">
                {pendingDoctors.map(doctor => (
                  <div key={doctor._id} className="pending-card">
                    <div className="pending-header">
                      <h3>Dr. {doctor.name}</h3>
                      <span className="badge-pending">Pending Verification</span>
                    </div>
                    <div className="pending-details">
                      <p><strong>Email:</strong> {doctor.email}</p>
                      <p><strong>Phone:</strong> {doctor.phone}</p>
                      <p><strong>Specialization:</strong> {doctor.specialization}</p>
                      <p><strong>NMC Registration:</strong> {doctor.nmcRegistrationNumber}</p>
                      <p><strong>Experience:</strong> {doctor.experience} years</p>
                      <p><strong>Qualifications:</strong> {doctor.qualification?.join(', ')}</p>
                      <p><strong>About:</strong> {doctor.about}</p>
                    </div>
                    <div className="pending-actions">
                      {verifyingDoctorId === doctor._id ? (
                        <>
                          <button 
                            onClick={() => approveDoctor(doctor._id)}
                            className="btn-approve"
                          >
                            <FaCheckCircle /> Accept
                          </button>
                          <button 
                            onClick={() => rejectDoctor(doctor._id)}
                            className="btn-reject"
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => openNMCVerification(doctor._id)}
                          className="btn-verify"
                        >
                          <FaCheckCircle /> Verify with NMC
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="doctors-section">
            <div className="section-header section-header-doctors">
              <h2>Manage Doctors</h2>
              <button onClick={() => setShowDoctorForm(true)} className="btn-primary">
                <FaPlus /> Add Doctor
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doctor => (
                  <tr key={doctor._id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.experience} years</td>
                    <td>{formatINR(doctor.consultationFee)}</td>
                    <td>{doctor.rating.toFixed(1)} ⭐</td>
                    <td>
                      <button className="btn-icon"><FaEdit /></button>
                      <button className="btn-icon" onClick={() => deleteDoctor(doctor._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <h2>All Appointments</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Receptionist Action</th>
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
                    <td>{apt.specialty}</td>
                    <td><span className={`status ${apt.status}`}>{apt.status}</span></td>
                    <td>
                      {apt.receptionistName ? (
                        <div>
                          <span className={`badge ${apt.status === 'confirmed' ? 'approved' : 'cancelled'}`}>
                            {apt.status === 'confirmed' ? '✓ Approved' : '✗ Cancelled'}
                          </span>
                          <br />
                          <small>by {apt.receptionistName}</small>
                          <br />
                          <small>{new Date(apt.receptionistActionDate).toLocaleString()}</small>
                        </div>
                      ) : (
                        <span className="badge pending">Pending Review</span>
                      )}
                    </td>
                    <td>
                      {apt.status === 'pending' && !apt.receptionistName && (
                        <button 
                          onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                          className="btn-sm btn-confirm"
                        >
                          Admin Confirm
                        </button>
                      )}
                      {apt.status === 'confirmed' && apt.receptionistName && (
                        <span className="status-badge confirmed">✓ Final Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="pending-section">
            <h2>Pending Staff Verifications</h2>
            {pendingStaff.length === 0 ? (
              <p className="no-data">No pending staff verifications</p>
            ) : (
              <div className="pending-list">
                {pendingStaff.map(staff => (
                  <div key={staff._id} className="pending-card">
                    <div className="pending-header">
                      <h3>{staff.name}</h3>
                      <span className="badge-pending">
                        {staff.role === 'lab_technician' ? 'Lab Technician' : staff.role === 'nurse' ? 'Nurse' : 'Receptionist'}
                      </span>
                    </div>
                    <div className="pending-details">
                      <p><strong>Email:</strong> {staff.email}</p>
                      <p><strong>Phone:</strong> {staff.phone}</p>
                      <p><strong>Employee ID:</strong> {staff.employeeId}</p>
                      <p><strong>Department:</strong> {staff.department}</p>
                      <p><strong>Experience:</strong> {staff.experience} years</p>
                      <p><strong>Qualifications:</strong> {staff.qualification?.join(', ')}</p>
                      <p><strong>Shift:</strong> {staff.shift}</p>
                    </div>
                    <div className="pending-actions">
                      <button 
                        onClick={() => approveStaff(staff._id)}
                        className="btn-approve"
                      >
                        <FaCheckCircle /> Accept
                      </button>
                      <button 
                        onClick={() => rejectStaff(staff._id)}
                        className="btn-reject"
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="doctors-section">
            <div className="section-header">
              <h2>User Account Management</h2>
            </div>

            <form onSubmit={submitUser} className="section form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input value={userForm.name} onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} required />
                </div>
              </div>
              {!userForm.id && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input type="text" value={userForm.password} onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={userForm.role} onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="lab_technician">Lab Technician</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}
              {userForm.id && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select value={userForm.role} onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="lab_technician">Lab Technician</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={userForm.phone} onChange={(e) => setUserForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button className="btn-primary" type="submit">{userForm.id ? 'Update User' : 'Create User'}</button>
                <button className="btn-secondary" type="button" onClick={resetUserForm}>Clear</button>
              </div>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account._id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>{account.role}</td>
                    <td>{account.isVerified ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="btn-icon" onClick={() => editUser(account)}><FaEdit /></button>
                      <button className="btn-icon" onClick={() => deleteUser(account._id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="doctors-section">
            <div className="section-header">
              <h2>Department Management</h2>
            </div>

            <form onSubmit={submitSpecialty} className="section">
              <div className="form-row">
                <div className="form-group">
                  <label>Department Name</label>
                  <input value={specialtyForm.name} onChange={(e) => setSpecialtyForm((prev) => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={specialtyForm.description} onChange={(e) => setSpecialtyForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" type="submit">{specialtyForm.id ? 'Update Department' : 'Add Department'}</button>
                <button className="btn-secondary" type="button" onClick={resetSpecialtyForm}>Clear</button>
              </div>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {specialties.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.description || 'N/A'}</td>
                    <td>
                      <button className="btn-icon" onClick={() => editSpecialty(item)}><FaEdit /></button>
                      <button className="btn-icon" onClick={() => deleteSpecialty(item._id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="doctors-section">
            <div className="section-header">
              <h2>System Configuration</h2>
            </div>

            <form onSubmit={saveConfig} className="section">
              <div className="form-row">
                <div className="form-group">
                  <label>Hospital Name</label>
                  <input value={systemConfig.hospitalName || ''} onChange={(e) => setSystemConfig((prev) => ({ ...prev, hospitalName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Support Email</label>
                  <input type="email" value={systemConfig.supportEmail || ''} onChange={(e) => setSystemConfig((prev) => ({ ...prev, supportEmail: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Default Appointment Duration (mins)</label>
                  <input type="number" value={systemConfig.defaultAppointmentDuration || 30} onChange={(e) => setSystemConfig((prev) => ({ ...prev, defaultAppointmentDuration: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label>Theme Accent</label>
                  <input type="color" value={systemConfig.themeAccent || '#2D9CDB'} onChange={(e) => setSystemConfig((prev) => ({ ...prev, themeAccent: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!systemConfig.allowSelfRegistration}
                    onChange={(e) => setSystemConfig((prev) => ({ ...prev, allowSelfRegistration: e.target.checked }))}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  Allow Self Registration
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" type="submit">Save Configuration</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="contacts-section">
            <h2>Contact Inquiries</h2>
            <div className="contacts-list">
              {contacts.map(contact => (
                <div key={contact._id} className="contact-card">
                  <div className="contact-header">
                    <h3>{contact.name}</h3>
                    <span className={`status ${contact.status}`}>{contact.status}</span>
                  </div>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Phone:</strong> {contact.phone}</p>
                  <p><strong>Subject:</strong> {contact.subject}</p>
                  <p><strong>Message:</strong> {contact.message}</p>
                  <p className="date">Received: {new Date(contact.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'callbacks' && (
          <div className="callbacks-section">
            <h2>Callback Requests</h2>
            {callbacks.length === 0 ? (
              <p className="no-data">No callback requests</p>
            ) : (
              <div className="callbacks-list">
                {callbacks.map(callback => (
                  <div key={callback._id} className="callback-card">
                    <div className="callback-header">
                      <h3>{callback.userName}</h3>
                      <span className={`status ${callback.status}`}>{callback.status}</span>
                    </div>
                    <p><strong>Email:</strong> {callback.userEmail}</p>
                    <p><strong>Phone:</strong> {callback.userPhone}</p>
                    <p><strong>Role:</strong> {callback.userRole}</p>
                    <p><strong>Query:</strong> {callback.query}</p>
                    <p className="date">Requested: {new Date(callback.createdAt).toLocaleString()}</p>
                    <div className="callback-actions">
                      {callback.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateCallbackStatus(callback._id, 'contacted')}
                            className="btn-sm btn-confirm"
                          >
                            Mark Contacted
                          </button>
                          <button 
                            onClick={() => updateCallbackStatus(callback._id, 'resolved')}
                            className="btn-sm btn-success"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}
                      {callback.status === 'contacted' && (
                        <button 
                          onClick={() => updateCallbackStatus(callback._id, 'resolved')}
                          className="btn-sm btn-success"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {callback.status === 'resolved' && (
                        <span className="status-badge resolved">✓ Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showDoctorForm && (
        <div className="modal-overlay" onClick={() => setShowDoctorForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Doctor</h2>
            <form onSubmit={addDoctor}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={doctorForm.name}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={doctorForm.email}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={doctorForm.phone}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <select
                    name="specialization"
                    value={doctorForm.specialization}
                    onChange={handleDoctorFormChange}
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Qualifications (comma separated)</label>
                <input
                  type="text"
                  name="qualification"
                  value={doctorForm.qualification}
                  onChange={handleDoctorFormChange}
                  placeholder="MD, MBBS, Fellowship"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={doctorForm.experience}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={doctorForm.consultationFee}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>About</label>
                <textarea
                  name="about"
                  value={doctorForm.about}
                  onChange={handleDoctorFormChange}
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Doctor</button>
                <button type="button" onClick={() => setShowDoctorForm(false)} className="btn-secondary">
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

export default AdminDashboard;

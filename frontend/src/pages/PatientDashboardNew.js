import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaCalendar, FaFileAlt, FaReceipt, FaHeartbeat, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './DashboardLayout.css';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0,
    labReports: 0,
    bills: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, reportsRes, billsRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/prescriptions'),
        axios.get('/api/lab-reports'),
        axios.get('/api/bills')
      ]);

      setStats({
        appointments: appointmentsRes.data.appointments?.length || 0,
        prescriptions: prescriptionsRes.data?.length || 0,
        labReports: reportsRes.data.reports?.length || 0,
        bills: billsRes.data.bills?.length || 0
      });

      setRecentAppointments(appointmentsRes.data.appointments?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar user={user} onLogout={logout} />
      <Sidebar userRole="patient" />
      
      <main className="dashboard-main">
        <div className="container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>Welcome back, {user?.name}!</h1>
              <p>Here's your health overview</p>
            </div>
            <button className="btn btn-primary">
              <FaPlus /> Book Appointment
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ color: '#2D9CDB' }}>
                <FaCalendar />
              </div>
              <div className="stat-card-value">{stats.appointments}</div>
              <div className="stat-card-label">Appointments</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ color: '#27AE60' }}>
                <FaFileAlt />
              </div>
              <div className="stat-card-value">{stats.prescriptions}</div>
              <div className="stat-card-label">Prescriptions</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ color: '#F39C12' }}>
                <FaHeartbeat />
              </div>
              <div className="stat-card-value">{stats.labReports}</div>
              <div className="stat-card-label">Lab Reports</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon" style={{ color: '#E74C3C' }}>
                <FaReceipt />
              </div>
              <div className="stat-card-value">{stats.bills}</div>
              <div className="stat-card-label">Bills</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-2">
            {/* Recent Appointments */}
            <div className="card">
              <div className="card-header">
                <h3>Recent Appointments</h3>
                <a href="/patient/appointments" className="link">View All</a>
              </div>
              <div className="card-body">
                {recentAppointments.length === 0 ? (
                  <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    No appointments scheduled
                  </p>
                ) : (
                  <div className="appointment-list">
                    {recentAppointments.map((apt) => (
                      <div key={apt._id} className="appointment-item">
                        <div className="appointment-date">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="appointment-details">
                          <h4>Dr. {apt.doctorId?.name}</h4>
                          <p>{apt.specialty}</p>
                        </div>
                        <span className={`badge badge-${apt.status}`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="action-grid">
                  <button className="action-btn">
                    <FaCalendar />
                    <span>Book Appointment</span>
                  </button>
                  <button className="action-btn">
                    <FaFileAlt />
                    <span>View Records</span>
                  </button>
                  <button className="action-btn">
                    <FaHeartbeat />
                    <span>Health Vitals</span>
                  </button>
                  <button className="action-btn">
                    <FaReceipt />
                    <span>Billing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;

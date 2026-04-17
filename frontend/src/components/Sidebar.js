import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaCalendar,
  FaUsers,
  FaUserMd,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = {
    admin: [
      { label: 'Dashboard', icon: FaHome, path: '/admin' },
      { label: 'Patients', icon: FaUsers, path: '/admin/patients' },
      { label: 'Doctors', icon: FaUserMd, path: '/admin/doctors' },
      { label: 'Appointments', icon: FaCalendar, path: '/admin/appointments' },
      { label: 'Reports', icon: FaFileAlt, path: '/admin/reports' },
      { label: 'Analytics', icon: FaChartBar, path: '/admin/analytics' },
      { label: 'Settings', icon: FaCog, path: '/admin/settings' }
    ],
    doctor: [
      { label: 'Dashboard', icon: FaHome, path: '/doctor' },
      { label: 'Appointments', icon: FaCalendar, path: '/doctor/appointments' },
      { label: 'Patients', icon: FaUsers, path: '/doctor/patients' },
      { label: 'Reports', icon: FaFileAlt, path: '/doctor/reports' },
      { label: 'Settings', icon: FaCog, path: '/doctor/settings' }
    ],
    patient: [
      { label: 'Dashboard', icon: FaHome, path: '/patient' },
      { label: 'Appointments', icon: FaCalendar, path: '/patient/appointments' },
      { label: 'Medical Records', icon: FaFileAlt, path: '/patient/records' },
      { label: 'Prescriptions', icon: FaFileAlt, path: '/patient/prescriptions' },
      { label: 'Settings', icon: FaCog, path: '/patient/settings' }
    ]
  };

  const items = menuItems[userRole] || menuItems.patient;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="nav-icon" />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

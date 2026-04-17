import React, { useState } from 'react';
import { FaBell, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New appointment request', time: '5 min ago' },
    { id: 2, message: 'Lab report ready', time: '1 hour ago' }
  ]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="logo-icon">🏥</div>
          <span>Health Matrix</span>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Notifications */}
          <div className="navbar-notifications">
            <button className="notification-btn">
              <FaBell />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
          </div>

          {/* Profile Menu */}
          <div className="navbar-profile">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">{user?.name?.charAt(0)}</div>
              <div className="profile-info">
                <span className="profile-name">{user?.name}</span>
                <span className="profile-role">{user?.role}</span>
              </div>
              <FaChevronDown className={showProfileMenu ? 'active' : ''} />
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <a href="/profile" className="menu-item">
                  <FaUser /> Profile
                </a>
                <button onClick={onLogout} className="menu-item logout">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

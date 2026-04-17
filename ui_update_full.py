import re

with open('src/pages/PatientDashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

prefix = content.split("  return (")[0]
suffix_parts = content.split("          {activeTab === 'appointments' && (")
if len(suffix_parts) > 1:
    suffix = "          {activeTab === 'appointments' && (" + suffix_parts[1]
    # Remove the last 4 lines which are `      </div>\n    </div>\n  );\n};\n`
    suffix = "\n".join(suffix.split("\n")[:-5])
else:
    suffix = ""

new_return = """  return (
    <div className="patient-dashboard-wrapper">
      {/* Sidebar */}
      <div className="pd-sidebar">
        <div className="pd-brand">
          <div className="pd-brand-icon"><FaHeartbeat color="white" /></div>
          Heart IQ
        </div>
        <div className="pd-nav">
          <div className={`pd-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <FaUser /> Dashboard
          </div>
          <div className={`pd-nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <FaCalendar /> Patient Portal
          </div>
          <div className={`pd-nav-item ${activeTab === 'medical-history' ? 'active' : ''}`} onClick={() => setActiveTab('medical-history')}>
            <FaHistory /> Medical History
          </div>
          <div className={`pd-nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
            <FaFileAlt /> Mobile App
          </div>
          <div className={`pd-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <FaCog /> Employees
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="pd-main-panel">
        <div className="pd-header">
          <h1>Patient Portal</h1>
          <div className="pd-user-section">
            <div className="pd-bell">
              <FaEnvelope />
              {getUpcomingAppointments().length > 0 && <div className="pd-bell-badge">{getUpcomingAppointments().length}</div>}
            </div>
            <div className="pd-profile" onClick={() => setActiveTab('settings')} style={{cursor: 'pointer'}}>
              <div className="pd-avatar">
                <FaUser />
              </div>
              <div className="pd-user-details">
                <span className="pd-user-name">{user?.name}</span>
                <span className="pd-user-role">Clinical manager</span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="pd-stats-row">
              <div className="pd-stat-card">
                <span className="pd-stat-pill inactive">Inactive</span>
                <div className="pd-stat-value">
                  <h2>12</h2>
                  <span className="pd-stat-trend">▼ -9.6%</span>
                </div>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-pill hospitalized">Hospitalized</span>
                <div className="pd-stat-value">
                  <h2>82</h2>
                  <span className="pd-stat-trend">▼ -9.6%</span>
                </div>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-pill active">Active</span>
                <div className="pd-stat-value">
                  <h2>36</h2>
                  <span className="pd-stat-trend">▼ -9.6%</span>
                </div>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-pill pending">Pending</span>
                <div className="pd-stat-value">
                  <h2>26</h2>
                  <span className="pd-stat-trend">▼ -9.6%</span>
                </div>
              </div>
            </div>

            <div className="pd-dashboard-grid">
              <div className="pd-table-card">
                <div className="pd-table-header">
                  <h3>Patient Overview</h3>
                  <div className="pd-segment-control">
                    <button className="pd-segment-btn">All Patients</button>
                    <button className="pd-segment-btn active">My Patients</button>
                  </div>
                </div>
                <div className="pd-table-toolbar">
                  <input type="text" className="pd-search-input" placeholder="Search patient..." />
                </div>
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Patient #</th>
                      <th>Service ⌄</th>
                      <th>Status ⌄</th>
                      <th>Assignment ⌄</th>
                    </tr>
                  </thead>
                  <tbody>
                        <tr>
                          <td>
                            <div className="pd-user-row">
                              <div className="pd-user-img" style={{background: '#ffb6c1', color: '#111'}}>SL</div>
                              Samantha Long
                            </div>
                          </td>
                          <td>1123</td>
                          <td>HN</td>
                          <td><strong>Active</strong></td>
                          <td>Assigned</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="pd-user-row">
                              <div className="pd-user-img" style={{background: '#a29bfe', color: '#111'}}>JG</div>
                              Janet Gutierrez
                            </div>
                          </td>
                          <td>1129</td>
                          <td>RN</td>
                          <td><strong>Pending</strong></td>
                          <td>Assigned</td>
                        </tr>
                        <tr>
                          <td>
                            <div className="pd-user-row">
                              <div className="pd-user-img" style={{background: '#ffeaa7', color: '#111'}}>AW</div>
                              Audrey Webb
                            </div>
                          </td>
                          <td>1134</td>
                          <td>PT</td>
                          <td><strong>Hospitalized</strong></td>
                          <td>Unassigned</td>
                        </tr>
                  </tbody>
                </table>
              </div>

              <div className="pd-schedule-card">
                <div className="pd-cal-header">
                  <h3>November</h3>
                </div>
                <div className="pd-days-row">
                  <div className="pd-day-col"><span className="pd-day-name">Mon</span><span className="pd-day-num outlined">20</span></div>
                  <div className="pd-day-col"><span className="pd-day-name">Tue</span><span className="pd-day-num outlined">21</span></div>
                  <div className="pd-day-col"><span className="pd-day-name">Wed</span><span className="pd-day-num active">22</span></div>
                  <div className="pd-day-col"><span className="pd-day-name">Thu</span><span className="pd-day-num outlined">23</span></div>
                  <div className="pd-day-col"><span className="pd-day-name">Fri</span><span className="pd-day-num outlined">24</span></div>
                </div>
                <div className="pd-timeline">
                      <div className="pd-time-row"><span className="pd-time-label">07:00</span></div>
                      <div className="pd-time-row">
                        <span className="pd-time-label">08:00</span>
                        <div className="pd-event-block" style={{top: '-15px', height: '60px'}}>
                          <div className="pd-event-title">Checkup with Matthew</div>
                          <div className="pd-event-time">07:30 - 08:30</div>
                        </div>
                      </div>
                      <div className="pd-time-row"><span className="pd-time-label">09:00</span></div>
                      <div className="pd-time-row"><span className="pd-time-label">10:00</span></div>
                </div>
              </div>
            </div>
          </>
        )}

"""

with open('src/pages/PatientDashboard.js', 'w', encoding='utf-8') as f:
    f.write(prefix.replace("import './PatientDashboard.css';", "import './PatientDashboardUIUX.css';") + new_return + suffix + "\n      </div>\n    </div>\n  );\n};\n\nexport default PatientDashboard;\n")

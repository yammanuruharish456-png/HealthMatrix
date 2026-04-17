import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const { user } = useContext(AuthContext);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedSchedules, setUpdatedSchedules] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('/api/schedules/my-schedule');
      setSchedule(res.data.schedule);
      setUpdatedSchedules(res.data.schedule.schedules);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch schedule');
      setLoading(false);
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...updatedSchedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setUpdatedSchedules(newSchedules);
  };

  const handleSaveSchedule = async () => {
    try {
      await axios.put('/api/schedules/my-schedule', { schedules: updatedSchedules });
      toast.success('Schedule updated successfully');
      setSchedule({ ...schedule, schedules: updatedSchedules });
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  if (loading) return <div className="loading">Loading schedule...</div>;

  return (
    <div className="doctor-schedule-container">
      <div className="schedule-header">
        <h2>📅 My Schedule</h2>
        <button 
          className={`btn-primary ${editing ? 'btn-cancel' : ''}`}
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : 'Edit Schedule'}
        </button>
      </div>

      <div className="schedule-grid">
        {updatedSchedules.map((daySchedule, index) => (
          <div key={index} className="schedule-card">
            <div className="day-header">
              <h3>{daySchedule.dayOfWeek}</h3>
              {editing && (
                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={daySchedule.isAvailable}
                    onChange={(e) => handleScheduleChange(index, 'isAvailable', e.target.checked)}
                  />
                  <span>{daySchedule.isAvailable ? 'Available' : 'Not Available'}</span>
                </label>
              )}
            </div>

            {daySchedule.isAvailable && (
              <div className="schedule-details">
                {editing ? (
                  <>
                    <div className="time-input">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={daySchedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div className="time-input">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={daySchedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                    <div className="time-input">
                      <label>Slot Duration (minutes)</label>
                      <select
                        value={daySchedule.slotDuration}
                        onChange={(e) => handleScheduleChange(index, 'slotDuration', parseInt(e.target.value))}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>
                    <div className="time-input">
                      <label>Max Patients/Day</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={daySchedule.maxPatientsPerDay}
                        onChange={(e) => handleScheduleChange(index, 'maxPatientsPerDay', parseInt(e.target.value))}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>⏰ Time:</strong> {daySchedule.startTime} - {daySchedule.endTime}</p>
                    <p><strong>⏱️ Slot Duration:</strong> {daySchedule.slotDuration} minutes</p>
                    <p><strong>👥 Max Patients:</strong> {daySchedule.maxPatientsPerDay}</p>
                  </>
                )}
              </div>
            )}

            {!daySchedule.isAvailable && !editing && (
              <p className="not-available">Not Available</p>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="schedule-actions">
          <button className="btn-primary" onClick={handleSaveSchedule}>
            Save Schedule
          </button>
          <button className="btn-secondary" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;

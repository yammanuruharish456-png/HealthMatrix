import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Appointment from './pages/Appointment';
import MyAppointments from './pages/MyAppointments';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import LabTechnicianLogin from './pages/LabTechnicianLogin';
import LabTechnicianRegister from './pages/LabTechnicianRegister';
import LabTechnicianDashboard from './pages/LabTechnicianDashboard';
import ReceptionistLogin from './pages/ReceptionistLogin';
import ReceptionistRegister from './pages/ReceptionistRegister';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import NurseLogin from './pages/NurseLogin';
import NurseRegister from './pages/NurseRegister';
import NurseDashboard from './pages/NurseDashboard';
import DoctorSchedule from './pages/DoctorSchedule';
import ReceptionistPatientBooking from './pages/ReceptionistPatientBooking';
import PremiumFrontend from './pages/PremiumFrontend';

function AppContent() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PremiumFrontend />} />
        <Route path="/premium" element={<PremiumFrontend />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-schedule" element={<DoctorSchedule />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="/lab-technician-login" element={<LabTechnicianLogin />} />
        <Route path="/lab-technician-register" element={<LabTechnicianRegister />} />
        <Route path="/lab-technician-dashboard" element={<LabTechnicianDashboard />} />
        <Route path="/receptionist-login" element={<ReceptionistLogin />} />
        <Route path="/receptionist-register" element={<ReceptionistRegister />} />
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
        <Route path="/nurse-login" element={<NurseLogin />} />
        <Route path="/nurse-register" element={<NurseRegister />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/receptionist-patient-booking" element={<ReceptionistPatientBooking />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

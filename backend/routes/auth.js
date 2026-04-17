const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const { protect } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      role: role || 'patient',
      isVerified: role === 'doctor' ? false : true // Doctors need verification
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Doctor Registration
router.post('/doctor-register', async (req, res) => {
  try {
    const { name, email, password, phone, specialization, nmcRegistrationNumber, qualification, experience, consultationFee, about } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user account
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'doctor',
      isVerified: false // Pending admin verification
    });

    // Create doctor profile
    await Doctor.create({
      userId: user._id,
      name,
      email,
      phone,
      specialization,
      nmcRegistrationNumber,
      qualification,
      experience,
      consultationFee,
      about,
      isActive: false, // Inactive until verified
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Please wait for admin verification.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Staff Registration (Lab Technician / Receptionist)
router.post('/staff-register', async (req, res) => {
  try {
    const { name, email, password, phone, role, employeeId, department, qualification, experience, shift } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      isVerified: false
    });

    await Staff.create({
      userId: user._id,
      name,
      email,
      phone,
      role,
      employeeId,
      department,
      qualification,
      experience,
      shift,
      isActive: false,
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Please wait for admin verification.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Patient Login - Send OTP
router.post('/patient-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email, role: 'patient' });
    if (!user) {
      return res.status(404).json({ message: 'Patient account not found with this email' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const emailSent = await sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
      email: email
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Patient Login - Verify OTP
router.post('/patient-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email, role: 'patient' });
    if (!user) {
      return res.status(404).json({ message: 'Patient account not found' });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login (for other roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if staff/doctor needs verification
    if ((user.role === 'doctor' || user.role === 'lab_technician' || user.role === 'receptionist' || user.role === 'nurse') && user.isVerified === false) {
      return res.status(403).json({ message: 'Your account is pending admin verification' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Login (all supported roles)
router.post('/google-login', async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential || !role) {
      return res.status(400).json({ message: 'Google credential and role are required' });
    }

    const allowedRoles = ['patient', 'doctor', 'admin', 'lab_technician', 'receptionist', 'nurse'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role for Google login' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Sign-In is not configured on server' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    const name = payload?.name || 'Google User';

    if (!payload?.email_verified || !email) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    let user = await User.findOne({ email });

    // For patient portal, auto-create account on first Google login.
    if (!user && role === 'patient') {
      user = await User.create({
        name,
        email,
        password: `google_${Math.random().toString(36).slice(2)}_${Date.now()}`,
        role: 'patient',
        isVerified: true
      });
    }

    if (!user) {
      return res.status(404).json({
        message: `No ${role.replace('_', ' ')} account found for this Google email`
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This Google account is registered as ${user.role}. Use the correct portal.`
      });
    }

    if (
      (user.role === 'doctor' || user.role === 'lab_technician' || user.role === 'receptionist' || user.role === 'nurse') &&
      user.isVerified === false
    ) {
      return res.status(403).json({ message: 'Your account is pending admin verification' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    const rawMessage = error?.message || 'Unknown Google auth error';
    console.error('Google Sign-In error:', rawMessage);

    let message = 'Google Sign-In failed. Please try again.';

    if (/wrong recipient|audience|aud/i.test(rawMessage)) {
      message = 'Google Client ID mismatch. Check OAuth client ID in frontend and backend env files.';
    } else if (/origin|origin_mismatch/i.test(rawMessage)) {
      message = 'Google OAuth origin mismatch. Add the exact frontend URL in Authorized JavaScript origins.';
    } else if (/expired|used too late|token has expired/i.test(rawMessage)) {
      message = 'Google credential expired. Please try signing in again.';
    } else if (/not allowed|access blocked|unauthorized|forbidden/i.test(rawMessage)) {
      message = 'Google account is not allowed for this app. Add it as a Test User in OAuth consent screen.';
    }

    const response = { message };
    if (process.env.NODE_ENV !== 'production') {
      response.details = rawMessage;
    }

    res.status(401).json(response);
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, dateOfBirth, gender, address },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

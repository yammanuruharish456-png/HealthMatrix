const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests and same-origin requests without Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/specialties', require('./routes/specialties'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/lab-reports', require('./routes/labReports'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/receptionist', require('./routes/receptionist'));
app.use('/api/callbacks', require('./routes/callbacks'));
app.use('/api/medical-history', require('./routes/medicalHistory'));
app.use('/api/vital-signs', require('./routes/vitalSigns'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/nurse', require('./routes/nurse'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health Matrix Hospital API is running' });
});

// Serve React build from the backend in production.
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.resolve(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }

    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

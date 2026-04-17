# Health Matrix Hospital - MERN Stack Application

A comprehensive hospital management website built with MongoDB, Express.js, React, and Node.js.

## Features

- User Authentication (Register/Login)
- Doctor Listings with Search and Filter
- Appointment Booking System
- Multiple Medical Specialties
- Emergency Services Information
- Contact Form
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration (already created, update values):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health_matrix_hospital
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

4. Start the backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## Database Seeding (Optional)

To populate the database with sample doctors and specialties, you can create seed scripts or manually add data through MongoDB.

## Project Structure

```
hospital/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context API
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Doctors
- GET /api/doctors - Get all doctors
- GET /api/doctors/:id - Get single doctor
- POST /api/doctors/:id/reviews - Add review

### Appointments
- POST /api/appointments - Create appointment
- GET /api/appointments - Get user appointments
- GET /api/appointments/:id - Get single appointment
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Cancel appointment

### Specialties
- GET /api/specialties - Get all specialties
- GET /api/specialties/:id - Get single specialty

### Contact
- POST /api/contact - Submit contact form

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- bcryptjs - Password hashing

### Frontend
- React - UI library
- React Router - Routing
- Axios - HTTP client
- React Icons - Icons
- React Toastify - Notifications

## Features to Add (Future Enhancements)

- Payment Integration
- Admin Dashboard
- Doctor Dashboard
- Medical Records Management
- Prescription Management
- Video Consultation
- Email Notifications
- SMS Notifications

## License

This project is for educational purposes.

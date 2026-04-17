# Amedic Hospital - Complete Setup Guide

## 🏥 Project Overview

A full-stack hospital management website inspired by Apollo Hospital, built with the MERN stack (MongoDB, Express.js, React, Node.js). The website includes patient registration, doctor listings, appointment booking, and comprehensive hospital information.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js) or **yarn**
- A code editor (VS Code recommended)

## 🚀 Installation Steps

### Step 1: Install MongoDB

1. Download and install MongoDB Community Server
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

3. Verify MongoDB is running:
   ```bash
   mongosh
   ```
   If connected successfully, you'll see the MongoDB shell.

### Step 2: Backend Setup

1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install all backend dependencies:
   ```bash
   npm install
   ```

3. Verify the `.env` file exists with these settings:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/health_matrix_hospital
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=7d
   ```

4. Seed the database with sample data:
   ```bash
   node seed.js
   ```
   You should see:
   - "Specialties seeded successfully"
   - "Doctors seeded successfully"
   - "Database seeded successfully!"

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will start on http://localhost:5000

### Step 3: Frontend Setup

1. Open a NEW terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install all frontend dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The application will automatically open in your browser at http://localhost:3000

## 🎯 Testing the Application

### 1. Register a New Patient Account
- Click "Login" in the top right
- Click "Register" 
- Fill in the registration form
- Submit to create your account

### 2. Browse Doctors
- Navigate to "Find a Doctor"
- Search by name or filter by specialty
- View doctor profiles with ratings and qualifications

### 3. Book an Appointment
- Click "Book Appointment" button
- Fill in patient details
- Select specialty and doctor
- Choose date and time slot
- Submit the appointment

### 4. View Your Appointments
- After logging in, click "My Appointments"
- View all your scheduled appointments
- Cancel appointments if needed

### 5. Explore Other Features
- Browse medical specialties
- View services offered
- Check emergency care information
- Use the contact form

## 📁 Project Structure

```
hospital/
├── backend/
│   ├── models/
│   │   ├── User.js              # Patient/User model
│   │   ├── Doctor.js            # Doctor model
│   │   ├── Appointment.js       # Appointment model
│   │   ├── Specialty.js         # Medical specialty model
│   │   └── Contact.js           # Contact form model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── doctors.js           # Doctor routes
│   │   ├── appointments.js      # Appointment routes
│   │   ├── specialties.js       # Specialty routes
│   │   ├── patients.js          # Patient routes
│   │   └── contact.js           # Contact routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── server.js                # Express server setup
│   ├── seed.js                  # Database seeding script
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js        # Navigation header
│   │   │   ├── Header.css
│   │   │   ├── Footer.js        # Footer component
│   │   │   └── Footer.css
│   │   ├── pages/
│   │   │   ├── Home.js          # Homepage
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── Doctors.js       # Doctor listing
│   │   │   ├── DoctorDetail.js  # Doctor profile
│   │   │   ├── Appointment.js   # Appointment booking
│   │   │   ├── MyAppointments.js # User appointments
│   │   │   ├── Specialties.js   # Medical specialties
│   │   │   ├── About.js         # About page
│   │   │   ├── Contact.js       # Contact page
│   │   │   ├── Services.js      # Services page
│   │   │   ├── Emergency.js     # Emergency info
│   │   │   └── [CSS files]
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── App.js               # Main app component
│   │   ├── App.css
│   │   ├── index.js             # React entry point
│   │   └── index.css
│   └── package.json
├── README.md
├── SETUP_GUIDE.md
└── .gitignore
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check if port 27017 is available
- Verify MONGODB_URI in .env file

### Port Already in Use
- Backend (5000): Change PORT in backend/.env
- Frontend (3000): React will prompt to use another port

### Dependencies Installation Fails
- Delete node_modules folder
- Delete package-lock.json
- Run `npm install` again

### CORS Errors
- Ensure backend is running on port 5000
- Check proxy setting in frontend/package.json

## 🌟 Key Features

### Patient Features
- ✅ User registration and authentication
- ✅ Browse doctors by specialty
- ✅ View doctor profiles and ratings
- ✅ Book appointments online
- ✅ View and manage appointments
- ✅ Contact hospital

### Doctor Information
- ✅ Detailed profiles with qualifications
- ✅ Specialization and experience
- ✅ Availability schedules
- ✅ Patient reviews and ratings
- ✅ Consultation fees

### Hospital Information
- ✅ Multiple medical specialties
- ✅ Services offered
- ✅ 24/7 emergency care
- ✅ About hospital
- ✅ Contact information

## 🔐 Sample Login Credentials

After seeding the database, you can register new patients. The seeded doctors are for display purposes only.

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Doctor Endpoints
- `GET /api/doctors` - Get all doctors (with optional filters)
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors/:id/reviews` - Add review to doctor

### Appointment Endpoints
- `POST /api/appointments` - Create appointment (requires auth)
- `GET /api/appointments` - Get user appointments (requires auth)
- `GET /api/appointments/:id` - Get single appointment (requires auth)
- `PUT /api/appointments/:id` - Update appointment (requires auth)
- `DELETE /api/appointments/:id` - Cancel appointment (requires auth)

### Specialty Endpoints
- `GET /api/specialties` - Get all specialties
- `GET /api/specialties/:id` - Get single specialty

### Contact Endpoint
- `POST /api/contact` - Submit contact form

## 🚀 Deployment (Optional)

### Backend Deployment (Heroku/Railway)
1. Create account on hosting platform
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the build folder
3. Update API endpoint to production URL

### Database (MongoDB Atlas)
1. Create free cluster on MongoDB Atlas
2. Get connection string
3. Update MONGODB_URI in .env

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the code comments
- Ensure all dependencies are installed
- Verify MongoDB is running

## 🎉 Success!

If you've followed all steps correctly, you should now have a fully functional hospital management website running locally!

Visit http://localhost:3000 to see your application in action.

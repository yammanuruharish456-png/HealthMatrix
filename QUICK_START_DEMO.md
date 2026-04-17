# 🚀 Quick Start Guide - Health Matrix Hospital Demo

## Prerequisites Check
```bash
node --version    # Should be v14 or higher
mongod --version  # Should be v4.4 or higher
npm --version     # Should be v6 or higher
```

## Step-by-Step Setup (5 minutes)

### 1. Start MongoDB
```bash
# Windows
# MongoDB should start automatically as a service
# Or manually: "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Seed Database with Demo Data
```bash
node seedWithUsers.js
```

**Expected Output:**
```
MongoDB connected
✅ Specialties seeded successfully
✅ Users seeded successfully
✅ Doctors seeded successfully

🎉 Database seeded successfully!

📝 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨💼 Admin:
   Email: admin@healthmatrix.com
   Password: admin123

👨⚕️ Doctor (any of these):
   Email: sarah.johnson@healthmatrix.com
   Password: doctor123

👤 Patient:
   Register a new account at /register
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
```

### 5. Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

### 6. Start Frontend Server
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view health-matrix-hospital-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## 🎭 Demo Walkthrough

### DEMO 1: Patient Journey (5 minutes)

#### Step 1: Register as Patient
1. Open http://localhost:3000
2. Click "Login" → "Register"
3. Fill form:
   - Name: John Doe
   - Email: john.doe@email.com
   - Password: password123
   - Phone: +1-555-0123
   - DOB: 1990-01-15
   - Gender: Male
4. Click "Register"

#### Step 2: Browse Doctors
1. Click "Find a Doctor"
2. Search: "Sarah"
3. Filter: "Cardiology"
4. Click "View Profile" on Dr. Sarah Johnson

#### Step 3: Book Appointment
1. Click "Book Appointment"
2. Fill form:
   - Specialty: Cardiology
   - Doctor: Dr. Sarah Johnson
   - Date: Tomorrow
   - Time: 09:00 AM
   - Reason: "Regular checkup for chest pain"
3. Click "Book Appointment"

#### Step 4: View Appointments
1. Click "My Appointments" in header
2. See your booked appointment
3. Note the "Pending" status

---

### DEMO 2: Doctor Workflow (5 minutes)

#### Step 1: Doctor Login
1. Logout (if logged in)
2. Click "Login"
3. Enter:
   - Email: sarah.johnson@healthmatrix.com
   - Password: doctor123
4. Click "Login"

#### Step 2: View Dashboard
1. Automatically redirected to Doctor Dashboard
2. See statistics:
   - Total Appointments
   - Pending
   - Confirmed
   - Completed

#### Step 3: Confirm Appointment
1. Scroll to "Today's Appointments"
2. Find John Doe's appointment
3. Click "Confirm"
4. Status changes to "Confirmed"

#### Step 4: Complete Consultation
1. Click "Complete Consultation"
2. Add notes: "Patient has mild hypertension. BP 140/90."
3. Add prescription: "Lisinopril 10mg, once daily"
4. Click "Save & Complete"

#### Step 5: View All Appointments
1. Scroll to appointments table
2. See all appointments with statuses

---

### DEMO 3: Admin Operations (5 minutes)

#### Step 1: Admin Login
1. Logout
2. Click "Login"
3. Enter:
   - Email: admin@healthmatrix.com
   - Password: admin123
4. Click "Login"

#### Step 2: Dashboard Overview
1. Automatically redirected to Admin Dashboard
2. See statistics:
   - Total Patients
   - Total Doctors
   - Total Appointments
   - Contact Inquiries

#### Step 3: View Doctors
1. Click "Doctors" tab
2. See all 6 doctors with details
3. Note ratings, experience, fees

#### Step 4: Add New Doctor
1. Click "Add Doctor"
2. Fill form:
   - Name: Dr. James Wilson
   - Email: james.wilson@healthmatrix.com
   - Phone: +1-800-123-4507
   - Specialization: Cardiology
   - Qualifications: MD, MBBS, Fellowship
   - Experience: 20
   - Fee: 200
   - About: "Experienced cardiologist..."
3. Click "Add Doctor"
4. See new doctor in list

#### Step 5: Manage Appointments
1. Click "Appointments" tab
2. See all appointments across all doctors
3. Confirm any pending appointments

#### Step 6: View Contact Inquiries
1. Click "Contact Inquiries" tab
2. See all contact form submissions
3. Note status indicators

---

## 🎯 Quick Test Scenarios

### Scenario A: Complete Patient Flow
```
Register → Browse Doctors → Book Appointment → View My Appointments
Time: 3 minutes
```

### Scenario B: Doctor Consultation
```
Login as Doctor → View Dashboard → Confirm Appointment → Complete Consultation
Time: 3 minutes
```

### Scenario C: Admin Management
```
Login as Admin → View Stats → Add Doctor → Manage Appointments
Time: 3 minutes
```

---

## 📋 Pre-Seeded Data

### Users
- **1 Admin**: admin@healthmatrix.com
- **6 Doctors**: sarah.johnson@healthmatrix.com, michael.chen@healthmatrix.com, etc.
- **0 Patients**: Register during demo

### Doctors
1. Dr. Sarah Johnson - Cardiology (15 years, $150)
2. Dr. Michael Chen - Oncology (12 years, $200)
3. Dr. Emily Rodriguez - Neurology (10 years, $180)
4. Dr. David Thompson - Orthopedics (18 years, $160)
5. Dr. Lisa Anderson - Pediatrics (14 years, $120)
6. Dr. Robert Martinez - Gastroenterology (16 years, $170)

### Specialties
1. Cardiology
2. Oncology
3. Neurology
4. Orthopedics
5. Pediatrics
6. Gastroenterology

---

## 🔧 Troubleshooting

### Issue: MongoDB not connecting
**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Issue: Port 5000 already in use
**Solution:**
```bash
# Change PORT in backend/.env
PORT=5001

# Update proxy in frontend/package.json
"proxy": "http://localhost:5001"
```

### Issue: Port 3000 already in use
**Solution:**
React will automatically prompt to use port 3001. Press 'Y' to accept.

### Issue: Cannot login
**Solution:**
```bash
# Re-seed the database
cd backend
node seedWithUsers.js
```

### Issue: Appointments not showing
**Solution:**
1. Ensure you're logged in
2. Check browser console for errors
3. Verify backend is running on port 5000

---

## 📊 Demo Checklist

### Before Demo
- [ ] MongoDB is running
- [ ] Database is seeded
- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3000)
- [ ] Browser is open to http://localhost:3000
- [ ] All credentials are ready

### During Demo
- [ ] Show patient registration
- [ ] Demonstrate doctor search
- [ ] Book an appointment
- [ ] Login as doctor
- [ ] Confirm and complete appointment
- [ ] Login as admin
- [ ] Add new doctor
- [ ] Manage appointments

### After Demo
- [ ] Show responsive design
- [ ] Highlight key features
- [ ] Explain technical stack
- [ ] Answer questions

---

## 🎥 Recording Tips

### Screen Recording Settings
- Resolution: 1920x1080
- Frame Rate: 30 FPS
- Audio: Enable microphone
- Cursor: Highlight clicks

### Recommended Tools
- **Windows**: OBS Studio, Camtasia
- **Mac**: QuickTime, ScreenFlow
- **Cross-platform**: OBS Studio, Loom

### Demo Flow
1. Start with homepage (30 sec)
2. Patient journey (5 min)
3. Doctor workflow (5 min)
4. Admin operations (5 min)
5. Features showcase (2 min)
6. Conclusion (1 min)

**Total Time: ~18 minutes**

---

## 🌟 Key Features to Highlight

1. ✅ **Three User Roles** - Patient, Doctor, Admin
2. ✅ **Complete Workflow** - Registration to consultation
3. ✅ **Real-time Updates** - Status changes instantly
4. ✅ **Search & Filter** - Find doctors easily
5. ✅ **Responsive Design** - Works on all devices
6. ✅ **Secure Authentication** - JWT-based
7. ✅ **Professional UI** - Modern and intuitive
8. ✅ **Full MERN Stack** - MongoDB, Express, React, Node.js

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check console for error messages
5. Review the SETUP_GUIDE.md for detailed instructions

---

## 🎉 Success!

If everything is working:
- ✅ Homepage loads at http://localhost:3000
- ✅ Can register and login as patient
- ✅ Can browse and book appointments
- ✅ Can login as doctor and manage appointments
- ✅ Can login as admin and manage system

**You're ready to demo! 🚀**

# 🎭 Health Matrix Hospital - Complete Actor Demo Guide

## Overview of Actors

The Health Matrix Hospital system has **3 main actors**:
1. **Patient** - Books appointments, views doctors, manages their health records
2. **Doctor** - Views appointments, manages schedule, updates patient records
3. **Admin** - Manages doctors, appointments, specialties, and overall system

---

## 🏥 ACTOR 1: PATIENT

### Patient Journey & Features

#### 1. Registration & Login
**Steps:**
1. Visit http://localhost:3000
2. Click "Login" in top-right corner
3. Click "Register" link
4. Fill in registration form:
   - Full Name: John Doe
   - Email: john.doe@email.com
   - Password: password123
   - Phone: +1-555-0123
   - Date of Birth: 1990-01-15
   - Gender: Male
5. Click "Register"
6. Automatically logged in and redirected to homepage

**What Patient Can See After Login:**
- Welcome message with their name
- "My Appointments" link in header
- "Logout" button

#### 2. Browse Doctors
**Steps:**
1. Click "Find a Doctor" in navigation
2. Use search box to search by name (e.g., "Sarah")
3. Filter by specialty using dropdown (e.g., "Cardiology")
4. View doctor cards showing:
   - Doctor photo
   - Name and specialization
   - Years of experience
   - Rating (out of 5 stars)
5. Click "View Profile" on any doctor

#### 3. View Doctor Profile
**What Patient Sees:**
- Doctor's full profile with photo
- Specialization and qualifications
- Years of experience
- Consultation fee
- About section
- Patient reviews and ratings
- "Book Appointment" button

#### 4. Book an Appointment
**Steps:**
1. Click "Book Appointment" (from doctor profile or header)
2. Fill in appointment form:
   - Patient Name: (auto-filled)
   - Email: (auto-filled)
   - Phone: +1-555-0123
   - Specialty: Select "Cardiology"
   - Select Doctor: Choose "Dr. Sarah Johnson"
   - Appointment Date: Select future date
   - Time Slot: Choose "09:00 AM"
   - Reason for Visit: "Regular checkup for chest pain"
3. Click "Book Appointment"
4. See success message
5. Redirected to "My Appointments"

#### 5. View My Appointments
**Steps:**
1. Click "My Appointments" in header
2. See all booked appointments with:
   - Status badge (Pending/Confirmed/Completed/Cancelled)
   - Doctor name
   - Date and time
   - Specialty
   - Reason for visit
3. For pending appointments, see "Cancel Appointment" button

#### 6. Cancel Appointment
**Steps:**
1. In "My Appointments" page
2. Click "Cancel Appointment" on any pending appointment
3. Confirm cancellation in popup
4. Appointment status changes to "Cancelled"
5. See success message

#### 7. Explore Hospital Information
**Patient Can Access:**
- **Specialties Page**: View all 8 medical specialties with services
- **Services Page**: See all hospital services (Emergency, Diagnostics, etc.)
- **Emergency Page**: 24/7 emergency contact and information
- **About Page**: Hospital history, mission, vision, achievements
- **Contact Page**: Submit inquiries via contact form

#### 8. Submit Contact Form
**Steps:**
1. Click "Contact" in navigation
2. Fill in form:
   - Name: John Doe
   - Email: john.doe@email.com
   - Phone: +1-555-0123
   - Subject: "Insurance inquiry"
   - Message: "Do you accept Blue Cross insurance?"
3. Click "Send Message"
4. See success confirmation

---

## 👨‍⚕️ ACTOR 2: DOCTOR

### Doctor Dashboard & Features

#### 1. Doctor Login
**Steps:**
1. Visit http://localhost:3000/login
2. Login with doctor credentials:
   - Email: sarah.johnson@healthmatrix.com
   - Password: doctor123
3. Redirected to Doctor Dashboard

**Note:** You need to create doctor login functionality. Let me add that now.

#### 2. View Appointments
**What Doctor Sees:**
- List of all appointments assigned to them
- Patient details (name, contact)
- Appointment date and time
- Reason for visit
- Appointment status
- Action buttons (Confirm, Complete, Reschedule)

#### 3. Manage Appointments
**Doctor Can:**
- **Confirm Appointments**: Change status from Pending to Confirmed
- **Complete Appointments**: Mark as completed after consultation
- **Add Notes**: Add consultation notes
- **Add Prescription**: Write prescriptions for patients
- **Reschedule**: Change appointment date/time

#### 4. View Patient History
**Doctor Can Access:**
- Patient's previous appointments
- Medical history
- Previous prescriptions
- Test results

#### 5. Manage Schedule
**Doctor Can:**
- View their weekly schedule
- Mark time slots as available/unavailable
- Set vacation days
- Update consultation fees

#### 6. View Profile
**Doctor Can:**
- Update their profile information
- Add/edit qualifications
- Update about section
- View patient reviews

---

## 👨‍💼 ACTOR 3: ADMIN

### Admin Dashboard & Features

#### 1. Admin Login
**Steps:**
1. Visit http://localhost:3000/login
2. Login with admin credentials:
   - Email: admin@healthmatrix.com
   - Password: admin123
3. Redirected to Admin Dashboard

#### 2. Dashboard Overview
**Admin Sees:**
- Total statistics:
  - Total Patients
  - Total Doctors
  - Total Appointments
  - Revenue (if payment integrated)
- Recent appointments
- Recent registrations
- System alerts

#### 3. Manage Doctors
**Admin Can:**

**Add New Doctor:**
1. Click "Doctors" in admin menu
2. Click "Add New Doctor"
3. Fill in form:
   - Name: Dr. James Wilson
   - Email: james.wilson@amedic.com
   - Phone: +1-800-123-4507
   - Specialization: Cardiology
   - Qualifications: MD, MBBS, Fellowship
   - Experience: 20 years
   - Consultation Fee: $200
   - About: Brief description
   - Upload photo
4. Set availability schedule
5. Click "Add Doctor"

**Edit Doctor:**
1. Click "Edit" on any doctor
2. Update information
3. Save changes

**Deactivate Doctor:**
1. Click "Deactivate" on any doctor
2. Doctor won't appear in patient search
3. Can reactivate later

#### 4. Manage Appointments
**Admin Can:**
- View all appointments (all doctors, all patients)
- Filter by:
  - Date range
  - Doctor
  - Specialty
  - Status
- Manually create appointments
- Reschedule appointments
- Cancel appointments
- Export appointment data

#### 5. Manage Patients
**Admin Can:**
- View all registered patients
- Search patients by name/email
- View patient details
- View patient appointment history
- Deactivate patient accounts
- Reset patient passwords

#### 6. Manage Specialties
**Admin Can:**

**Add New Specialty:**
1. Click "Specialties" in admin menu
2. Click "Add Specialty"
3. Fill in:
   - Name: Dermatology
   - Description: Skin care and treatment
   - Services: Acne treatment, Skin cancer screening, etc.
   - Icon: Select icon
4. Click "Add"

**Edit/Delete Specialties:**
- Update specialty information
- Add/remove services
- Deactivate specialties

#### 7. Manage Contact Inquiries
**Admin Can:**
- View all contact form submissions
- Mark as "New", "In Progress", "Resolved"
- Reply to inquiries
- Archive old inquiries

#### 8. Reports & Analytics
**Admin Can View:**
- Appointment statistics
- Revenue reports
- Doctor performance
- Patient demographics
- Popular specialties
- Peak appointment times

#### 9. System Settings
**Admin Can:**
- Update hospital information
- Manage working hours
- Set appointment duration
- Configure email notifications
- Manage user roles and permissions

---

## 🎬 COMPLETE DEMO SCENARIOS

### Scenario 1: Patient Books First Appointment

**Timeline:**
1. **Patient (John)**: Registers account → Browses doctors → Finds Dr. Sarah Johnson (Cardiologist) → Books appointment for chest pain
2. **System**: Sends confirmation email to patient and notification to doctor
3. **Doctor (Sarah)**: Logs in → Sees new appointment → Reviews patient details → Confirms appointment
4. **System**: Sends confirmation to patient
5. **Patient (John)**: Receives confirmation → Sees "Confirmed" status in My Appointments

### Scenario 2: Doctor Manages Daily Appointments

**Timeline:**
1. **Doctor (Sarah)**: Logs in at 8:00 AM
2. Views today's schedule: 5 appointments
3. **9:00 AM**: Patient John arrives → Doctor marks "In Progress"
4. After consultation: Adds notes "Patient has mild hypertension"
5. Writes prescription: "Lisinopril 10mg, once daily"
6. Marks appointment as "Completed"
7. Patient receives prescription via email

### Scenario 3: Admin Adds New Doctor

**Timeline:**
1. **Admin**: Logs in → Goes to "Doctors" section
2. Clicks "Add New Doctor"
3. Fills in Dr. James Wilson's details
4. Sets availability: Mon-Fri, 9 AM - 5 PM
5. Uploads doctor's photo and credentials
6. Activates doctor profile
7. **System**: Creates doctor account, sends welcome email
8. **Doctor (James)**: Receives credentials, logs in, completes profile
9. **Patients**: Can now see and book with Dr. James Wilson

### Scenario 4: Emergency Appointment

**Timeline:**
1. **Patient (Emergency)**: Calls hospital emergency number
2. **Admin/Receptionist**: Logs into system
3. Quickly creates emergency appointment
4. Assigns to available doctor
5. Marks as "Urgent" priority
6. **Doctor**: Receives immediate notification
7. Patient treated immediately

---

## 📊 DEMO DATA SUMMARY

### Pre-seeded Data:
- **6 Doctors** across 6 specialties
- **6 Specialties** with services
- **0 Patients** (register during demo)
- **0 Appointments** (create during demo)

### Test Accounts to Create:

**Patients:**
- john.doe@email.com / password123
- jane.smith@email.com / password123
- mike.brown@email.com / password123

**Doctors:** (Already seeded)
- sarah.johnson@healthmatrix.com
- michael.chen@healthmatrix.com
- emily.rodriguez@healthmatrix.com

**Admin:** (Need to create)
- admin@healthmatrix.com / admin123

---

## 🎯 KEY FEATURES BY ACTOR

### Patient Features ✅
- ✅ Register & Login
- ✅ Browse Doctors
- ✅ View Doctor Profiles
- ✅ Book Appointments
- ✅ View My Appointments
- ✅ Cancel Appointments
- ✅ Contact Hospital
- ✅ View Specialties & Services

### Doctor Features (To Implement)
- 🔄 Doctor Dashboard
- 🔄 View Assigned Appointments
- 🔄 Confirm/Complete Appointments
- 🔄 Add Consultation Notes
- 🔄 Write Prescriptions
- 🔄 Manage Schedule
- 🔄 View Patient History

### Admin Features (To Implement)
- 🔄 Admin Dashboard
- 🔄 Manage Doctors (Add/Edit/Delete)
- 🔄 Manage All Appointments
- 🔄 Manage Patients
- 🔄 Manage Specialties
- 🔄 View Contact Inquiries
- 🔄 Reports & Analytics

---

## 🚀 RUNNING THE DEMO

### Quick Start:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Demo Flow:
1. **Start**: Open http://localhost:3000
2. **Register**: Create patient account
3. **Browse**: Explore doctors and specialties
4. **Book**: Make an appointment
5. **Manage**: View and manage appointments
6. **Contact**: Submit inquiry

### Next Steps:
I can now implement the Doctor and Admin dashboards with full functionality. Would you like me to proceed?

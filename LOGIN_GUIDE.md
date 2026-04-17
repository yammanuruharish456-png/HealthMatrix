# 🔐 COMPLETE LOGIN GUIDE - Health Matrix Hospital

## 📍 HOW TO ACCESS EACH LOGIN PAGE

### **1. PATIENT LOGIN**
- **URL:** http://localhost:3000/login
- **Or click:** "Patient" link in top-right header
- **Register:** Click "Register" link on login page

### **2. DOCTOR LOGIN**
- **URL:** http://localhost:3000/doctor-login
- **Or click:** "Doctor" link in top-right header
- **Register:** Click "Register as Doctor" link on login page

### **3. ADMIN LOGIN**
- **URL:** http://localhost:3000/admin-login
- **Or click:** "Admin" link in top-right header
- **Register:** Use admin signup with authorization code

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### **PATIENT FLOW:**

1. Go to http://localhost:3000
2. Click **"Patient"** in top-right corner
3. Click **"Register"** 
4. Fill form and submit
5. Automatically logged in
6. Access "My Appointments" from header

---

### **DOCTOR FLOW:**

#### **Step 1: Register as Doctor**
1. Go to http://localhost:3000
2. Click **"Doctor"** in top-right corner
3. Click **"Register as Doctor"**
4. Fill registration form:
   - Name: Dr. John Smith
   - Email: john.smith@email.com
   - Password: doctor123
   - Phone: +1-555-9999
   - **NMC Registration Number:** 12345 (any number for demo)
   - Specialization: Cardiology
   - Qualifications: MD, MBBS
   - Experience: 10
   - Consultation Fee: 150
   - About: Brief description
5. Click **"Submit Registration"**
6. You'll see: "Registration submitted! Please wait for admin verification."

#### **Step 2: Admin Verifies Doctor**
1. Admin logs in
2. Goes to **"Pending Verifications"** tab
3. Sees your application
4. Clicks **"Verify with NMC"**
5. NMC website opens in new tab
6. Admin confirms verification
7. Your account is approved

#### **Step 3: Doctor Login**
1. Go to http://localhost:3000/doctor-login
2. Enter your credentials
3. Click **"Login as Doctor"**
4. Redirected to Doctor Dashboard

---

### **ADMIN FLOW:**

#### **Option 1: Use Pre-seeded Admin**
```
Email: admin@healthmatrix.com
Password: admin123
```

#### **Option 2: Create New Admin**
1. Go to http://localhost:3000/admin-signup
2. Fill form:
   - Name: Admin Name
   - Email: newadmin@healthmatrix.com
   - Password: admin123
   - Phone: +1-555-0000
   - **Admin Authorization Code:** HEALTHMATRIX-ADMIN-2024
3. Click **"Create Admin Account"**
4. Login at http://localhost:3000/admin-login

---

## 🔄 COMPLETE DEMO WORKFLOW

### **Test Doctor Verification Process:**

**Step 1: Register Doctor**
```
1. Open: http://localhost:3000/doctor-login
2. Click "Register as Doctor"
3. Fill form with test data
4. Submit
```

**Step 2: Login as Admin**
```
1. Open: http://localhost:3000/admin-login
2. Email: admin@healthmatrix.com
3. Password: admin123
4. Login
```

**Step 3: Verify Doctor**
```
1. Click "Pending Verifications" tab
2. See new doctor application
3. Click "Verify with NMC"
4. NMC website opens
5. Click OK to approve (or Cancel to reject)
6. Doctor is now verified
```

**Step 4: Doctor Can Now Login**
```
1. Go to: http://localhost:3000/doctor-login
2. Enter doctor credentials
3. Successfully login
4. Access Doctor Dashboard
```

---

## 📊 LOGIN PAGES SUMMARY

| Role | Login URL | Register URL | Dashboard URL |
|------|-----------|--------------|---------------|
| **Patient** | /login | /register | /my-appointments |
| **Doctor** | /doctor-login | /doctor-register | /doctor-dashboard |
| **Admin** | /admin-login | /admin-signup | /admin-dashboard |

---

## 🎨 HEADER NAVIGATION

**When NOT logged in:**
```
Top-right shows: [Patient] [Doctor] [Admin]
```

**When logged in as Patient:**
```
Top-right shows: Welcome, John Doe | [My Appointments] | [Logout]
```

**When logged in as Doctor:**
```
Top-right shows: Welcome, Dr. Sarah Johnson | [Dashboard] | [Logout]
```

**When logged in as Admin:**
```
Top-right shows: Welcome, Admin User | [Dashboard] | [Logout]
```

---

## ⚙️ BACKEND SETUP

### **1. Update Database Schema**
The User and Doctor models now include:
- `isVerified` field (Boolean)
- `nmcRegistrationNumber` field (String)

### **2. Re-seed Database**
```bash
cd backend
node seedWithUsers.js
```

This creates:
- 1 Admin (verified)
- 6 Doctors (verified)
- 0 Patients (register during demo)

---

## 🔐 CREDENTIALS REFERENCE

### **Pre-seeded Admin:**
```
Email: admin@healthmatrix.com
Password: admin123
```

### **Pre-seeded Doctors (all verified):**
```
Email: sarah.johnson@healthmatrix.com
Password: doctor123

Email: michael.chen@healthmatrix.com
Password: doctor123
```

### **Admin Authorization Code:**
```
HEALTHMATRIX-ADMIN-2024
```

---

## ✅ VERIFICATION CHECKLIST

### **Patient Registration:**
- [ ] Can access /login
- [ ] Can register new account
- [ ] Automatically logged in after registration
- [ ] Can see "My Appointments" link

### **Doctor Registration:**
- [ ] Can access /doctor-login
- [ ] Can register with NMC number
- [ ] Sees "pending verification" message
- [ ] Cannot login until verified

### **Admin Verification:**
- [ ] Can access /admin-login
- [ ] Can see pending doctors
- [ ] NMC link opens in new tab
- [ ] Can approve or reject doctors

### **Doctor Login After Verification:**
- [ ] Can login successfully
- [ ] Redirected to dashboard
- [ ] Can manage appointments

---

## 🚨 TROUBLESHOOTING

### **Issue: Doctor can't login**
**Solution:** Check if admin has verified the doctor account

### **Issue: Admin signup fails**
**Solution:** Use correct authorization code: `HEALTHMATRIX-ADMIN-2024`

### **Issue: NMC link doesn't open**
**Solution:** Check browser popup blocker settings

### **Issue: "Pending verification" message**
**Solution:** Wait for admin to verify your doctor account

---

## 🎯 QUICK TEST COMMANDS

```bash
# 1. Start MongoDB
mongod

# 2. Seed database
cd backend
node seedWithUsers.js

# 3. Start backend
npm run dev

# 4. Start frontend (new terminal)
cd frontend
npm start

# 5. Open browser
http://localhost:3000
```

---

## 📝 NOTES

1. **Separate login pages** for each role
2. **Doctor verification** required before login
3. **NMC verification** through external link
4. **Admin authorization code** for admin signup
5. **Role-based redirects** after login

---

This system ensures proper verification of doctors through NMC before they can access the platform!

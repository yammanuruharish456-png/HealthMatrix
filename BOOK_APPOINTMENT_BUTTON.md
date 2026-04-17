# Book Appointment Button - Visibility Logic

## Overview
The "Book Appointment" button in the header now has conditional visibility based on user authentication status and role.

---

## Visibility Rules

### ✅ Button IS Visible When:

1. **User is NOT logged in** (No account opened)
   - Any visitor can see and click the button
   - Clicking redirects to appointment booking page
   - If not logged in, they'll be prompted to login first

2. **User IS logged in as PATIENT**
   - Patients can see and click the button
   - Can directly book appointments

### ❌ Button IS NOT Visible When:

1. **User is logged in as DOCTOR**
   - Doctors don't need to book appointments
   - They manage appointments from their dashboard

2. **User is logged in as ADMIN**
   - Admins don't book appointments
   - They manage the system

3. **User is logged in as LAB TECHNICIAN**
   - Lab technicians don't book appointments
   - They manage lab reports

4. **User is logged in as RECEPTIONIST**
   - Receptionists don't book appointments
   - They manage billing and patient info

---

## Code Implementation

### Header.js Logic

```javascript
{(!user || user.role === 'patient') && (
  <Link to="/appointment" className="appointment-btn">
    Book Appointment
  </Link>
)}
```

### Explanation

- `!user` - User is NOT logged in (no account)
- `user.role === 'patient'` - User IS logged in as patient
- `&&` - Show button if EITHER condition is true

---

## User Scenarios

### Scenario 1: Visitor (Not Logged In)
```
Status: No account
Button: ✅ VISIBLE
Action: Click → Go to appointment booking
Result: Prompted to login as patient
```

### Scenario 2: Patient (Logged In)
```
Status: Logged in as patient
Button: ✅ VISIBLE
Action: Click → Go to appointment booking
Result: Can book appointment directly
```

### Scenario 3: Doctor (Logged In)
```
Status: Logged in as doctor
Button: ❌ HIDDEN
Action: N/A
Result: Doctor sees their dashboard link instead
```

### Scenario 4: Admin (Logged In)
```
Status: Logged in as admin
Button: ❌ HIDDEN
Action: N/A
Result: Admin sees their dashboard link instead
```

### Scenario 5: Lab Technician (Logged In)
```
Status: Logged in as lab_technician
Button: ❌ HIDDEN
Action: N/A
Result: Lab tech sees their dashboard link instead
```

### Scenario 6: Receptionist (Logged In)
```
Status: Logged in as receptionist
Button: ❌ HIDDEN
Action: N/A
Result: Receptionist sees their dashboard link instead
```

---

## Header Layout by User Type

### For Non-Logged-In Users
```
┌─────────────────────────────────────────────────────────┐
│ Emergency: +1-800-HEALTH-MATRIX | info@healthmatrix.com │
│ [Patient] [Doctor] [Lab Tech] [Receptionist] [Admin]    │
├─────────────────────────────────────────────────────────┤
│ HEALTH MATRIX | Home | Specialties | Find a Doctor | ... │
│                                    [Book Appointment] ✅  │
└─────────────────────────────────────────────────────────┘
```

### For Logged-In Patient
```
┌─────────────────────────────────────────────────────────┐
│ Emergency: +1-800-HEALTH-MATRIX | info@healthmatrix.com │
│ Welcome, John Doe | [My Appointments] | [Logout]        │
├─────────────────────────────────────────────────────────┤
│ HEALTH MATRIX | Home | Specialties | Find a Doctor | ... │
│                                    [Book Appointment] ✅  │
└─────────────────────────────────────────────────────────┘
```

### For Logged-In Doctor
```
┌─────────────────────────────────────────────────────────┐
│ Emergency: +1-800-HEALTH-MATRIX | info@healthmatrix.com │
│ Welcome, Dr. Sarah | [Dashboard] | [Logout]             │
├─────────────────────────────────────────────────────────┤
│ HEALTH MATRIX | Home | Specialties | Find a Doctor | ... │
│                                                    ❌ (Hidden)
└─────────────────────────────────────────────────────────┘
```

### For Logged-In Admin
```
┌─────────────────────────────────────────────────────────┐
│ Emergency: +1-800-HEALTH-MATRIX | info@healthmatrix.com │
│ Welcome, Admin | [Dashboard] | [Logout]                 │
├─────────────────────────────────────────────────────────┤
│ HEALTH MATRIX | Home | Specialties | Find a Doctor | ... │
│                                                    ❌ (Hidden)
└─────────────────────────────────────────────────────────┘
```

---

## File Modified

**File:** `frontend/src/components/Header.js`

**Change:**
```javascript
// BEFORE
<Link to="/appointment" className="appointment-btn">
  Book Appointment
</Link>

// AFTER
{(!user || user.role === 'patient') && (
  <Link to="/appointment" className="appointment-btn">
    Book Appointment
  </Link>
)}
```

---

## Testing Checklist

- [ ] Non-logged-in user sees "Book Appointment" button
- [ ] Logged-in patient sees "Book Appointment" button
- [ ] Logged-in doctor does NOT see "Book Appointment" button
- [ ] Logged-in admin does NOT see "Book Appointment" button
- [ ] Logged-in lab technician does NOT see "Book Appointment" button
- [ ] Logged-in receptionist does NOT see "Book Appointment" button
- [ ] Button click works for non-logged-in users
- [ ] Button click works for logged-in patients
- [ ] Logout and verify button reappears

---

## User Experience Flow

### For Visitors
```
Visit Website
    ↓
See "Book Appointment" button
    ↓
Click button
    ↓
Redirected to appointment page
    ↓
Prompted to login as patient
    ↓
Login/Register
    ↓
Book appointment
```

### For Patients
```
Login as Patient
    ↓
See "Book Appointment" button
    ↓
Click button
    ↓
Go to appointment booking
    ↓
Book appointment directly
```

### For Other Staff
```
Login as Doctor/Admin/etc
    ↓
"Book Appointment" button HIDDEN
    ↓
See their role-specific dashboard link
    ↓
Access their dashboard
```

---

## Benefits

✅ **Better UX** - Users only see relevant actions
✅ **Cleaner Interface** - No unnecessary buttons
✅ **Role-Based Access** - Each role sees appropriate options
✅ **Encourages Booking** - Prominent for patients and visitors
✅ **Professional** - Organized and logical flow

---

## Future Enhancements

- Add tooltip explaining why button is hidden for non-patients
- Add "Book for Patient" option for admins/receptionists
- Add quick appointment booking modal for patients
- Add appointment history quick access

---

**Implementation Complete!** ✅

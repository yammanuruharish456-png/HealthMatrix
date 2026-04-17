# Patient OTP Login Implementation Guide

## Overview
Implemented secure OTP (One-Time Password) verification for patient login via email instead of traditional password-based login.

## Features Implemented

### ✅ Backend
1. **OTP Generation & Storage**
   - 6-digit random OTP
   - Stored in User model with expiry time
   - Valid for 10 minutes

2. **Email Service**
   - Professional HTML email template
   - Security warnings included
   - Sent via Gmail SMTP

3. **API Endpoints**
   - `POST /api/auth/patient-login-otp` - Send OTP to email
   - `POST /api/auth/patient-verify-otp` - Verify OTP and login

### ✅ Frontend
1. **Two-Step Login Process**
   - Step 1: Enter email → Receive OTP
   - Step 2: Enter OTP → Login

2. **User Features**
   - Resend OTP option
   - Change email option
   - Loading states
   - Input validation

## Configuration

### .env File (Already Configured)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yammanuruharish456@gmail.com
EMAIL_PASS=ipojaankcpjjxecd
```

✅ **No changes needed** - Your email is already configured!

## How It Works

### Step 1: Patient Enters Email
1. Patient goes to login page
2. Enters registered email address
3. Clicks "Send OTP"
4. System checks if email exists for patient role
5. Generates 6-digit OTP
6. Saves OTP and expiry time (10 minutes) in database
7. Sends professional email with OTP
8. Shows success message

### Step 2: Patient Enters OTP
1. Patient receives email with OTP
2. Enters 6-digit OTP on login page
3. Clicks "Verify & Login"
4. System validates:
   - OTP matches
   - OTP not expired
   - Email matches
5. If valid:
   - Clears OTP from database
   - Generates JWT token
   - Logs in patient
   - Redirects to home page

## Email Template

### Professional HTML Email Includes:
- 🏥 Hospital branding
- Large OTP display (easy to read)
- Validity information (10 minutes)
- Security warnings:
  - Don't share OTP
  - Staff never asks for OTP
  - Valid for 10 minutes only
- Professional footer

### Sample Email:
```
Subject: Your Login OTP - Health Matrix Hospital

Hello [Patient Name],

You have requested to login to your Health Matrix Hospital patient account.

Your OTP Code: 123456
Valid for 10 minutes

⚠️ Security Notice:
- This OTP is valid for 10 minutes only
- Do not share this OTP with anyone
- Our staff will never ask for your OTP
```

## Testing Steps

### Test 1: Successful Login
```
1. Go to patient login page
2. Enter email: (any registered patient email)
3. Click "Send OTP"
4. Check email inbox
5. Copy 6-digit OTP
6. Enter OTP on login page
7. Click "Verify & Login"
✅ Should login successfully
```

### Test 2: Resend OTP
```
1. Enter email and send OTP
2. Wait on OTP screen
3. Click "Resend OTP"
4. Check email for new OTP
5. Enter new OTP
6. Verify and login
✅ Should work with new OTP
```

### Test 3: Change Email
```
1. Enter wrong email and send OTP
2. Click "Change Email"
3. Enter correct email
4. Send OTP again
5. Verify and login
✅ Should work
```

### Test 4: Expired OTP
```
1. Send OTP
2. Wait 11 minutes
3. Try to verify OTP
❌ Should show "OTP has expired"
4. Request new OTP
✅ Should work with new OTP
```

### Test 5: Invalid OTP
```
1. Send OTP
2. Enter wrong OTP (e.g., 000000)
3. Try to verify
❌ Should show "Invalid OTP"
```

### Test 6: Non-existent Email
```
1. Enter email not in database
2. Try to send OTP
❌ Should show "Patient account not found"
```

## Security Features

### ✅ OTP Security
- 6-digit random number (1,000,000 combinations)
- Expires after 10 minutes
- Single use only (cleared after verification)
- Stored securely in database

### ✅ Email Security
- Sent via secure SMTP (TLS)
- Gmail app password used (not regular password)
- Professional template with warnings

### ✅ Validation
- Email format validation
- Patient role verification
- OTP expiry check
- OTP match verification

## API Documentation

### Send OTP
**Endpoint:** `POST /api/auth/patient-login-otp`

**Request:**
```json
{
  "email": "patient@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox.",
  "email": "patient@example.com"
}
```

**Error Responses:**
```json
// Email not found
{
  "message": "Patient account not found with this email"
}

// Email send failed
{
  "message": "Failed to send OTP email. Please try again."
}
```

### Verify OTP
**Endpoint:** `POST /api/auth/patient-verify-otp`

**Request:**
```json
{
  "email": "patient@example.com",
  "otp": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "patient@example.com",
    "role": "patient",
    "isVerified": true
  }
}
```

**Error Responses:**
```json
// Invalid OTP
{
  "message": "Invalid OTP. Please try again."
}

// Expired OTP
{
  "message": "OTP has expired. Please request a new OTP."
}

// No OTP request
{
  "message": "No OTP request found. Please request a new OTP."
}
```

## Database Schema

### User Model Updates
```javascript
{
  // Existing fields...
  otp: String,              // 6-digit OTP
  otpExpires: Date,         // Expiry timestamp
}
```

## Frontend Features

### UI/UX Improvements
- ✅ Two-step process with clear instructions
- ✅ Large OTP input field (easy to read)
- ✅ Auto-format OTP (numbers only, max 6 digits)
- ✅ Loading states during API calls
- ✅ Disabled states to prevent double submission
- ✅ Resend OTP button
- ✅ Change email button
- ✅ Clear error messages
- ✅ Success notifications

### Input Validation
- Email format validation
- OTP numeric validation (6 digits only)
- Required field validation
- Auto-trim whitespace

## Troubleshooting

### Issue: Email not received
**Solutions:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check backend logs for email errors
4. Verify Gmail app password is correct
5. Check if Gmail account allows less secure apps

### Issue: "Failed to send OTP email"
**Solutions:**
1. Check .env EMAIL_HOST = smtp.gmail.com
2. Verify EMAIL_USER and EMAIL_PASS
3. Check internet connection
4. Restart backend server

### Issue: "OTP has expired"
**Solutions:**
1. Request new OTP
2. Enter OTP within 10 minutes
3. Check system time is correct

### Issue: "Invalid OTP"
**Solutions:**
1. Copy OTP carefully from email
2. Don't add spaces
3. Use latest OTP if resent
4. Request new OTP if unsure

## Benefits

### For Patients
✅ No password to remember
✅ More secure (OTP expires)
✅ Easy login process
✅ Professional email communication

### For Hospital
✅ Reduced password reset requests
✅ Better security
✅ Professional system
✅ Audit trail (OTP requests logged)

### Security Benefits
✅ No password storage concerns
✅ OTP expires automatically
✅ Single-use OTP
✅ Email verification

## Important Notes

1. **Restart Backend Server** after changes:
   ```bash
   cd backend
   npm run dev
   ```

2. **Gmail Configuration:**
   - Using app password (already configured)
   - No additional setup needed

3. **Patient Only:**
   - OTP login is for patients only
   - Other roles (doctor, admin, etc.) use regular password login

4. **OTP Validity:**
   - 10 minutes expiry
   - Single use only
   - New OTP invalidates old one

## Future Enhancements

1. **SMS OTP** - Send OTP via SMS as backup
2. **Remember Device** - Skip OTP for trusted devices
3. **Biometric Login** - Fingerprint/Face ID
4. **Rate Limiting** - Prevent OTP spam
5. **Login History** - Track login attempts
6. **2FA Option** - Optional two-factor authentication

## Summary

✅ **Implemented:** Secure OTP-based login for patients
✅ **Email:** Professional HTML template with security warnings
✅ **Security:** 10-minute expiry, single-use, validated
✅ **UX:** Two-step process with resend and change email options
✅ **Ready:** No additional configuration needed - just restart backend!

Patients can now login securely using OTP sent to their registered email address!

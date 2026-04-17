# OTP Email Sending - Troubleshooting Guide

## Issue: Failed to Send OTP

### Quick Test

Run this command to test email configuration:
```bash
cd backend
node testEmail.js
```

This will:
- Check email configuration
- Verify SMTP connection
- Send test email
- Show detailed error messages

## Common Issues & Solutions

### 1. Authentication Failed (EAUTH)

**Error:** "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause:** Gmail app password is incorrect or not set up

**Solution:**

#### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow steps to enable it

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Health Matrix Hospital"
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Step 3: Update .env
```env
EMAIL_PASS=abcdefghijklmnop
```
(Remove spaces from app password)

#### Step 4: Restart Server
```bash
cd backend
npm run dev
```

### 2. Connection Failed (ECONNECTION)

**Error:** "Connection timeout" or "ECONNECTION"

**Solutions:**

#### Check .env Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yammanuruharish456@gmail.com
EMAIL_PASS=your_app_password_here
```

#### Verify Internet Connection
- Check if you can access Gmail
- Try pinging smtp.gmail.com

#### Firewall/Antivirus
- Temporarily disable firewall
- Check if port 587 is blocked

### 3. Patient Not Found

**Error:** "Patient account not found with this email"

**Cause:** Email doesn't exist or user is not a patient

**Solutions:**
1. Register patient account first
2. Verify email is correct
3. Check user role in database

### 4. Email Not Received

**Possible Causes:**
- Email in spam/junk folder
- Gmail blocking emails
- Incorrect email address
- Email quota exceeded

**Solutions:**

#### Check Spam Folder
- Look in spam/junk folder
- Mark as "Not Spam"

#### Check Gmail Settings
1. Go to Gmail Settings
2. Check Filters and Blocked Addresses
3. Make sure sender is not blocked

#### Whitelist Sender
Add `yammanuruharish456@gmail.com` to contacts

### 5. OTP Not Saving

**Error:** OTP sent but verification fails

**Cause:** Database save issue

**Solution:**
Check backend logs for errors:
```bash
# Look for errors in terminal
```

## Testing Steps

### Test 1: Email Configuration
```bash
cd backend
node testEmail.js
```

Expected output:
```
✅ Transporter verified successfully!
✅ Email sent successfully!
```

### Test 2: Patient Registration
1. Register a patient account
2. Use valid email address
3. Complete registration

### Test 3: OTP Request
1. Go to patient login
2. Enter registered email
3. Click "Send OTP"
4. Check backend logs
5. Check email inbox

### Test 4: OTP Verification
1. Copy OTP from email
2. Enter on login page
3. Click "Verify & Login"
4. Should login successfully

## Backend Logs

Check terminal for these messages:

### Success:
```
Email sent successfully to: patient@email.com
```

### Failure:
```
Email sending error: [error details]
```

## Debug Checklist

- [ ] .env file has correct EMAIL_HOST (smtp.gmail.com)
- [ ] .env file has correct EMAIL_PORT (587)
- [ ] .env file has correct EMAIL_USER
- [ ] .env file has Gmail App Password (not regular password)
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated and copied correctly
- [ ] No spaces in app password
- [ ] Backend server restarted after .env changes
- [ ] Patient account exists in database
- [ ] Email address is correct
- [ ] Internet connection working
- [ ] Port 587 not blocked by firewall

## Gmail App Password Setup (Detailed)

### Prerequisites
- Gmail account
- 2-Step Verification enabled

### Steps

1. **Go to Google Account**
   - Visit: https://myaccount.google.com/

2. **Security Section**
   - Click "Security" in left menu

3. **2-Step Verification**
   - Find "2-Step Verification"
   - Click and follow setup
   - Verify with phone

4. **App Passwords**
   - Go back to Security
   - Find "App passwords" (below 2-Step Verification)
   - Click it

5. **Generate Password**
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "Health Matrix Hospital"
   - Click "Generate"

6. **Copy Password**
   - You'll see 16-character password
   - Example: `abcd efgh ijkl mnop`
   - Copy it (remove spaces)

7. **Update .env**
   ```env
   EMAIL_PASS=abcdefghijklmnop
   ```

8. **Restart Server**
   ```bash
   cd backend
   npm run dev
   ```

## Alternative: Test with Console Log

Temporarily add console logs to debug:

```javascript
// In backend/routes/auth.js
console.log('Sending OTP to:', email);
console.log('Generated OTP:', otp);
console.log('Email config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER
});
```

## Environment Variables Check

Run this to verify:
```bash
cd backend
node -e "require('dotenv').config(); console.log('EMAIL_HOST:', process.env.EMAIL_HOST); console.log('EMAIL_PORT:', process.env.EMAIL_PORT); console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');"
```

## Common Mistakes

❌ Using regular Gmail password instead of App Password
❌ Spaces in app password
❌ Wrong EMAIL_HOST (should be smtp.gmail.com)
❌ Wrong EMAIL_PORT (should be 587)
❌ Not restarting server after .env changes
❌ 2-Step Verification not enabled
❌ Email address typo

## Quick Fix Commands

```bash
# 1. Test email
cd backend
node testEmail.js

# 2. Check .env
cat .env | grep EMAIL

# 3. Restart server
npm run dev

# 4. Check logs
# Watch terminal for errors
```

## Still Not Working?

1. **Check Gmail Account:**
   - Login to Gmail
   - Check if account is active
   - Verify 2-Step Verification is ON

2. **Generate New App Password:**
   - Delete old app password
   - Generate new one
   - Update .env
   - Restart server

3. **Try Different Email:**
   - Use different Gmail account
   - Update EMAIL_USER and EMAIL_PASS
   - Test again

4. **Check Server Logs:**
   - Look for detailed error messages
   - Share error for specific help

## Success Indicators

✅ Test email received
✅ Backend logs show "Email sent successfully"
✅ OTP email arrives in inbox
✅ OTP verification works
✅ Patient can login

## Contact Support

If still having issues:
1. Run `node testEmail.js`
2. Copy error message
3. Check backend terminal logs
4. Verify all checklist items above

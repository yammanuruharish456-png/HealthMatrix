# Lab Report Workflow - Troubleshooting Guide

## Issue: "Failed to save report" when lab technician completes a report

### Possible Causes & Solutions

#### 1. Missing Required Fields
**Error**: Validation error for required fields
**Solution**: Ensure these fields are filled:
- Patient (required)
- Test Type (required)
- Test Category (required)

#### 2. Patient ID Not Found
**Error**: Patient information missing
**Solution**: 
- Make sure a patient is selected from the dropdown
- If completing a doctor's request, patient info should be pre-filled

#### 3. Backend Server Not Running
**Error**: Network error or connection refused
**Solution**:
```bash
cd backend
npm run dev
```

#### 4. Authentication Issues
**Error**: Unauthorized or token expired
**Solution**:
- Log out and log back in as lab technician
- Credentials: labtechmatrix@gmail.com / labtech@123

#### 5. Database Connection Issues
**Error**: MongoDB connection error
**Solution**:
- Check if MongoDB is running
- Verify MONGODB_URI in backend/.env file

## Testing Steps

### Test 1: Doctor Requests Lab Test
1. Login as doctor
2. Confirm an appointment
3. Click "Request Lab Test"
4. Fill in:
   - Test Type: "Complete Blood Count"
   - Category: "Blood Test"
5. Click "Request Test"
6. Should see success message

### Test 2: Lab Technician Starts Work
1. Login as lab technician (labtechmatrix@gmail.com / labtech@123)
2. Go to "Pending Requests" tab
3. Find the requested test
4. Click "Start" button
5. Status should change to "in_progress"

### Test 3: Lab Technician Completes Report
1. Click "Complete" button on in-progress report
2. Form should open with patient/doctor/test info pre-filled
3. Add test results (optional):
   - Click "Add Parameter"
   - Fill in parameter details
4. Add findings and recommendations
5. Upload report file (optional)
6. Click "Complete Report"
7. Should see success message
8. Report should appear in "Completed Reports" tab

### Test 4: Doctor Reviews Report
1. Login as doctor
2. Go to "Lab Reports" tab
3. Find completed report
4. Click "Review & Diagnose"
5. Enter diagnosis notes
6. Should see success message
7. Status should change to "reviewed"

## Console Debugging

Open browser console (F12) to see detailed logs:
- Lab request submission logs
- Report creation/update logs
- Error details with stack traces

## Backend Logs

Check terminal running backend server for:
- Lab report creation errors
- Database validation errors
- Authentication issues

## Common Error Messages

### "Please select a patient"
- Patient dropdown is empty or not selected
- Solution: Select a patient from the dropdown

### "Please enter test type"
- Test type field is empty
- Solution: Enter a test type (e.g., "Blood Test", "X-Ray")

### "Failed to fetch data"
- Backend API not responding
- Solution: Check if backend server is running on port 5000

### "Report not found"
- Trying to update a non-existent report
- Solution: Refresh the page and try again

## API Endpoints

- POST /api/lab-reports - Create new report or request
- GET /api/lab-reports - Get all reports (filtered by role)
- PUT /api/lab-reports/:id - Update report status/details
- GET /api/lab-reports/:id - Get single report

## Database Schema

Required fields in LabReport:
- reportNumber (auto-generated)
- patientId (ObjectId)
- testType (String)

Optional fields:
- doctorId, testCategory, testResults, findings, recommendations, reportFile, etc.

## Role-Based Access

- **Doctor**: Can create requests, view their patients' reports, review completed reports
- **Lab Technician**: Can view all requests, update status, complete reports, create new reports
- **Patient**: Can view their own reports only

## File Upload Issues

If file upload fails:
1. Check file size (should be reasonable, < 10MB)
2. Check file type (PDF, JPG, PNG, DOC, DOCX)
3. File is converted to base64 and stored in database
4. Large files may cause performance issues

## Status Flow

```
requested → in_progress → completed → reviewed
```

Each status change requires specific role:
- requested: Created by doctor
- in_progress: Updated by lab technician
- completed: Updated by lab technician
- reviewed: Updated by doctor

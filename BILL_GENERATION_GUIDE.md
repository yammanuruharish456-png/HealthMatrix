# Bill Generation Troubleshooting Guide

## Issue: Failed to Generate Bill by Receptionist

### Common Causes & Solutions

#### 1. Patient Not Selected
**Error**: "Please select a patient"
**Solution**: 
- Select a patient from the dropdown
- Make sure patient list is loaded
- If no patients appear, check if patients exist in database

#### 2. Total Amount is Zero
**Error**: "Total amount must be greater than 0"
**Solution**:
- Add at least one charge:
  - Consultation fee
  - Lab tests
  - Medicines
  - Procedures
- Click "Calculate Total" button
- Verify amounts are entered correctly

#### 3. Authentication Issues
**Error**: Unauthorized or forbidden
**Solution**:
- Make sure you're logged in as receptionist
- Check if token is valid
- Log out and log back in

#### 4. Backend Server Not Running
**Error**: Network error
**Solution**:
```bash
cd backend
npm run dev
```

#### 5. Database Connection Issues
**Error**: MongoDB connection error
**Solution**:
- Check if MongoDB is running
- Verify MONGODB_URI in .env file

## Step-by-Step Bill Generation

### Step 1: Open Bill Form
1. Login as receptionist
2. Go to "Billing" tab
3. Click "Create Bill" button

### Step 2: Select Patient
1. Click on "Patient" dropdown
2. Select patient from list
3. Patient details auto-fill (name, phone, email)

### Step 3: Add Charges

#### Consultation Fee
- Enter amount in "Consultation Fee" field
- Example: 500

#### Lab Tests (Optional)
1. Click "Add Test" button
2. Enter test name: "Blood Test"
3. Enter price: 200
4. Add more tests if needed

#### Medicines (Optional)
1. Click "Add Medicine" button
2. Enter medicine name: "Paracetamol"
3. Enter quantity: 10
4. Enter price per unit: 5
5. Add more medicines if needed

#### Procedures (Optional)
1. Click "Add Procedure" button
2. Enter procedure name: "X-Ray"
3. Enter price: 300
4. Add more procedures if needed

### Step 4: Calculate Total
1. Click "Calculate Total" button
2. System calculates:
   - Subtotal (sum of all charges)
   - Tax (5% of subtotal)
   - Total (subtotal + tax - discount)

### Step 5: Add Discount (Optional)
- Enter discount amount
- Click "Calculate Total" again

### Step 6: Select Payment Mode
- Choose from:
  - Cash
  - Card
  - UPI
  - Net Banking
  - Insurance

### Step 7: Add Notes (Optional)
- Enter any additional notes
- Example: "Follow-up required in 2 weeks"

### Step 8: Generate Bill
1. Click "Generate Bill" button
2. Wait for success message
3. Bill appears in the list

## Example Bill

```
Patient: John Doe
Phone: 1234567890
Email: john@example.com

Consultation Fee: $500
Lab Tests:
  - Blood Test: $200
  - Urine Test: $150
Medicines:
  - Paracetamol (10): $50
  - Amoxicillin (5): $100
Procedures:
  - X-Ray: $300

Subtotal: $1,300
Tax (5%): $65
Discount: $50
-----------------------
Total: $1,315

Payment Mode: Cash
```

## Validation Rules

### Required Fields
- ✅ Patient (must be selected)
- ✅ Payment Mode (must be selected)
- ✅ Total Amount (must be > 0)

### Optional Fields
- Consultation Fee
- Lab Tests
- Medicines
- Procedures
- Discount
- Notes

### Automatic Calculations
- Subtotal = Consultation + Lab Tests + Medicines + Procedures
- Tax = Subtotal × 5%
- Total = Subtotal + Tax - Discount
- Paid Amount = Total (auto-filled)

## Debugging Steps

### Check Browser Console (F12)
Look for:
- "Submitting bill:" - Shows data being sent
- "Bill created:" - Shows successful response
- Error messages with details

### Check Backend Terminal
Look for:
- "Creating bill with data:" - Shows received data
- "Bill created successfully:" - Shows saved bill
- Error messages with stack trace

### Common Console Errors

#### "Patient not found"
- Patient ID is invalid
- Patient was deleted
- Database connection issue

#### "Validation error"
- Required fields missing
- Invalid data types
- Check error message for specific field

#### "Unauthorized"
- Not logged in as receptionist
- Token expired
- Wrong role

## Testing Checklist

### Test 1: Minimum Bill
- [ ] Select patient
- [ ] Enter consultation fee: 500
- [ ] Click "Calculate Total"
- [ ] Select payment mode: Cash
- [ ] Click "Generate Bill"
- [ ] Should succeed

### Test 2: Complete Bill
- [ ] Select patient
- [ ] Enter consultation fee: 500
- [ ] Add lab test: "Blood Test" - $200
- [ ] Add medicine: "Paracetamol" (10) - $5
- [ ] Add procedure: "X-Ray" - $300
- [ ] Enter discount: 50
- [ ] Click "Calculate Total"
- [ ] Select payment mode: Card
- [ ] Add notes: "Test bill"
- [ ] Click "Generate Bill"
- [ ] Should succeed

### Test 3: Download Bill
- [ ] Find generated bill in list
- [ ] Click download icon
- [ ] Bill file should download
- [ ] Open file and verify details

## API Endpoint

**POST** `/api/bills`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": "64abc123...",
  "patientName": "John Doe",
  "patientPhone": "1234567890",
  "patientEmail": "john@example.com",
  "consultationFee": 500,
  "labTests": [
    {"testName": "Blood Test", "price": 200}
  ],
  "medicines": [
    {"name": "Paracetamol", "quantity": 10, "price": 5}
  ],
  "procedures": [
    {"name": "X-Ray", "price": 300}
  ],
  "subtotal": 1300,
  "tax": 65,
  "discount": 50,
  "totalAmount": 1315,
  "paymentMode": "cash",
  "paidAmount": 1315,
  "notes": "Test bill"
}
```

**Response:**
```json
{
  "success": true,
  "bill": {
    "_id": "...",
    "billNumber": "BILL-1234567890",
    "patientName": "John Doe",
    "totalAmount": 1315,
    ...
  }
}
```

## Tips for Receptionist

1. **Always Calculate Total**
   - Click "Calculate Total" before submitting
   - Verify amounts are correct

2. **Double Check Patient**
   - Confirm patient details
   - Verify phone and email

3. **Add All Charges**
   - Don't forget lab tests
   - Include all medicines
   - Add procedures if any

4. **Payment Mode**
   - Confirm with patient
   - Select correct mode

5. **Download Bill**
   - Download immediately after creation
   - Give copy to patient
   - Keep for records

## Future Enhancements

- Print bill directly
- Email bill to patient
- SMS notification
- Payment gateway integration
- Insurance claim integration
- Bill templates
- Bulk billing
- Payment history

# HealthMatrix Functional Requirements Coverage Matrix

## Patient Portal
- Secure login: OTP login and Google Sign-In are available.
- Appointment booking and tracking: available in patient dashboard and booking flow.
- Prescriptions and lab reports: visible in dedicated tabs.
- Billing and payment: bill listing plus hardcoded UPI payment flow (demo PIN `1234`).
- Medical profile and communication: profile settings, messages, medical history, vitals, and insurance tabs.

## Doctor Portal
- Secure login with verification checks: email/password and Google Sign-In supported.
- Appointment and patient workflow: doctor dashboard tracks scheduled and active cases.
- Clinical decisions: prescriptions, lab requests, and patient notes supported by existing modules.
- Real-time care updates: nurse-recorded vitals are visible through shared vital sign data.

## Nurse Portal (New)
- Secure login and registration: dedicated nurse login/register pages plus Google Sign-In.
- Assigned patient access: nurse dashboard fetches assigned appointments/patients.
- Vital signs recording: nurses can create and update vitals via `/api/nurse/vitals` endpoints.
- Real-time doctor visibility: vitals persist to shared vital records consumed by doctor workflows.
- Care coordination: assigned patient panel includes doctor/time context and nursing notes.

## Lab Technician Portal
- Secure login and registration: dedicated lab tech pages with Google Sign-In.
- Lab workflow: pending requests, report creation, completion, and file upload supported.
- Doctor/patient visibility: completed reports appear in user dashboards.

## Receptionist Portal
- Secure login and registration: dedicated receptionist pages with Google Sign-In.
- Front desk operations: billing, patient booking, and appointment approval/cancel flow.
- Nurse coordination: receptionist can assign verified nurses to appointments.
- Payment operations: can generate bills and view payment mode/status.

## Admin Portal
- Secure admin access: admin login with Google Sign-In.
- Verification and governance: verifies doctors and staff (receptionist/lab tech/nurse).
- Operational oversight: appointments, contacts, callbacks, and staff queues visible.

## Hardcoded UPI Payment Flow
- Endpoint: `POST /api/bills/:id/pay-upi`.
- Allowed roles: patient, receptionist, admin.
- Required payload: `upiId`, `upiPin`.
- Demo success condition: PIN must be `1234`.
- On success: bill is marked paid with generated `upiTransactionId` and `paidAt`.

## Validation Checklist
- Backend route and model support added for nurse role and assignment.
- Nurse frontend pages and route wiring implemented.
- Patient UI can submit UPI payment for pending bills.
- Receptionist UI can assign nurses to appointments.
- Admin pending staff view now labels nurse applications correctly.

## Chatbot Troubleshooting Guide

### Where Should You See the Chatbot?

**✅ Chatbot WILL appear on these pages (when logged in as PATIENT):**
- Home page (/)
- Doctors page (/doctors)
- Appointment page (/appointment)
- My Appointments (/my-appointments)
- All other pages

**❌ Chatbot will NOT appear if:**
- You're logged in as Doctor
- You're logged in as Admin
- You're logged in as Lab Technician
- You're logged in as Receptionist
- You're not logged in at all

### Visual Guide:

```
┌─────────────────────────────────────┐
│  Header (Amedic Hospital)           │
├─────────────────────────────────────┤
│                                     │
│  Page Content                       │
│                                     │
│                                     │
│                              ┌────┐ │ ← Chatbot button here
│                              │ 💬 │ │   (bottom-right corner)
│                              │ AI │ │
│                              └────┘ │
└─────────────────────────────────────┘
```

### Quick Test:

1. Open browser console (F12)
2. Login as patient
3. Type in console: `document.querySelector('.chatbot-toggle')`
4. If it returns `null` → Chatbot not rendered
5. If it returns an element → Chatbot is there but might be hidden

### Manual Check:

After logging in as patient, press F12 and run:
```javascript
console.log('User:', localStorage.getItem('token') ? 'Logged in' : 'Not logged in');
```

### Force Show Chatbot (Temporary Test):

Edit `Chatbot.js` line 95 to:
```javascript
if (!user) {
  return null; // Only check if user exists
}
```

This will show chatbot for ALL logged-in users (for testing).

### Backend Check:

Test if chatbot API works:
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"hello"}'
```

Replace YOUR_TOKEN with actual token from localStorage.

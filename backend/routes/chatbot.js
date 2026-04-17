const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const axios = require('axios');

// Chatbot with workflow integration and live data
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const userRole = req.user.role;
    const userName = req.user.name;

    // Get live hospital data
    const doctors = await Doctor.find({ isActive: true }).select('name specialization experience consultationFee');
    const todayAppointments = await Appointment.find({
      appointmentDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    }).countDocuments();
    
    // Build context for AI
    const systemPrompt = `You are a helpful medical assistant chatbot for Health Matrix Hospital. 

Hospital Information:
- Name: Health Matrix Hospital
- Emergency: +1-800-HEALTH-MATRIX (24/7)
- OPD Hours: 8:00 AM - 8:00 PM
- Lab Services: 7:00 AM - 9:00 PM
- Emergency & Pharmacy: 24/7
- Address: 123 Healthcare Avenue, City, State
- Today's Appointments: ${todayAppointments}

Available Doctors (${doctors.length} active):
${doctors.slice(0, 10).map(d => `- Dr. ${d.name} (${d.specialization}) - ${d.experience} years exp, Fee: $${d.consultationFee}`).join('\n')}

User Role: ${userRole}
User Name: ${userName}

Hospital Services:
- 24/7 Emergency Care
- Outpatient Consultations
- Laboratory Services (Blood tests, X-Ray, MRI, CT Scan)
- Radiology & Imaging
- Pharmacy (24/7)
- Surgical Procedures
- ICU & Critical Care
- Maternity Ward

Hospital Workflow:
1. Patient books appointment online
2. Receptionist manages billing
3. Doctor examines and prescribes
4. Doctor requests lab tests if needed
5. Lab technician completes tests
6. Doctor reviews reports and diagnoses
7. Patient receives prescription and bill

Your capabilities:
- Help book appointments (suggest "Book Appointment" button)
- Recommend doctors based on symptoms
- Provide hospital information
- Guide emergency situations
- Answer medical queries (general advice only)
- Explain hospital services
- If user needs more help, suggest "Request Callback"

Important:
- Be empathetic and professional
- For emergencies, immediately provide emergency contact
- Don't diagnose - recommend seeing appropriate specialist
- Keep responses concise (2-3 sentences)
- Use emojis appropriately
- Always provide actionable suggestions
- Mention specific doctors when relevant

Respond naturally and helpfully.`;

    // Call OpenRouter API
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://healthmatrix.com',
            'X-Title': 'Health Matrix Hospital'
          },
          timeout: 10000
        }
      );

      const aiReply = response.data.choices[0].message.content;

      // Generate smart suggestions based on AI response and user query
      let suggestions = [];
      const lowerReply = aiReply.toLowerCase();
      const lowerMessage = message.toLowerCase();
      
      if (lowerReply.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
        suggestions.push('Book Appointment');
      }
      if (lowerReply.includes('doctor') || lowerReply.includes('specialist') || lowerMessage.includes('doctor')) {
        suggestions.push('Find Doctor');
      }
      if (lowerReply.includes('emergency') || lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        suggestions.push('Emergency Info');
      }
      if (lowerReply.includes('service') || lowerMessage.includes('service') || lowerMessage.includes('facility')) {
        suggestions.push('Hospital Services');
      }
      
      // Always offer callback option
      if (suggestions.length < 4) {
        suggestions.push('Request Callback');
      }
      
      // Default suggestions if none generated
      if (suggestions.length === 0) {
        suggestions = ['Book Appointment', 'Find Doctor', 'Hospital Services', 'Request Callback'];
      }

      res.json({
        success: true,
        reply: aiReply,
        suggestions: suggestions.slice(0, 4),
        model: 'OpenRouter AI',
        liveData: {
          doctorsCount: doctors.length,
          todayAppointments: todayAppointments
        }
      });

    } catch (apiError) {
      console.error('OpenRouter API error:', apiError.message);
      
      // Fallback to rule-based responses with live data
      const lowerMessage = message.toLowerCase();
      let reply = '';
      let suggestions = [];
      
      if (/hi|hello|hey/.test(lowerMessage)) {
        reply = `Hello ${userName}! 👋 I'm your Health Matrix Hospital assistant.\n\nWe have ${doctors.length} doctors available and ${todayAppointments} appointments scheduled today.\n\nI can help you with:\n• 📅 Booking appointments\n• 👨⚕️ Finding doctors\n• 🏥 Hospital services\n• 🚨 Emergency contacts\n\nWhat would you like to know?`;
        suggestions = ['Book Appointment', 'Find Doctor', 'Hospital Services', 'Emergency Info'];
      }
      else if (/book|appointment/.test(lowerMessage)) {
        reply = `To book an appointment:\n1. Click "Book Appointment" below\n2. Select specialty\n3. Choose from ${doctors.length} available doctors\n4. Pick date & time\n\nWould you like to proceed?`;
        suggestions = ['Book Appointment', 'Find Doctor', 'View Specialties', 'Request Callback'];
      }
      else if (/doctor|specialist/.test(lowerMessage)) {
        const specialties = [...new Set(doctors.map(d => d.specialization))];
        reply = `We have ${doctors.length} doctors across ${specialties.length} specialties:\n\n${specialties.slice(0, 6).map(s => `• ${s}`).join('\n')}\n\nClick below to view all doctors!`;
        suggestions = ['Find Doctor', 'Book Appointment', 'Specialties', 'Request Callback'];
      }
      else if (/emergency|urgent/.test(lowerMessage)) {
        reply = `🚨 EMERGENCY SERVICES\n\n24/7 Hotline: +1-800-HEALTH-MATRIX\nAmbulance: 911\n\nEmergency Department:\nHealth Matrix Hospital, Main Building\nOpen 24/7\n\nFor life-threatening emergencies, call 911 immediately!`;
        suggestions = ['Emergency Info', 'Hospital Location', 'Book Appointment', 'Request Callback'];
      }
      else if (/service|facility/.test(lowerMessage)) {
        reply = `🏥 Our Services:\n\n• 24/7 Emergency Care\n• ${doctors.length} Specialist Doctors\n• Laboratory Services\n• Radiology & Imaging\n• Pharmacy (24/7)\n• Surgical Procedures\n• ICU & Critical Care\n\nClick below to learn more!`;
        suggestions = ['Hospital Services', 'Book Appointment', 'Find Doctor', 'Request Callback'];
      }
      else if (/lab|test|report/.test(lowerMessage)) {
        reply = `Lab Services:\n• Blood tests\n• X-Ray, MRI, CT Scan\n• Pathology\n\nHours: 7 AM - 9 PM\n\nView your reports in "My Appointments" section.`;
        suggestions = ['My Appointments', 'Book Test', 'Hospital Services', 'Request Callback'];
      }
      else if (/bill|payment|cost/.test(lowerMessage)) {
        if (userRole === 'receptionist') {
          reply = `Billing Help:\n1. Click "Create Bill"\n2. Select patient\n3. Add charges\n4. Calculate total\n5. Generate bill\n\nNeed detailed help?`;
          suggestions = ['Go to Billing', 'Payment Modes', 'Request Callback'];
        } else {
          reply = `View your bills in "My Appointments" section.\n\nPayment modes:\n• Cash\n• Card\n• UPI\n• Insurance`;
          suggestions = ['My Bills', 'Payment Info', 'Request Callback'];
        }
      }
      else {
        reply = `I'm here to help! We have ${doctors.length} doctors available.\n\nI can assist with:\n• 📅 Booking appointments\n• 👨⚕️ Finding doctors\n• 🏥 Hospital services\n• 🚨 Emergency services\n\nWhat would you like to know?`;
        suggestions = ['Book Appointment', 'Find Doctor', 'Hospital Services', 'Request Callback'];
      }

      res.json({
        success: true,
        reply: reply,
        suggestions: suggestions,
        model: 'Fallback',
        liveData: {
          doctorsCount: doctors.length,
          todayAppointments: todayAppointments
        }
      });
    }

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      reply: 'I encountered an error. Please try again or request a callback for assistance.'
    });
  }
});

module.exports = router;

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Health Matrix Hospital <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.email);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Health Matrix Hospital</h1>
          <p>Patient Login Verification</p>
        </div>
        <div class="content">
          <h2>Hello ${name || 'Patient'},</h2>
          <p>You have requested to login to your Health Matrix Hospital patient account.</p>
          <p>Please use the following One-Time Password (OTP) to complete your login:</p>
          
          <div class="otp-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>Our staff will never ask for your OTP</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Best regards,<br><strong>Health Matrix Hospital Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Health Matrix Hospital. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email,
    subject: 'Your Login OTP - Health Matrix Hospital',
    html
  });
};

const sendMessageNotification = async (recipientEmail, recipientName, senderName, senderRole, subject, messagePreview, messageType, priority) => {
  const priorityColors = {
    urgent: '#dc3545',
    high: '#fd7e14', 
    normal: '#28a745',
    low: '#6c757d'
  };

  const typeIcons = {
    appointment_reminder: '📅',
    test_result: '🔬',
    prescription: '💊',
    follow_up: '👨‍⚕️',
    emergency: '🚨',
    general: '💬'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .priority-badge { background: ${priorityColors[priority]}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Health Matrix Hospital</h1>
          <p>New Message Notification</p>
        </div>
        <div class="content">
          <h2>Hello ${recipientName},</h2>
          <p>You have received a new message in your Health Matrix Hospital portal.</p>
          
          <div class="message-box">
            <h3>${typeIcons[messageType] || '💬'} ${subject}</h3>
            <p><strong>From:</strong> ${senderName} (${senderRole})</p>
            <p><strong>Priority:</strong> <span class="priority-badge">${priority}</span></p>
            <p><strong>Preview:</strong> ${messagePreview}...</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient-dashboard" class="btn">
              View Full Message
            </a>
          </div>
          
          ${priority === 'urgent' || messageType === 'emergency' ? `
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>🚨 ${priority === 'urgent' ? 'URGENT' : 'EMERGENCY'}:</strong> This message requires immediate attention.
          </div>
          ` : ''}
          
          <p>Best regards,<br><strong>Health Matrix Hospital Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Health Matrix Hospital. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: recipientEmail,
    subject: `New Message: ${subject} - Health Matrix Hospital`,
    html
  });
};

const sendAppointmentReminder = async (patientEmail, patientName, doctorName, appointmentDate, timeSlot) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-box { background: white; border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }
        .btn { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn-emergency { background: #dc3545; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Health Matrix Hospital</h1>
          <p>Appointment Reminder</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>This is a reminder for your upcoming appointment.</p>
          
          <div class="appointment-box">
            <h3>📅 Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${timeSlot}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>📋 Please Remember:</strong>
            <ul>
              <li>Arrive 15 minutes early for check-in</li>
              <li>Bring your insurance card and ID</li>
              <li>Bring a list of current medications</li>
              <li>Wear a mask if you have symptoms</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient-dashboard" class="btn">
              View Appointment
            </a>
            <a href="tel:+18002633422" class="btn btn-emergency">
              Call Hospital
            </a>
          </div>
          
          <p>Best regards,<br><strong>Health Matrix Hospital Team</strong></p>
        </div>
        <div class="footer">
          <p>Health Matrix Hospital | 123 Medical Center Dr</p>
          <p>Phone: +1-800-HEALTH-MATRIX | Emergency: 911</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: patientEmail,
    subject: 'Appointment Reminder - Health Matrix Hospital',
    html
  });
};

const sendTestResultNotification = async (patientEmail, patientName, testType, doctorName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .result-box { background: white; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .btn { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Health Matrix Hospital</h1>
          <p>Test Results Available</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>Your test results are now available for review.</p>
          
          <div class="result-box">
            <h3>🔬 Test Information</h3>
            <p><strong>Test Type:</strong> ${testType}</p>
            <p><strong>Reviewed by:</strong> Dr. ${doctorName}</p>
            <p><strong>Status:</strong> Results Available</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient-dashboard" class="btn">
              View Test Results
            </a>
          </div>
          
          <div style="background: #e2e3e5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>📋 Next Steps:</strong><br>
            Please log in to your patient portal to view your complete test results and any recommendations from your doctor.
          </div>
          
          <p>Best regards,<br><strong>Health Matrix Hospital Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Health Matrix Hospital. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: patientEmail,
    subject: 'Test Results Available - Health Matrix Hospital',
    html
  });
};

module.exports = { 
  sendEmail, 
  sendOTPEmail, 
  sendMessageNotification, 
  sendAppointmentReminder, 
  sendTestResultNotification 
};

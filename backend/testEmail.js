const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...\n');
  
  console.log('Email Config:');
  console.log('HOST:', process.env.EMAIL_HOST);
  console.log('PORT:', process.env.EMAIL_PORT);
  console.log('USER:', process.env.EMAIL_USER);
  console.log('PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  console.log('\n');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `Health Matrix Hospital <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email - OTP System',
      html: `
        <h2>Test Email</h2>
        <p>If you receive this email, your OTP system is working correctly!</p>
        <p>Test OTP: <strong>123456</strong></p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n⚠️  Authentication failed!');
      console.error('Solutions:');
      console.error('1. Check if EMAIL_USER and EMAIL_PASS are correct');
      console.error('2. Make sure you are using App Password, not regular password');
      console.error('3. Enable 2-Step Verification in Gmail');
      console.error('4. Generate new App Password from: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n⚠️  Connection failed!');
      console.error('Solutions:');
      console.error('1. Check internet connection');
      console.error('2. Verify EMAIL_HOST is smtp.gmail.com');
      console.error('3. Verify EMAIL_PORT is 587');
    }
  }
}

testEmail();

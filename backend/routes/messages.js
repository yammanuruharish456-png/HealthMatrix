const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendMessageNotification } = require('../utils/email');

// Get user's messages
router.get('/', protect, async (req, res) => {
  try {
    const { type = 'received', page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = {};
    if (type === 'sent') {
      query.senderId = req.user.id;
    } else {
      query.receiverId = req.user.id;
    }
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    query.isArchived = false;
    
    const messages = await Message.find(query)
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false,
      isArchived: false
    });
    
    res.json({
      success: true,
      messages,
      unreadCount,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/', protect, async (req, res) => {
  try {
    const message = await Message.create({
      ...req.body,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role
    });
    
    await message.populate('receiverId', 'name role email');
    
    // Set receiver name and role
    message.receiverName = message.receiverId.name;
    message.receiverRole = message.receiverId.role;
    await message.save();
    
    // Send email notification
    try {
      await sendMessageNotification(
        message.receiverId.email,
        message.receiverId.name,
        req.user.name,
        req.user.role,
        message.subject,
        message.message.substring(0, 100),
        message.messageType,
        message.priority
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the message creation if email fails
    }
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, receiverId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ],
      isArchived: false
    })
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Mark messages as read
    await Message.updateMany(
      { senderId: userId, receiverId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's contacts (people they've messaged with)
router.get('/contacts', protect, async (req, res) => {
  try {
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ],
          isArchived: false
        }
      },
      {
        $addFields: {
          contactId: {
            $cond: {
              if: { $eq: ['$senderId', req.user._id] },
              then: '$receiverId',
              else: '$senderId'
            }
          },
          contactName: {
            $cond: {
              if: { $eq: ['$senderId', req.user._id] },
              then: '$receiverName',
              else: '$senderName'
            }
          },
          contactRole: {
            $cond: {
              if: { $eq: ['$senderId', req.user._id] },
              then: '$receiverRole',
              else: '$senderRole'
            }
          }
        }
      },
      {
        $group: {
          _id: '$contactId',
          name: { $first: '$contactName' },
          role: { $first: '$contactRole' },
          lastMessage: { $first: '$message' },
          lastMessageDate: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$receiverId', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      { $sort: { lastMessageDate: -1 } }
    ]);
    
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send appointment reminder
router.post('/appointment-reminder', protect, async (req, res) => {
  try {
    const { patientId, appointmentId, appointmentDate, doctorName } = req.body;
    
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: patientId,
      senderName: req.user.name,
      senderRole: req.user.role,
      subject: 'Appointment Reminder',
      message: `This is a reminder for your upcoming appointment with Dr. ${doctorName} on ${new Date(appointmentDate).toLocaleDateString()} at ${new Date(appointmentDate).toLocaleTimeString()}.`,
      messageType: 'appointment_reminder',
      relatedAppointment: appointmentId,
      priority: 'normal'
    });
    
    await message.populate('receiverId', 'name role');
    message.receiverName = message.receiverId.name;
    message.receiverRole = message.receiverId.role;
    await message.save();
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send test result notification
router.post('/test-result', protect, async (req, res) => {
  try {
    const { patientId, labReportId, testType } = req.body;
    
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: patientId,
      senderName: req.user.name,
      senderRole: req.user.role,
      subject: 'Test Results Available',
      message: `Your ${testType} test results are now available. Please log in to your patient portal to view the results or schedule a follow-up appointment with your doctor.`,
      messageType: 'test_result',
      relatedLabReport: labReportId,
      priority: 'normal'
    });
    
    await message.populate('receiverId', 'name role');
    message.receiverName = message.receiverId.name;
    message.receiverRole = message.receiverId.role;
    await message.save();
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
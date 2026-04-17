import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaEnvelopeOpen, FaPaperPlane, FaUser, FaUserMd, FaPlus } from 'react-icons/fa';
import './Messages.css';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    subject: '',
    message: '',
    priority: 'normal',
    messageType: 'general'
  });
  const [replyMessage, setReplyMessage] = useState('');

  const getEntityId = (entity) => {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || '';
  };

  useEffect(() => {
    fetchMessages();
    fetchContacts();
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/messages?type=${activeTab === 'sent' ? 'sent' : 'received'}`);
      setMessages(res.data.messages || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/api/messages/contacts');
      setContacts(res.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const openConversation = async (contact) => {
    const contactId = getEntityId(contact?._id || contact?.id || contact);
    if (!contactId) return;

    try {
      const res = await axios.get(`/api/messages/conversation/${contactId}`);
      setConversation(res.data.messages || []);
      setSelectedContact({
        _id: contactId,
        name: contact.name || contact.senderName || contact.receiverName || 'Unknown User',
        role: contact.role || contact.senderRole || contact.receiverRole || 'user'
      });
      setActiveTab('inbox');
      fetchMessages();
      fetchContacts();
    } catch (error) {
      toast.error('Failed to open conversation');
    }
  };

  const openConversationFromMessage = async (message) => {
    const isSent = activeTab === 'sent';
    const contactEntity = isSent ? message.receiverId : message.senderId;
    const contactId = getEntityId(contactEntity);

    if (!contactId) {
      toast.error('Unable to resolve user for this conversation');
      return;
    }

    if (!isSent && !message.isRead) {
      try {
        await axios.put(`/api/messages/${message._id}/read`);
      } catch (error) {
        // Read sync failure should not block conversation open.
      }
    }

    await openConversation({
      _id: contactId,
      name: isSent ? (message.receiverName || message.receiverId?.name) : (message.senderName || message.senderId?.name),
      role: isSent ? (message.receiverRole || message.receiverId?.role) : (message.senderRole || message.senderId?.role)
    });
  };

  const sendReply = async (e) => {
    e.preventDefault();

    if (!selectedContact || !replyMessage.trim()) return;

    try {
      await axios.post('/api/messages', {
        receiverId: selectedContact._id,
        subject: `Re: Conversation with ${selectedContact.name}`,
        message: replyMessage,
        priority: 'normal',
        messageType: 'general'
      });

      setReplyMessage('');
      await openConversation(selectedContact);
      toast.success('Reply sent');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/messages', newMessage);
      toast.success('Message sent successfully');
      setShowCompose(false);
      setNewMessage({
        receiverId: '',
        subject: '',
        message: '',
        priority: 'normal',
        messageType: 'general'
      });
      fetchMessages();
      fetchContacts();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="messages">
      <div className="messages-header">
        <h2>Messages</h2>
        <div className="header-actions">
          <button onClick={() => setShowCompose(true)} className="btn-compose">
            <FaPlus /> Compose
          </button>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
      </div>

      <div className="messages-layout">
        <div className="messages-sidebar">
          <div className="message-tabs">
            <button 
              className={activeTab === 'inbox' ? 'active' : ''}
              onClick={() => setActiveTab('inbox')}
            >
              <FaEnvelope /> Inbox
              {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
            </button>
            <button 
              className={activeTab === 'sent' ? 'active' : ''}
              onClick={() => setActiveTab('sent')}
            >
              <FaEnvelopeOpen /> Sent
            </button>
            <button 
              className={activeTab === 'contacts' ? 'active' : ''}
              onClick={() => setActiveTab('contacts')}
            >
              <FaUser /> Contacts
            </button>
          </div>

          <div className="messages-list">
            {activeTab === 'contacts' ? (
              contacts.length === 0 ? (
                <p className="no-data">No contacts</p>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`message-item ${selectedContact?._id === getEntityId(contact._id) ? 'active' : ''}`}
                    onClick={() => openConversation(contact)}
                  >
                    <div className="message-header">
                      <div className="message-from">
                        <div className="sender-avatar">
                          {contact.role === 'doctor' ? <FaUserMd /> : <FaUser />}
                        </div>
                        <div className="sender-info">
                          <h4>{contact.name}</h4>
                          <p className="sender-role">{contact.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="message-content">
                      <p className="message-preview">
                        {contact.lastMessage ? `${contact.lastMessage.substring(0, 80)}${contact.lastMessage.length > 80 ? '...' : ''}` : 'No recent messages'}
                      </p>
                      {contact.unreadCount > 0 && <span className="tab-badge">{contact.unreadCount}</span>}
                    </div>
                  </div>
                ))
              )
            ) : messages.length === 0 ? (
              <p className="no-data">No messages</p>
            ) : (
              messages.map((message) => (
                <div 
                  key={message._id} 
                  className={`message-item ${!message.isRead && activeTab === 'inbox' ? 'unread' : ''}`}
                  onClick={() => openConversationFromMessage(message)}
                >
                  <div className="message-header">
                    <div className="message-from">
                      <div className="sender-avatar">
                        {message.senderRole === 'doctor' ? <FaUserMd /> : <FaUser />}
                      </div>
                      <div className="sender-info">
                        <h4>{activeTab === 'sent' ? message.receiverName : message.senderName}</h4>
                        <p className="sender-role">
                          {activeTab === 'sent' ? message.receiverRole : message.senderRole}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="message-content">
                    <h5 className="message-subject">{message.subject}</h5>
                    <p className="message-preview">
                      {message.message.substring(0, 100)}
                      {message.message.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="messages-main">
          {!selectedContact ? (
            <div className="messages-welcome">
              <FaEnvelope size={64} color="#ccc" />
              <h3>Select a conversation</h3>
              <p>Choose a message or contact from the sidebar to start messaging</p>
            </div>
          ) : (
            <>
              <div className="messages-header">
                <h3>{selectedContact.name}</h3>
                <span className="sender-role">{selectedContact.role}</span>
              </div>
              <div className="messages-list">
                {conversation.length === 0 ? (
                  <p className="no-data">No messages in this conversation yet</p>
                ) : (
                  conversation.map((msg) => {
                    const isOwn = getEntityId(msg.senderId) === getEntityId(user?._id || user?.id);
                    return (
                      <div key={msg._id} className={`message-item ${isOwn ? 'sent' : 'received'}`}>
                        <div className="message-header">
                          <div className="message-from">
                            <div className="sender-avatar">
                              {(msg.senderRole || msg.senderId?.role) === 'doctor' ? <FaUserMd /> : <FaUser />}
                            </div>
                            <div className="sender-info">
                              <h4>{msg.senderName || msg.senderId?.name}</h4>
                              <p className="sender-role">{msg.senderRole || msg.senderId?.role}</p>
                            </div>
                          </div>
                        </div>
                        <div className="message-content">
                          <h5 className="message-subject">{msg.subject}</h5>
                          <p>{msg.message}</p>
                          <small>{new Date(msg.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={sendReply} style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows="3"
                    placeholder={`Reply to ${selectedContact.name}...`}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    <FaPaperPlane /> Send Reply
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Compose Message</h3>
            
            <form onSubmit={sendMessage}>
              {contacts.length > 0 && (
                <div className="form-group">
                  <label>Select Existing Contact</label>
                  <select
                    value={newMessage.receiverId}
                    onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                  >
                    <option value="">-- Select contact --</option>
                    {contacts.map((contact) => (
                      <option key={contact._id} value={getEntityId(contact._id)}>
                        {contact.name} ({contact.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>To (User ID) *</label>
                <input
                  type="text"
                  value={newMessage.receiverId}
                  onChange={(e) => setNewMessage({...newMessage, receiverId: e.target.value})}
                  placeholder="Enter recipient user ID"
                  required
                />
                <small>Tip: Use contacts dropdown when available</small>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  rows="6"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  <FaPaperPlane /> Send Message
                </button>
                <button type="button" onClick={() => setShowCompose(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
// MongoDB Message Schema using Mongoose
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: String,
    required: true,
    index: true,
  },
  sender_id: {
    type: String,
    required: true,
    index: true,
  },
  receiver_id: {
    type: String,
    required: true,
    index: true,
  },
  text_content: {
    type: String,
    trim: true,
  },
  attachment_url: {
    type: String,
    trim: true,
  },
  attachment_filename: {
    type: String,
    trim: true,
  },
  attachment_mimetype: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  is_spam: {
    type: Boolean,
    default: false,
  },
  read_at: {
    type: Date,
  },
});

// Ensure that either text_content or attachment_url is present
messageSchema.pre('validate', function(next) {
  if (!this.text_content && !this.attachment_url) {
    next(new Error('Message must have either text_content or an attachment_url.'));
  } else {
    next();
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

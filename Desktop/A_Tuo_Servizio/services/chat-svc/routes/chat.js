// Express routes for chat functionalities
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/message');
const { sendMessageToKafka, kafkaTopic } = require('../kafka-handler'); // To send attachment messages

const router = express.Router();

// --- Multer Setup for File Uploads ---
const UPLOAD_DIR = path.join(__dirname, '../uploads'); // __dirname is 'routes' directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: fieldname-timestamp.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    // Add any specific file type filtering if needed
    // Example: allow only images
    // if (!file.mimetype.startsWith('image/')) {
    //   return cb(new Error('Only image files are allowed!'), false);
    // }
    cb(null, true);
  }
}).single('attachment'); // 'attachment' is the field name in the form-data

/**
 * @route POST /chat/upload/:conversation_id
 * @description Uploads an attachment for a chat message.
 * @param {string} conversation_id - The ID of the conversation.
 * @body {string} sender_id - ID of the sender.
 * @body {string} receiver_id - ID of the receiver.
 * @body {file} attachment - The file to upload.
 */
router.post('/upload/:conversation_id', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(500).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: `Unknown upload error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { conversation_id } = req.params;
    const { sender_id, receiver_id } = req.body; // These should be sent as form fields along with the file

    if (!sender_id || !receiver_id) {
      // If file uploaded but metadata missing, delete the file to prevent orphans
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting orphaned file:", unlinkErr);
      });
      return res.status(400).json({ error: 'Missing sender_id or receiver_id in request body.' });
    }
    
    // Conceptual: In a real system, you'd move this file to S3 or another persistent storage
    // and get a public URL. For now, we'll use a placeholder URL or a local path.
    const attachment_url = `/uploads/${req.file.filename}`; // Or placeholder S3 URL
    // const s3PlaceholderUrl = `https://s3.your-region.amazonaws.com/your-bucket-name/chat-attachments/${req.file.filename}`;


    const messagePayload = {
      conversation_id,
      sender_id,
      receiver_id,
      text_content: null, // Or some default text like "Attachment"
      attachment_url: attachment_url, // Use s3PlaceholderUrl in a real scenario
      attachment_filename: req.file.originalname,
      attachment_mimetype: req.file.mimetype,
      timestamp: new Date().toISOString(),
    };

    try {
      // Send the message with attachment info to Kafka
      await sendMessageToKafka(kafkaTopic, messagePayload);
      console.log(`Attachment message sent to Kafka for conversation ${conversation_id}:`, messagePayload);
      
      // Respond to the client
      // The actual message will be delivered via WebSocket after Kafka processing
      res.status(201).json({ 
        message: 'File uploaded and message queued.', 
        filename: req.file.filename, 
        attachment_url: attachment_url, // Send back the URL
        payload: messagePayload // Send back the full payload for client-side use
      });
    } catch (kafkaError) {
      console.error('Error sending attachment message to Kafka:', kafkaError);
      // If Kafka fails, consider deleting the uploaded file or implementing a retry
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file after Kafka failure:", unlinkErr);
      });
      res.status(500).json({ error: 'Failed to queue attachment message.' });
    }
  });
});

/**
 * @route POST /chat/messages/:message_id/reportSpam
 * @description Reports a message as spam.
 * @param {string} message_id - The ID of the message to report.
 */
router.post('/messages/:message_id/reportSpam', async (req, res) => {
  const { message_id } = req.params;
  try {
    const message = await Message.findByIdAndUpdate(
      message_id,
      { $set: { is_spam: true, updated_at: new Date() } }, // Assuming you add updated_at to schema
      { new: true } // Return the updated document
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    console.log(`Message ${message_id} reported as spam.`);
    // Optionally, send an event to Kafka or another service for further spam processing
    // await sendMessageToKafka('spam.reports', { messageId: message_id, reportedBy: req.user.id }); // Example

    res.status(200).json({ message: 'Message reported as spam successfully.', updatedMessage: message });
  } catch (error) {
    console.error(`Error reporting spam for message ${message_id}:`, error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid message ID format.' });
    }
    res.status(500).json({ error: 'Failed to report message as spam.' });
  }
});

/**
 * @route GET /chat/messages/:conversation_id
 * @description HTTP Polling Fallback: Get messages for a conversation.
 * @param {string} conversation_id - The ID of the conversation.
 * @query {string} [last_message_id] - Optional ID of the last message received by the client.
 *                                     If provided, only newer messages are returned.
 * @query {number} [limit=50] - Optional limit for number of messages.
 */
router.get('/messages/:conversation_id', async (req, res) => {
  const { conversation_id } = req.params;
  const { last_message_id, limit = 50 } = req.query;

  try {
    let query = { conversation_id };

    if (last_message_id) {
      // To get messages newer than last_message_id, we need its timestamp
      const lastMessage = await Message.findById(last_message_id).select('timestamp');
      if (lastMessage) {
        query.timestamp = { $gt: lastMessage.timestamp };
      } else {
        // last_message_id was provided but not found, could be an error or just means client is very out of sync
        console.warn(`last_message_id ${last_message_id} not found for polling in conversation ${conversation_id}. Returning latest messages.`);
      }
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 }) // Get newest first, or use 1 for oldest first depending on client needs
      .limit(parseInt(limit, 10))
      .lean(); // Use .lean() for faster queries if not modifying docs

    // If sorting newest first, client might want to reverse it for display
    res.status(200).json(messages.reverse()); // Reverse to send oldest first from the fetched batch
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversation_id} via polling:`, error);
     if (error.kind === 'ObjectId' && last_message_id) {
        return res.status(400).json({ error: 'Invalid last_message_id format.' });
    }
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});


// Serve static files from uploads directory (for local testing of attachments)
// In production, these would be served from S3 or a CDN.
router.use('/uploads', express.static(UPLOAD_DIR));


module.exports = router;

// Socket.io event handlers
const { sendMessageToKafka, KAFKA_TOPIC_CHAT_MESSAGES } = require('./kafka-handler');

// In-memory store for user sockets (simple example, consider Redis for scalability)
// maps userId to socket.id
const userSockets = new Map();

let ioInstance = null; // To store the io instance globally within this module

/**
 * Initializes Socket.IO event handlers and stores the io instance.
 * @param {object} io - The Socket.IO server instance.
 */
function initializeSocketIO(io) {
  ioInstance = io; // Store the io instance
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Store user socket on join for direct messaging
    socket.on('joinRoom', (userId) => {
      if (!userId) {
        console.warn(`User ID is missing for socket ${socket.id} during joinRoom.`);
        return;
      }
      socket.join(userId); // Join a room named after the userId
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} (socket ${socket.id}) joined their room.`);
      // console.log('Current user sockets:', userSockets);
    });

    // Handle incoming chat messages
    socket.on('chatMessage', async (data) => {
      console.log(`Received chatMessage from ${socket.id}:`, data);
      const { sender_id, receiver_id, text_content, attachment_url, attachment_filename, attachment_mimetype } = data;
      let { conversation_id } = data;

      if (!sender_id || !receiver_id || (!text_content && !attachment_url)) {
        console.error('Invalid chat message data:', data);
        // Optionally, send an error back to the client
        socket.emit('messageError', { error: 'Missing required fields (sender_id, receiver_id, and text_content or attachment_url).' });
        return;
      }

      // Generate a conversation_id if not provided
      // A common way is to sort IDs and concatenate, ensuring both users have the same ID for the conversation
      if (!conversation_id) {
        const ids = [sender_id, receiver_id].sort();
        conversation_id = ids.join('_');
      }

      const messagePayload = {
        conversation_id,
        sender_id,
        receiver_id,
        text_content,
        attachment_url,
        attachment_filename,
        attachment_mimetype,
        timestamp: new Date().toISOString(), // Ensure timestamp is consistent
      };

      try {
        // Send the message to Kafka
        await sendMessageToKafka(KAFKA_TOPIC_CHAT_MESSAGES, messagePayload); // Use specific topic
        console.log(`Message sent to Kafka topic ${KAFKA_TOPIC_CHAT_MESSAGES}:`, messagePayload);

        // Emit the message to the specific receiver's room if they are connected
        // This provides real-time feedback. Persistence is handled by Kafka consumer.
        const receiverSocketId = userSockets.get(receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', messagePayload);
          console.log(`Emitted newMessage to receiver ${receiver_id} (socket ${receiverSocketId})`);
        } else {
          console.log(`Receiver ${receiver_id} is not currently connected or socket ID not found.`);
        }
        // Also emit to sender for confirmation / UI update
        socket.emit('messageSent', messagePayload);


      } catch (error) {
        console.error('Error processing chat message or sending to Kafka:', error);
        socket.emit('messageError', { error: 'Failed to process message.' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { sender_id, receiver_id } = data;
      if (!sender_id || !receiver_id) return;
      const receiverSocketId = userSockets.get(receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { userId: sender_id, conversation_id: data.conversation_id });
        // console.log(`User ${sender_id} is typing to ${receiver_id}`);
      }
    });

    socket.on('stopTyping', (data) => {
      const { sender_id, receiver_id } = data;
      if (!sender_id || !receiver_id) return;
      const receiverSocketId = userSockets.get(receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { userId: sender_id, conversation_id: data.conversation_id });
        // console.log(`User ${sender_id} stopped typing to ${receiver_id}`);
      }
    });
    
    // Handle user leaving / disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove user from userSockets map
      for (const [userId, id] of userSockets.entries()) {
        if (id === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} (socket ${socket.id}) removed from userSockets.`);
          break;
        }
      }
      // console.log('Current user sockets after disconnect:', userSockets);
    });

    // Error handling for socket events
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
}

/**
 * Returns the Socket.IO server instance.
 * @returns {object|null} The io instance or null if not initialized.
 */
function getIoInstance() {
  return ioInstance;
}

module.exports = { initializeSocketIO, userSockets, getIoInstance };

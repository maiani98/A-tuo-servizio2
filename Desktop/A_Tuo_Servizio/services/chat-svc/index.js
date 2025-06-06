// Main entry point for the chat-svc
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // For serving static files if needed

const { connectDB } = require('./mongo');
const {
  connectProducer,
  disconnectProducer,
  startChatMessagesConsumer, // Renamed
  startQuoteEventsConsumer,  // New consumer for quote events
  disconnectConsumers,       // Renamed to disconnect all
  saveConsumedChatMessageToDB, // Renamed
  handleQuoteAcceptedEvent,  // Handler for quote events
  KAFKA_TOPIC_CHAT_MESSAGES, // Specific topic for chat
  KAFKA_TOPIC_QUOTE_EVENTS,  // Specific topic for quotes
} = require('./kafka-handler');
const { initializeSocketIO, userSockets, getIoInstance } = require('./socket-handler'); // getIoInstance might not be directly used here but ensures it's initialized
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configure this for your client's origin in production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001; // Different port from quote-svc

// --- Middleware ---
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- Static Files (if serving client from here or for uploads) ---
// Example: app.use(express.static(path.join(__dirname, 'public')));
// Uploads are served via chatRoutes: app.use('/api/chat/uploads', express.static(UPLOAD_DIR));

// --- API Routes ---
app.use('/api/chat', chatRoutes); // Mount chat routes under /api/chat

// Basic root route
app.get('/', (req, res) => {
  res.send(`chat-svc is running. Socket.IO is active. User Sockets: ${JSON.stringify(Array.from(userSockets.entries()))}`);
});

// --- Initialize Socket.IO ---
initializeSocketIO(io);

// --- Graceful Shutdown ---
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    // 1. Stop HTTP server from accepting new connections
    server.close(async (err) => {
      if (err) {
        console.error('Error during server close:', err);
      }
      console.log('HTTP server closed.');

      // 2. Disconnect Kafka producer and consumer
      await disconnectProducer();
      await disconnectConsumers(); // Use disconnectConsumers to close all active consumers

      // 3. Disconnect Mongoose
      const mongoose = require('mongoose'); // Get mongoose instance
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');

      console.log('Graceful shutdown complete.');
      process.exit(err ? 1 : 0);
    });

    // If server.close is taking too long, force exit
    setTimeout(() => {
      console.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000); // 10 seconds timeout

  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));


// --- Start the Service ---
async function startService() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Connect Kafka Producer
    await connectProducer();

    // 3. Start Kafka Consumer
    // The consumer will use saveConsumedChatMessageToDB to save messages to MongoDB.
    // The handler (saveConsumedChatMessageToDB) can internally use getIoInstance() if needed.
    await startChatMessagesConsumer(saveConsumedChatMessageToDB);

    // 3b. Start Kafka Consumer for Quote Events
    // The handler (handleQuoteAcceptedEvent) will process quote events, save system messages,
    // and use getIoInstance() to emit WebSocket messages.
    await startQuoteEventsConsumer(handleQuoteAcceptedEvent);


    // 4. Start HTTP and WebSocket Server
    // Note: initializeSocketIO(io) is called before this, which stores the io instance.
    server.listen(PORT, () => {
      console.log(`chat-svc listening on port ${PORT}`);
      console.log(`WebSocket server initialized.`);
    });

  } catch (error) {
    console.error('Failed to start chat-svc:', error);
    process.exit(1);
  }
}

startService();

module.exports = { app, server, io }; // For potential testing

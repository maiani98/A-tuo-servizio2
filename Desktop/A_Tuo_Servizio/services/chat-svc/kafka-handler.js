// KafkaJS client, producer, and consumer setup
const { Kafka } = require('kafkajs');
const Message = require('./models/message'); // To save messages from Kafka
const { userSockets, getIoInstance } = require('./socket-handler'); // To emit WebSocket events

// Placeholder for Kafka broker addresses
// In a real application, this would come from environment variables
const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const CHAT_SVC_CLIENT_ID = process.env.KAFKA_CLIENT_ID_CHAT_SVC || 'chat-svc'; // Renamed for clarity

const kafka = new Kafka({
  clientId: CHAT_SVC_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();
// Consumer for chat messages
const chatMessagesConsumer = kafka.consumer({ groupId: `${CHAT_SVC_CLIENT_ID}-chat-messages-group` });
// Consumer for quote events
const quoteEventsConsumer = kafka.consumer({ groupId: `${CHAT_SVC_CLIENT_ID}-quote-events-group` });

// Define Kafka topics (ensure consistency with producer services)
const KAFKA_TOPIC_CHAT_MESSAGES = process.env.KAFKA_TOPIC_CHAT_MESSAGES || 'chat.messages';
const KAFKA_TOPIC_QUOTE_EVENTS = process.env.KAFKA_TOPIC_QUOTE_EVENTS || 'quote.events';


/**
 * Connects the Kafka producer.
 */
async function connectProducer() {
  try {
    await producer.connect();
    console.log('Kafka producer connected successfully.');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
    process.exit(1); // Exit if producer connection fails
  }
}

/**
 * Disconnects the Kafka producer.
 */
async function disconnectProducer() {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected successfully.');
  } catch (error) {
    console.error('Error disconnecting Kafka producer:', error);
  }
}

/**
 * Sends a message to a Kafka topic.
 * @param {string} topic - The Kafka topic to send the message to.
 * @param {object} message - The message object to send (will be stringified).
 */
async function sendMessageToKafka(topic, message) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    // console.log(`Message sent to Kafka topic ${topic}:`, message);
  } catch (error) {
    console.error(`Error sending message to Kafka topic ${topic}:`, error);
    // Implement retry logic or dead-letter queue as needed
  }
}

/**
 * Starts a Kafka consumer to listen to a topic and process messages.
 * @param {function} handleChatMessageCallback - Callback to process chat messages.
 */
async function startChatMessagesConsumer(handleChatMessageCallback) {
  try {
    await chatMessagesConsumer.connect();
    console.log(`Kafka consumer connected for group ${chatMessagesConsumer.groupId}.`);
    await chatMessagesConsumer.subscribe({ topic: KAFKA_TOPIC_CHAT_MESSAGES, fromBeginning: true });
    console.log(`Subscribed to Kafka topic ${KAFKA_TOPIC_CHAT_MESSAGES}.`);

    await chatMessagesConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const parsedMessage = JSON.parse(message.value.toString());
          await handleChatMessageCallback(parsedMessage);
        } catch (err) {
          console.error(`Error processing message from Kafka topic ${topic}:`, err);
        }
      },
    });
  } catch (error) {
    console.error(`Error starting Kafka consumer for topic ${KAFKA_TOPIC_CHAT_MESSAGES}:`, error);
    process.exit(1);
  }
}

/**
 * Starts a Kafka consumer for quote events.
 * @param {function} handleQuoteEventCallback - Callback to process quote events.
 */
async function startQuoteEventsConsumer(handleQuoteEventCallback) {
  try {
    await quoteEventsConsumer.connect();
    console.log(`Kafka consumer connected for group ${quoteEventsConsumer.groupId}.`);
    await quoteEventsConsumer.subscribe({ topic: KAFKA_TOPIC_QUOTE_EVENTS, fromBeginning: true });
    console.log(`Subscribed to Kafka topic ${KAFKA_TOPIC_QUOTE_EVENTS}.`);

    await quoteEventsConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const parsedEvent = JSON.parse(message.value.toString());
          await handleQuoteEventCallback(parsedEvent);
        } catch (err) {
          console.error(`Error processing event from Kafka topic ${topic}:`, err);
        }
      },
    });
  } catch (error) {
    console.error(`Error starting Kafka consumer for topic ${KAFKA_TOPIC_QUOTE_EVENTS}:`, error);
    process.exit(1);
  }
}


/**
 * Disconnects all Kafka consumers.
 */
async function disconnectConsumers() {
  try {
    await chatMessagesConsumer.disconnect();
    console.log('Kafka chat messages consumer disconnected successfully.');
    await quoteEventsConsumer.disconnect();
    console.log('Kafka quote events consumer disconnected successfully.');
  } catch (error) {
    console.error('Error disconnecting Kafka consumers:', error);
  }
}

/**
 * Default handler for CHAT messages consumed from Kafka, saves them to MongoDB.
 * @param {object} chatMessageData - The chat message data received from Kafka.
 */
async function saveConsumedChatMessageToDB(chatMessageData) {
  try {
    const message = new Message(chatMessageData);
    await message.save();
    console.log(`Chat message saved to MongoDB. Conversation ID: ${message.conversation_id}, Sender ID: ${message.sender_id}`);
    
    // Potentially emit to WebSocket if direct emit in socket-handler failed or for other reasons
    // This requires io instance to be available here, e.g. via getIoInstance()
    const io = getIoInstance();
    if (io && chatMessageData.receiver_id && userSockets.has(chatMessageData.receiver_id)) {
        // This is somewhat redundant if socket-handler's 'chatMessage' already emits.
        // However, it can act as a fallback or for messages not originating from a direct socket connection.
        // io.to(userSockets.get(chatMessageData.receiver_id)).emit('newMessage', chatMessageData);
        // console.log(`[Kafka->DB Handler] Emitted newMessage to ${chatMessageData.receiver_id} as a fallback/confirmation.`);
    }

  } catch (error) {
    console.error('Error saving chat message from Kafka to MongoDB:', error);
  }
}

/**
 * Handler for QUOTE_ACCEPTED events consumed from Kafka.
 * Creates a system message in the chat and notifies users via WebSocket.
 * @param {object} quoteEventData - The quote event data from Kafka.
 */
async function handleQuoteAcceptedEvent(quoteEventData) {
  try {
    if (quoteEventData.eventType !== 'QUOTE_ACCEPTED') {
      console.log(`Ignoring event type: ${quoteEventData.eventType}`);
      return;
    }

    console.log('Processing QUOTE_ACCEPTED event:', quoteEventData);
    const { quoteId, clientId, professionalId, message: eventMessage } = quoteEventData;

    // 1. Construct conversation ID (consistent with how chat messages might do it)
    const ids = [clientId, professionalId].sort();
    const conversationId = ids.join('_');

    // 2. Create system message payload
    const systemMessagePayload = {
      conversation_id: conversationId,
      sender_id: 'SYSTEM_NOTIFICATION', // Special ID for system messages
      receiver_id: null, // Indicates broadcast to conversation participants or handled by specific emits
      text_content: eventMessage || `Quote ${quoteId} has been accepted.`,
      timestamp: new Date().toISOString(),
      // attachment_url, attachment_filename, attachment_mimetype are null/undefined
      is_spam: false,
      read_at: null,
    };

    // 3. Save system message to MongoDB
    const savedMessage = new Message(systemMessagePayload);
    await savedMessage.save();
    console.log(`SYSTEM_NOTIFICATION (QUOTE_ACCEPTED) saved to MongoDB for conversation ${conversationId}.`);

    // 4. Send real-time notification via WebSocket to both client and professional
    const io = getIoInstance(); // Get the Socket.IO instance
    if (!io) {
      console.error('Socket.IO instance not available in kafka-handler for QUOTE_ACCEPTED event.');
      return;
    }

    // Emit to client
    const clientSocketId = userSockets.get(clientId);
    if (clientSocketId) {
      io.to(clientSocketId).emit('newMessage', savedMessage.toObject()); // Send the saved message object
      console.log(`Sent 'newMessage' (QUOTE_ACCEPTED) to client ${clientId} (socket ${clientSocketId})`);
    } else {
      console.log(`Client ${clientId} not connected for QUOTE_ACCEPTED notification.`);
    }

    // Emit to professional
    const professionalSocketId = userSockets.get(professionalId);
    if (professionalSocketId) {
      io.to(professionalSocketId).emit('newMessage', savedMessage.toObject());
      console.log(`Sent 'newMessage' (QUOTE_ACCEPTED) to professional ${professionalId} (socket ${professionalSocketId})`);
    } else {
      console.log(`Professional ${professionalId} not connected for QUOTE_ACCEPTED notification.`);
    }

  } catch (error) {
    console.error('Error processing QUOTE_ACCEPTED event:', error);
  }
}


module.exports = {
  connectProducer,
  disconnectProducer,
  sendMessageToKafka, // Used by socket-handler to send chat messages
  startChatMessagesConsumer,
  startQuoteEventsConsumer, // New consumer for quote events
  disconnectConsumers, // Updated to disconnect all consumers
  saveConsumedChatMessageToDB, // Handler for chat messages
  handleQuoteAcceptedEvent, // Handler for quote events
  KAFKA_TOPIC_CHAT_MESSAGES, // Export topic name
  KAFKA_TOPIC_QUOTE_EVENTS,  // Export topic name
};

// KafkaJS client and producer setup for quote-svc
const { Kafka } = require('kafkajs');

// Placeholder for Kafka broker addresses
// Ensure these are consistent with chat-svc or use a shared config
const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID_QUOTE_SVC || 'quote-svc-producer'; // Unique client ID

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  // Optional: Add retry mechanism for producer
  // retry: {
  //   initialRetryTime: 100, // milliseconds
  //   retries: 8
  // }
});

const producer = kafka.producer();

// Kafka Topic for quote events
const KAFKA_TOPIC_QUOTE_EVENTS = process.env.KAFKA_TOPIC_QUOTE_EVENTS || 'quote.events';

/**
 * Connects the Kafka producer.
 */
async function connectProducer() {
  try {
    await producer.connect();
    console.log('Kafka producer connected successfully in quote-svc.');
  } catch (error) {
    console.error('Error connecting Kafka producer in quote-svc:', error);
    // Depending on the application's needs, you might want to retry or exit
    process.exit(1); 
  }
}

/**
 * Disconnects the Kafka producer.
 */
async function disconnectProducer() {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected successfully in quote-svc.');
  } catch (error) {
    console.error('Error disconnecting Kafka producer in quote-svc:', error);
  }
}

/**
 * Sends a message to a Kafka topic.
 * @param {string} topic - The Kafka topic to send the message to.
 * @param {object} message - The message object to send (will be stringified).
 * @returns {Promise<void>}
 * @throws {Error} if sending message fails.
 */
async function publishEvent(topic, eventPayload) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(eventPayload) }],
    });
    console.log(`Event published to Kafka topic ${topic}:`, eventPayload);
  } catch (error) {
    console.error(`Error publishing event to Kafka topic ${topic}:`, error);
    // Re-throw the error to be handled by the caller, or implement more robust error handling (e.g., DLQ)
    throw error; 
  }
}

module.exports = {
  connectProducer,
  disconnectProducer,
  publishEvent,
  KAFKA_TOPIC_QUOTE_EVENTS,
};

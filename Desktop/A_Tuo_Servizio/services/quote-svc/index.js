// Main entry point for the quote-svc
const express = require('express');
const bodyParser = require('body-parser'); // Express versions >= 4.16.0 have this built-in, but good to be explicit
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid'); // Required if generating IDs outside db functions, though db.js handles it.

const db = require('./db');
const kafkaProducer = require('./kafka-handler'); // Added Kafka handler
// const s3Handler = require('./s3-handler'); // Placeholder for S3 logic

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Store server instance for graceful shutdown
let server;

// Initialize Database and Kafka Producer, then start server
async function startServer() {
  try {
    await db.initializeDatabase();
    await kafkaProducer.connectProducer(); // Connect Kafka producer
    server = app.listen(port, () => {
      console.log(`quote-svc listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize database, Kafka producer, or start server:', err);
    process.exit(1); // Exit if initialization fails
  }
}

startServer();


// --- API Endpoints ---

/**
 * @route POST /quotes/request
 * @description Creates a new quote request.
 * @access Public
 * @body {string} clientId - ID of the client
 * @body {string} professionalId - ID of the professional
 * @body {string} serviceDescription - Description of the service
 */
app.post('/quotes/request', async (req, res) => {
  const { clientId, professionalId, serviceDescription } = req.body;

  if (!clientId || !professionalId || !serviceDescription) {
    return res.status(400).json({ error: 'Missing required fields: clientId, professionalId, serviceDescription' });
  }

  try {
    const quoteRequest = await db.createQuoteRequest(clientId, professionalId, serviceDescription);
    res.status(201).json(quoteRequest);
  } catch (error) {
    console.error('Error creating quote request:', error);
    res.status(500).json({ error: 'Failed to create quote request' });
  }
});

/**
 * @route POST /quotes/:quote_request_id/propose
 * @description Creates a new quote (proposal) for a given request.
 * @access Public // Should be restricted to professionals in a real app
 * @param {string} quote_request_id - ID of the quote request
 * @body {string} professionalId - ID of the professional making the proposal
 * @body {string} offerDescription - Description of the offer
 * @body {number} estimatedPrice - Estimated price for the service
 * @body {number} validUntilDays - Number of days the quote is valid
 * @body {object} [attachment] - Optional attachment file (conceptual)
 */
app.post('/quotes/:quote_request_id/propose', async (req, res) => {
  const { quote_request_id } = req.params;
  const { professionalId, offerDescription, estimatedPrice, validUntilDays /*, attachment */ } = req.body;

  if (!professionalId || !offerDescription || !estimatedPrice || validUntilDays === undefined) {
    return res.status(400).json({ error: 'Missing required fields: professionalId, offerDescription, estimatedPrice, validUntilDays' });
  }

  if (isNaN(parseInt(validUntilDays, 10)) || parseInt(validUntilDays, 10) <= 0) {
      return res.status(400).json({ error: 'validUntilDays must be a positive number.' });
  }

  try {
    // Calculate valid_until timestamp
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(validUntilDays, 10));

    let s3AttachmentUrl = null;
    // Placeholder for S3 attachment upload logic
    // if (attachment) {
    //   try {
    //     s3AttachmentUrl = await s3Handler.uploadAttachment(attachment); // Conceptual
    //   } catch (s3Error) {
    //     console.error('Error uploading attachment to S3:', s3Error);
    //     return res.status(500).json({ error: 'Failed to upload attachment' });
    //   }
    // }
    console.log(`Conceptual S3 Upload: attachment for quote request ${quote_request_id} would be uploaded here. URL: ${s3AttachmentUrl}`);


    // Create the quote
    const quote = await db.createQuote(quote_request_id, professionalId, offerDescription, parseFloat(estimatedPrice), validUntil, s3AttachmentUrl);

    // Update the quote request status to PROPOSED
    await db.updateQuoteRequestStatus(quote_request_id, 'PROPOSED');

    res.status(201).json(quote);
  } catch (error) {
    console.error(`Error proposing quote for request ${quote_request_id}:`, error);
    if (error.message.includes("not found")) { // Check if it's a "not found" error from db layer
        return res.status(404).json({ error: `Quote request with ID ${quote_request_id} not found or professional ID mismatch.` });
    }
    res.status(500).json({ error: 'Failed to propose quote' });
  }
});

/**
 * @route POST /quotes/:quote_id/accept
 * @description Accepts a quote.
 * @access Public // Should be restricted to clients in a real app
 * @param {string} quote_id - ID of the quote to accept
 */
app.post('/quotes/:quote_id/accept', async (req, res) => {
  const { quote_id } = req.params;

  try {
    const updatedQuote = await db.updateQuoteStatus(quote_id, 'ACCEPTED');
    // Note: db.updateQuoteStatus already throws if not found, so this check might be redundant
    // if (!updatedQuote) { 
    //   return res.status(404).json({ error: `Quote with ID ${quote_id} not found.` });
    // }

    // Update the corresponding quote_requests status to ACCEPTED
    const updatedQuoteRequest = await db.updateQuoteRequestStatus(updatedQuote.quote_request_id, 'ACCEPTED');
    
    // --- Publish event to Kafka ---
    try {
      const eventPayload = {
        eventType: 'QUOTE_ACCEPTED',
        quoteId: updatedQuote.id,
        quoteRequestId: updatedQuote.quote_request_id,
        clientId: updatedQuoteRequest.client_id, // Assuming client_id is on quote_request
        professionalId: updatedQuote.professional_id, // professional_id is on the quote itself
        message: `Quote ${updatedQuote.id} has been accepted by the client.`,
        timestamp: new Date().toISOString(),
      };
      await kafkaProducer.publishEvent(kafkaProducer.KAFKA_TOPIC_QUOTE_EVENTS, eventPayload);
      console.log(`QUOTE_ACCEPTED event published for quote ${quote_id}`);
    } catch (kafkaError) {
      // Log the error but don't fail the HTTP request if Kafka publishing fails
      // In a production system, you might have a more robust retry or dead-letter queue strategy
      console.error(`Failed to publish QUOTE_ACCEPTED event for quote ${quote_id} to Kafka:`, kafkaError);
      // Optionally, add a note to the response indicating partial failure
      // updatedQuote.kafkaPublishError = 'Failed to notify services.'; 
    }
    // --- End Kafka Publishing ---

    res.status(200).json(updatedQuote);
  } catch (error) {
    console.error(`Error accepting quote ${quote_id}:`, error);
     if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to accept quote' });
  }
});

/**
 * @route POST /quotes/:quote_id/refuse
 * @description Refuses a quote.
 * @access Public // Should be restricted to clients in a real app
 * @param {string} quote_id - ID of the quote to refuse
 */
app.post('/quotes/:quote_id/refuse', async (req, res) => {
  const { quote_id } = req.params;

  try {
    const updatedQuote = await db.updateQuoteStatus(quote_id, 'REFUSED');
     if (!updatedQuote) { // Should be handled by error in db.js if not found
      return res.status(404).json({ error: `Quote with ID ${quote_id} not found.` });
    }
    // Update the corresponding quote_requests status to REFUSED
    // Note: A single request can have multiple quotes. If one is refused, the request might still be 'PROPOSED' if other quotes exist.
    // For simplicity here, we update it to REFUSED. A more complex logic might be needed.
    await db.updateQuoteRequestStatus(updatedQuote.quote_request_id, 'REFUSED');
    res.status(200).json(updatedQuote);
  } catch (error) {
    console.error(`Error refusing quote ${quote_id}:`, error);
    if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to refuse quote' });
  }
});


// --- Cron Jobs ---

/**
 * Cron job to expire quotes.
 * Runs daily at midnight.
 */
cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job: expire_quotes');
  try {
    const expiredQuotes = await db.findExpiredQuotes();
    if (expiredQuotes.length === 0) {
      console.log('No quotes to expire.');
      return;
    }

    for (const quote of expiredQuotes) {
      console.log(`Expiring quote ID: ${quote.id} for request ID: ${quote.quote_request_id}`);
      await db.updateQuoteStatus(quote.id, 'EXPIRED');
      // Also update the parent quote_request if no other active proposals exist (optional complex logic)
      // For now, directly setting the request to EXPIRED if its associated quote expires.
      // This assumes one primary quote per request for expiration logic, or that expiration of one quote expires the request.
      await db.updateQuoteRequestStatus(quote.quote_request_id, 'EXPIRED');
    }
    console.log(`Expired ${expiredQuotes.length} quotes.`);
  } catch (error) {
    console.error('Error running expire_quotes cron job:', error);
  }
});

// Basic root route
app.get('/', (req, res) => {
  res.send('quote-svc is running. See documentation for API endpoints.');
});

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// --- Graceful Shutdown ---
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    // 1. Stop HTTP server from accepting new connections
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            console.error('Error during server close:', err);
            return reject(err);
          }
          console.log('HTTP server closed.');
          resolve();
        });
      });
    }

    // 2. Disconnect Kafka producer
    await kafkaProducer.disconnectProducer();

    // 3. Disconnect Database pool (if your db module exposes a disconnect function)
    if (db.pool && typeof db.pool.end === 'function') {
      await db.pool.end();
      console.log('PostgreSQL pool disconnected.');
    }
    
    console.log('Graceful shutdown complete.');
    process.exit(0);

  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));


// Note: s3-handler.js is not created in this step, as it's a placeholder.
// If actual S3 functionality were to be implemented, s3-handler.js would be needed.

module.exports = app; // For potential testing

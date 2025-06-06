// Database connection and query functions
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Placeholder for database connection details
// In a real application, these would come from environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'quotes_db',
  port: process.env.DB_PORT || 5432,
});

// SQL statements for creating tables
const CREATE_QUOTE_REQUESTS_TABLE = `
  CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    professional_id VARCHAR(255) NOT NULL,
    service_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- NEW, PROPOSED, ACCEPTED, REFUSED, EXPIRED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const CREATE_QUOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY,
    quote_request_id UUID NOT NULL REFERENCES quote_requests(id),
    professional_id VARCHAR(255) NOT NULL,
    offer_description TEXT NOT NULL,
    estimated_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED', -- PROPOSED, ACCEPTED, REFUSED, EXPIRED
    valid_until TIMESTAMPTZ NOT NULL,
    s3_attachment_url VARCHAR(2048), -- URL for the attachment in S3
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

/**
 * Initializes the database by creating tables if they don't exist.
 */
async function initializeDatabase() {
  try {
    await pool.query(CREATE_QUOTE_REQUESTS_TABLE);
    await pool.query(CREATE_QUOTES_TABLE);
    console.log('Database tables checked/created successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    // In a real application, you might want to exit the process or implement a retry mechanism
    process.exit(1); 
  }
}

/**
 * Creates a new quote request.
 * @param {string} clientId - The ID of the client requesting the quote.
 * @param {string} professionalId - The ID of the professional to send the request to.
 * @param {string} serviceDescription - A description of the service requested.
 * @returns {Promise<object>} The created quote request object.
 */
async function createQuoteRequest(clientId, professionalId, serviceDescription) {
  const id = uuidv4();
  const query = `
    INSERT INTO quote_requests (id, client_id, professional_id, service_description, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'NEW', NOW(), NOW())
    RETURNING *;
  `;
  const values = [id, clientId, professionalId, serviceDescription];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating quote request:', err);
    throw err;
  }
}

/**
 * Updates the status of a quote request.
 * @param {string} quoteRequestId - The ID of the quote request to update.
 * @param {string} status - The new status.
 * @returns {Promise<object>} The updated quote request object.
 */
async function updateQuoteRequestStatus(quoteRequestId, status) {
  const query = `
    UPDATE quote_requests
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const values = [status, quoteRequestId];
  try {
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      throw new Error(`Quote request with ID ${quoteRequestId} not found.`);
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error updating quote request status:', err);
    throw err;
  }
}

/**
 * Creates a new quote (proposal).
 * @param {string} quoteRequestId - The ID of the parent quote request.
 * @param {string} professionalId - The ID of the professional providing the quote.
 * @param {string} offerDescription - A description of the offer.
 * @param {number} estimatedPrice - The estimated price for the service.
 * @param {Date} validUntil - The timestamp until which the quote is valid.
 * @param {string} [s3AttachmentUrl] - Optional URL of an attachment in S3.
 * @returns {Promise<object>} The created quote object.
 */
async function createQuote(quoteRequestId, professionalId, offerDescription, estimatedPrice, validUntil, s3AttachmentUrl) {
  const id = uuidv4();
  const query = `
    INSERT INTO quotes (id, quote_request_id, professional_id, offer_description, estimated_price, status, valid_until, s3_attachment_url, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 'PROPOSED', $6, $7, NOW(), NOW())
    RETURNING *;
  `;
  const values = [id, quoteRequestId, professionalId, offerDescription, estimatedPrice, validUntil, s3AttachmentUrl];
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating quote:', err);
    throw err;
  }
}

/**
 * Updates the status of a quote.
 * @param {string} quoteId - The ID of the quote to update.
 * @param {string} status - The new status.
 * @returns {Promise<object>} The updated quote object.
 */
async function updateQuoteStatus(quoteId, status) {
  const query = `
    UPDATE quotes
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const values = [status, quoteId];
  try {
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      throw new Error(`Quote with ID ${quoteId} not found.`);
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error updating quote status:', err);
    throw err;
  }
}

/**
 * Finds quotes that are PROPOSED and whose valid_until timestamp is in the past.
 * @returns {Promise<Array<object>>} A list of expired quotes.
 */
async function findExpiredQuotes() {
    const query = `
        SELECT *
        FROM quotes
        WHERE status = 'PROPOSED' AND valid_until < NOW();
    `;
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error('Error finding expired quotes:', err);
        throw err;
    }
}

module.exports = {
  pool, // Exporting the pool can be useful for direct access if needed elsewhere
  initializeDatabase,
  createQuoteRequest,
  updateQuoteRequestStatus,
  createQuote,
  updateQuoteStatus,
  findExpiredQuotes,
};

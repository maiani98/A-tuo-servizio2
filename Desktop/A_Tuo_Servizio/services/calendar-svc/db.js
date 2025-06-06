// PostgreSQL database interaction logic for calendar-svc
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Placeholder for database connection details
// In a real application, these would come from environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'calendar_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'calendar_db',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// SQL for creating the availability_slots table
const CREATE_AVAILABILITY_SLOTS_TABLE = `
  CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY,
    professional_id VARCHAR(255) NOT NULL, -- Assuming professional_id is a string; could be UUID
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'booked', 'unavailable'
    client_id VARCHAR(255), -- Stores the ID of the client who booked the slot
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_slot_per_professional UNIQUE (professional_id, start_time) -- Prevents duplicate slots
  );

  CREATE INDEX IF NOT EXISTS idx_professional_id ON availability_slots(professional_id);
  CREATE INDEX IF NOT EXISTS idx_start_time ON availability_slots(start_time);
  CREATE INDEX IF NOT EXISTS idx_status ON availability_slots(status);
`;

/**
 * Initializes the database by creating tables if they don't exist.
 */
async function initializeDatabase() {
  try {
    await pool.query(CREATE_AVAILABILITY_SLOTS_TABLE);
    console.log('Database table "availability_slots" checked/created successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1); // Exit if DB initialization fails
  }
}

/**
 * Generates and inserts availability slots for a professional on a specific date.
 * @param {string} professionalId - The ID of the professional.
 * @param {Date} date - The specific date for which to generate slots (YYYY-MM-DD).
 * @param {string} dayStartTimeStr - Start time for the day (e.g., "09:00").
 * @param {string} dayEndTimeStr - End time for the day (e.g., "17:00").
 * @param {number} slotDurationMinutes - Duration of each slot in minutes.
 * @returns {Promise<Array<object>>} Array of created slot objects or empty if slots exist/error.
 */
async function generateSlotsForProfessional(professionalId, date, dayStartTimeStr, dayEndTimeStr, slotDurationMinutes) {
  const createdSlots = [];
  const [startHour, startMinute] = dayStartTimeStr.split(':').map(Number);
  const [endHour, endMinute] = dayEndTimeStr.split(':').map(Number);

  const baseDate = new Date(date); // Ensure date is treated as local or UTC consistently
  baseDate.setUTCHours(0,0,0,0); // Normalize to UTC midnight for consistency if date is just YYYY-MM-DD

  let currentTime = new Date(baseDate);
  currentTime.setUTCHours(startHour, startMinute, 0, 0);

  const dayEndTime = new Date(baseDate);
  dayEndTime.setUTCHours(endHour, endMinute, 0, 0);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    while (currentTime < dayEndTime) {
      const slotStartTime = new Date(currentTime);
      const slotEndTime = new Date(currentTime.getTime() + slotDurationMinutes * 60000);

      if (slotEndTime > dayEndTime) break; // Do not create slots past the day's end time

      const slotId = uuidv4();
      const insertQuery = `
        INSERT INTO availability_slots (id, professional_id, start_time, end_time, status)
        VALUES ($1, $2, $3, $4, 'available')
        ON CONFLICT (professional_id, start_time) DO NOTHING -- Important: prevent duplicates
        RETURNING *;
      `;
      // Use UTC for storing and querying TIMESTAMPTZ
      const values = [slotId, professionalId, slotStartTime.toISOString(), slotEndTime.toISOString()];
      
      try {
        const res = await client.query(insertQuery, values);
        if (res.rows.length > 0) {
          createdSlots.push(res.rows[0]);
        } else {
          // console.log(`Slot already exists for ${professionalId} at ${slotStartTime.toISOString()}`);
        }
      } catch (err) {
          // This might catch unique constraint violations if ON CONFLICT is not working as expected or other errors
          console.warn(`Warning inserting slot for ${professionalId} at ${slotStartTime.toISOString()}: ${err.message}. This might be a concurrent write or existing slot.`);
      }
      currentTime = slotEndTime;
    }
    await client.query('COMMIT');
    return createdSlots;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error generating slots for professional ${professionalId} on ${date}:`, error);
    throw error;
  } finally {
    client.release();
  }
}


/**
 * Books an availability slot for a client.
 * @param {string} slotId - The UUID of the slot to book.
 * @param {string} clientId - The ID of the client booking the slot.
 * @returns {Promise<object>} The updated slot object.
 * @throws {Error} if slot not found or already booked.
 */
async function bookSlot(slotId, clientId) {
  const query = `
    UPDATE availability_slots
    SET status = 'booked', client_id = $1, updated_at = NOW()
    WHERE id = $2 AND status = 'available'
    RETURNING *;
  `;
  const values = [clientId, slotId];
  try {
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      // Check if the slot exists to give a more specific error
      const existingSlot = await pool.query('SELECT status FROM availability_slots WHERE id = $1', [slotId]);
      if (existingSlot.rows.length === 0) {
          throw new Error(`Slot with ID ${slotId} not found.`);
      }
      if (existingSlot.rows[0].status === 'booked') {
          throw new Error(`Slot with ID ${slotId} is already booked.`);
      }
      throw new Error(`Slot with ID ${slotId} could not be booked (possibly not available).`);
    }
    return res.rows[0];
  } catch (err) {
    console.error(`Error booking slot ${slotId} for client ${clientId}:`, err);
    throw err;
  }
}

/**
 * Fetches available slots for a professional within a given date range.
 * @param {string} professionalId - The ID of the professional.
 * @param {string} startDateISO - The start date of the range (ISO string, e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").
 * @param {string} endDateISO - The end date of the range (ISO string).
 * @returns {Promise<Array<object>>} A list of available slots.
 */
async function getProfessionalAvailability(professionalId, startDateISO, endDateISO) {
  const query = `
    SELECT id, professional_id, start_time, end_time, status
    FROM availability_slots
    WHERE professional_id = $1
      AND status = 'available'
      AND start_time >= $2
      AND end_time <= $3
    ORDER BY start_time ASC;
  `;
  const values = [professionalId, startDateISO, endDateISO];
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error(`Error fetching availability for professional ${professionalId}:`, err);
    throw err;
  }
}

/**
 * Fetches booked appointments for a professional within a date range for iCalendar export.
 * @param {string} professionalId - The ID of the professional.
 * @param {string} startDateISO - The start date of the range (ISO string).
 * @param {string} endDateISO - The end date of the range (ISO string).
 * @returns {Promise<Array<object>>} A list of booked appointments.
 */
async function getAppointmentsForExport(professionalId, startDateISO, endDateISO) {
  const query = `
    SELECT id, professional_id, client_id, start_time, end_time, status, created_at, updated_at
    FROM availability_slots
    WHERE professional_id = $1
      AND status = 'booked'
      AND start_time >= $2
      AND end_time <= $3
    ORDER BY start_time ASC;
  `;
  const values = [professionalId, startDateISO, endDateISO];
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error(`Error fetching appointments for export for professional ${professionalId}:`, err);
    throw err;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  generateSlotsForProfessional,
  bookSlot,
  getProfessionalAvailability,
  getAppointmentsForExport,
};

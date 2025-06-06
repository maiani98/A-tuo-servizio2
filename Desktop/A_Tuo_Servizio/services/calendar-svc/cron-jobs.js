// Cron job definitions for calendar-svc
const cron = require('node-cron');
const db = require('./db');

// --- Configuration for Slot Generation ---
// In a real app, this might come from a config file or a database
const PROFESSIONALS_TO_SCHEDULE = [
  { id: 'prof_001', dailyStartTime: '09:00', dailyEndTime: '17:00', slotDurationMinutes: 60 },
  { id: 'prof_002', dailyStartTime: '10:00', dailyEndTime: '18:00', slotDurationMinutes: 30 },
  // Add more professionals as needed
];
const DAYS_TO_PRE_GENERATE = 7; // Generate slots for the next 7 days

/**
 * Generates daily availability slots for all configured professionals.
 * This function is intended to be called by a cron job.
 */
async function generateDailySlotsForAllProfessionals() {
  console.log(`[${new Date().toISOString()}] Running daily slot generation job...`);

  for (const prof of PROFESSIONALS_TO_SCHEDULE) {
    console.log(`Generating slots for professional: ${prof.id}`);
    for (let i = 0; i < DAYS_TO_PRE_GENERATE; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      try {
        const createdSlots = await db.generateSlotsForProfessional(
          prof.id,
          dateString,
          prof.dailyStartTime,
          prof.dailyEndTime,
          prof.slotDurationMinutes
        );
        if (createdSlots.length > 0) {
          console.log(`  Successfully generated ${createdSlots.length} slots for ${prof.id} on ${dateString}.`);
        } else {
          // console.log(`  No new slots generated for ${prof.id} on ${dateString} (likely already exist or no valid times).`);
        }
      } catch (error) {
        console.error(`  Error generating slots for ${prof.id} on ${dateString}:`, error.message);
      }
    }
  }
  console.log(`[${new Date().toISOString()}] Daily slot generation job finished.`);
}

/**
 * Schedules the cron jobs.
 * Call this function from your main application file (e.g., index.js).
 */
function scheduleCronJobs() {
  // Schedule 'generate_daily_slots' to run daily at midnight (server time)
  // Adjust cron expression as needed, e.g., '0 1 * * *' for 1 AM
  cron.schedule('0 0 * * *', generateDailySlotsForAllProfessionals, {
    scheduled: true,
    timezone: "Etc/UTC" // Or your server's timezone, e.g., "America/New_York"
  });

  console.log('Cron job "generate_daily_slots" scheduled to run daily at midnight UTC.');

  // Immediately run for testing if needed (optional)
  // generateDailySlotsForAllProfessionals();
}

module.exports = {
  scheduleCronJobs,
  generateDailySlotsForAllProfessionals, // Export for manual triggering if needed
};

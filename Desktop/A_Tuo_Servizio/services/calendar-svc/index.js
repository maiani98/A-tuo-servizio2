// Main entry point for the calendar-svc
const express = require('express');
const db = require('./db');
const { scheduleCronJobs } = require('./cron-jobs');
const calendarRoutes = require('./routes/calendar');

const app = express();
const PORT = process.env.PORT || 3002; // Different port from other services

// --- Middleware ---
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- API Routes ---
app.use('/api', calendarRoutes); // Mount calendar routes under /api (e.g. /api/calendar/:professional_id/availability)
                                 // Or use /api/calendar if routes in calendar.js start with /:professional_id etc.
                                 // For clarity, let's assume calendarRoutes are defined like router.get('/:professional_id/availability', ...)
                                 // So mounting them under /api/calendar is more explicit:
app.use('/api/calendar', calendarRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'calendar-svc' });
});


// Basic root route
app.get('/', (req, res) => {
  res.send('calendar-svc is running.');
});

// --- Graceful Shutdown ---
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    // 1. Stop HTTP server from accepting new connections
    const serverClosePromise = new Promise((resolve, reject) => {
        httpServer.close((err) => {
            if (err) {
                console.error('Error during server close:', err);
                return reject(err);
            }
            console.log('HTTP server closed.');
            resolve();
        });
    });

    await serverClosePromise;

    // 2. Disconnect PostgreSQL pool
    if (db.pool) {
        await db.pool.end();
        console.log('PostgreSQL pool disconnected.');
    }
    
    // 3. Stop cron jobs (node-cron tasks stop themselves on process exit, but explicit cleanup can be added if needed)
    // For node-cron, tasks are usually stopped when the process exits.
    // If you have references to tasks, you can call task.stop().

    console.log('Graceful shutdown complete.');
    process.exit(0);

  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Store httpServer instance for graceful shutdown
let httpServer;

// --- Start the Service ---
async function startService() {
  try {
    // 1. Initialize Database (create tables if they don't exist)
    await db.initializeDatabase();

    // 2. Schedule Cron Jobs
    scheduleCronJobs(); // This will log that jobs are scheduled

    // 3. Start HTTP Server
    httpServer = app.listen(PORT, () => {
      console.log(`calendar-svc listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start calendar-svc:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startService();

module.exports = app; // For potential testing

// Express routes for calendar-svc
const express = require('express');
const db = require('../db');
const { generateICS } = require('../ical-service');
const { createGoogleCalendarEvent } = require('../google-calendar-integration'); // Placeholder

const router = express.Router();

/**
 * @route GET /calendar/:professional_id/availability
 * @description Get available slots for a professional within a date range.
 * @param {string} professional_id - ID of the professional.
 * @query {string} start_date - Start date of the range (YYYY-MM-DD or ISO string).
 * @query {string} end_date - End date of the range (YYYY-MM-DD or ISO string).
 */
router.get('/:professional_id/availability', async (req, res) => {
  const { professional_id } = req.params;
  const { start_date, end_date } = req.query;

  if (!professional_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing professional_id, start_date, or end_date.' });
  }

  try {
    // Ensure dates are valid ISO strings for PostgreSQL TIMESTAMPTZ comparison
    // The client should send dates in a format that can be parsed into valid ISO strings.
    // For simplicity, we assume they are if they are just dates, or full ISO strings.
    const startDateISO = new Date(start_date).toISOString();
    // For end_date, ensure it covers the entire day if only a date is provided.
    const endDateObj = new Date(end_date);
    endDateObj.setUTCHours(23, 59, 59, 999); // Set to end of day UTC
    const endDateISO = endDateObj.toISOString();


    const availability = await db.getProfessionalAvailability(professional_id, startDateISO, endDateISO);
    res.status(200).json(availability);
  } catch (error) {
    console.error(`Error fetching availability for professional ${professional_id}:`, error);
    res.status(500).json({ error: 'Failed to fetch availability.' });
  }
});

/**
 * @route POST /calendar/slots/:slot_id/book
 * @description Book an available slot.
 * @param {string} slot_id - UUID of the slot to book.
 * @body {string} client_id - ID of the client booking the slot.
 * @body {string} [oauth_token] - Optional OAuth token for Google Calendar integration (conceptual).
 */
router.post('/slots/:slot_id/book', async (req, res) => {
  const { slot_id } = req.params;
  const { client_id, oauth_token } = req.body; // oauth_token is for conceptual Google Calendar part

  if (!client_id) {
    return res.status(400).json({ error: 'Missing client_id in request body.' });
  }
  if (!slot_id) {
    return res.status(400).json({ error: 'Missing slot_id in params.' });
  }

  try {
    const bookedSlot = await db.bookSlot(slot_id, client_id);
    
    // --- Placeholder for Google Calendar Integration ---
    if (bookedSlot && oauth_token) { // oauth_token would come from client's session with Google
      console.log(`[Calendar Service] Slot ${slot_id} booked. Initiating Google Calendar event creation (placeholder).`);
      try {
        // In a real app, you'd fetch more details for the event
        const appointmentDetails = {
          ...bookedSlot, // Contains start_time, end_time, client_id, professional_id
          // You might need to fetch professional's email or client's email if available
        };
        const googleEvent = await createGoogleCalendarEvent(appointmentDetails, oauth_token);
        console.log(`[Calendar Service] Google Calendar event placeholder created: ${googleEvent.htmlLink}`);
        // Add googleEvent.htmlLink to the response if needed
        bookedSlot.googleCalendarLink = googleEvent.htmlLink;
      } catch (googleError) {
        console.error(`[Calendar Service] Failed to create Google Calendar event for slot ${slot_id}:`, googleError.message);
        // Do not fail the booking if Google Calendar integration fails, but log it.
        // The response could include a warning or partial success message.
        bookedSlot.googleCalendarWarning = 'Failed to create Google Calendar event.';
      }
    }
    // --- End Placeholder ---

    res.status(200).json({ message: 'Slot booked successfully.', slot: bookedSlot });
  } catch (error) {
    console.error(`Error booking slot ${slot_id}:`, error);
    if (error.message.includes('not found') || error.message.includes('already booked') || error.message.includes('not be booked')) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to book slot.' });
  }
});

/**
 * @route GET /calendar/:professional_id/export.ics
 * @description Export booked appointments as an iCalendar (.ics) file.
 * @param {string} professional_id - ID of the professional.
 * @query {string} start_date - Start date of the range for export.
 * @query {string} end_date - End date of the range for export.
 */
router.get('/:professional_id/export.ics', async (req, res) => {
  const { professional_id } = req.params;
  const { start_date, end_date } = req.query;

  if (!professional_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing professional_id, start_date, or end_date for export.' });
  }

  try {
    const startDateISO = new Date(start_date).toISOString();
    const endDateObj = new Date(end_date);
    endDateObj.setUTCHours(23, 59, 59, 999);
    const endDateISO = endDateObj.toISOString();

    const appointments = await db.getAppointmentsForExport(professional_id, startDateISO, endDateISO);
    
    // Fetch professional's name if available for calendar name (optional)
    // const professionalDetails = await db.getProfessionalDetails(professional_id); 
    // const calendarName = professionalDetails ? `${professionalDetails.name}'s Calendar` : 'Calendar Export';
    const calendarName = `${professional_id}'s Bookings`;


    const icsString = generateICS(appointments, calendarName);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${professional_id}_calendar.ics"`);
    res.status(200).send(icsString);
  } catch (error) {
    console.error(`Error exporting iCalendar for professional ${professional_id}:`, error);
    res.status(500).json({ error: 'Failed to export iCalendar data.' });
  }
});

module.exports = router;

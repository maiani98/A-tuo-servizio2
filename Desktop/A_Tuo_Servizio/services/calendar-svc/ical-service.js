// iCalendar (.ics) generation logic
const ical = require('ical-generator');

/**
 * Generates an iCalendar string from a list of appointments.
 * @param {Array<object>} appointments - Array of appointment objects.
 * Each object should have:
 *   - start_time (Date or ISO string)
 *   - end_time (Date or ISO string)
 *   - client_id (String, optional, for summary)
 *   - professional_id (String, optional, for organizer or description)
 *   - id (String, optional, for UID)
 * @param {string} [professionalName] - Optional name of the professional for the calendar.
 * @returns {string} The iCalendar data as a string.
 */
function generateICS(appointments, professionalName = 'Professional Calendar') {
  const calendar = ical({ name: professionalName });

  if (!appointments || appointments.length === 0) {
    // Return an empty calendar or a calendar with a note, if preferred
    // For now, just an empty calendar.
    return calendar.toString();
  }

  appointments.forEach(appointment => {
    const summary = `Booked Appointment with Client ${appointment.client_id || 'N/A'}`;
    const description = `Details for appointment ID: ${appointment.id}. Professional ID: ${appointment.professional_id}.`;

    // Ensure dates are valid Date objects for ical-generator
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);

    if (isNaN(startTime.valueOf()) || isNaN(endTime.valueOf())) {
        console.warn(`Invalid date for appointment ${appointment.id}, skipping.`);
        return; // Skip this event
    }

    calendar.createEvent({
      start: startTime,
      end: endTime,
      summary: summary,
      description: description,
      uid: appointment.id, // Use slot ID as UID for uniqueness
      organizer: { // Optional: Add organizer info
        name: appointment.professional_id, // Could be professional's actual name if available
        email: `professional-${appointment.professional_id}@example.com`, // Placeholder email
      },
      // You can add more fields like location, attendees, etc.
    });
  });

  return calendar.toString();
}

module.exports = {
  generateICS,
};

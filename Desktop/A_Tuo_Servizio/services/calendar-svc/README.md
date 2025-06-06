# Calendar Service (`calendar-svc`)

The Calendar Service is a microservice responsible for managing professionals' availability slots, handling bookings, and providing iCalendar exports of appointments.

## Features

-   Manages availability slots for professionals in a PostgreSQL database.
-   Automated daily generation of availability slots via a cron job.
-   Allows clients to view professional availability within a date range.
-   Allows clients to book available slots.
-   Exports booked appointments for a professional as an iCalendar (.ics) file.
-   Placeholder for Google Calendar integration upon booking.

## Core Technologies

-   **Node.js**: Runtime environment.
-   **Express.js**: HTTP server framework for API endpoints.
-   **PostgreSQL (`pg`)**: Database for storing availability slots.
-   **`ical-generator`**: Library for creating iCalendar (.ics) files.
-   **`node-cron`**: For scheduling background jobs (slot generation).
-   **`uuid`**: For generating unique IDs for slots.

## Prerequisites

-   Node.js (v14.x or later recommended; `ical-generator` might prefer newer versions like v20+).
-   npm (comes with Node.js).
-   A running PostgreSQL instance.

## Environment Variables (Placeholder)

Configure these environment variables before running the service. Defaults are provided in `db.js`.

-   `PORT`: Port for the service to run on (default: 3002).
-   `DB_HOST`: PostgreSQL host (default: `localhost`).
-   `DB_USER`: PostgreSQL user (default: `calendar_user`).
-   `DB_PASSWORD`: PostgreSQL password (default: `password`).
-   `DB_NAME`: PostgreSQL database name (default: `calendar_db`).
-   `DB_PORT`: PostgreSQL port (default: `5432`).

## Database Schema (`availability_slots`)

-   `id` (UUID, PK)
-   `professional_id` (VARCHAR/UUID, indexed)
-   `start_time` (TIMESTAMPTZ)
-   `end_time` (TIMESTAMPTZ)
-   `status` (VARCHAR, 'available', 'booked', default: 'available')
-   `client_id` (VARCHAR/UUID, nullable, stores ID of client who booked)
-   `created_at` (TIMESTAMPTZ, default: NOW())
-   `updated_at` (TIMESTAMPTZ, default: NOW())

A unique constraint exists on `(professional_id, start_time)`.

## Installation

1.  Navigate to the `calendar-svc` directory.
2.  Install dependencies:

    ```bash
    npm install
    ```

## Running the Service

1.  Ensure your PostgreSQL database is running and accessible with the configured credentials.
2.  Start the service:

    ```bash
    node index.js
    ```

    The service will:
    *   Attempt to connect to PostgreSQL and create the `availability_slots` table if it doesn't exist.
    *   Schedule a cron job to generate daily availability slots.
    *   Start the Express server, making API endpoints available.
    By default, the service will be available at `http://localhost:3002`.

## Service Architecture

1.  **Slot Generation (Cron Job):**
    *   A cron job (`cron-jobs.js`, scheduled by `index.js`) runs daily (default: midnight UTC).
    *   For a predefined list of professionals and settings (daily start/end times, slot duration), it calls `db.generateSlotsForProfessional`.
    *   This function creates `availability_slots` records in the database for a configurable number of upcoming days (e.g., next 7 days), avoiding duplicates.

2.  **Viewing Availability:**
    *   Clients use `GET /api/calendar/:professional_id/availability?start_date=...&end_date=...`.
    *   The service queries `db.getProfessionalAvailability` to fetch slots with `status = 'available'` within the given range.

3.  **Booking a Slot:**
    *   Clients use `POST /api/calendar/slots/:slot_id/book` with `{ "client_id": "..." }`.
    *   The service calls `db.bookSlot(slot_id, client_id)`, which updates the slot's `status` to 'booked' and sets the `client_id`.
    *   (Conceptual) After successful booking, a placeholder function in `google-calendar-integration.js` is called, indicating where Google Calendar API interaction would occur.

4.  **iCalendar Export:**
    *   Users can download an .ics file via `GET /api/calendar/:professional_id/export.ics?start_date=...&end_date=...`.
    *   The service fetches booked appointments using `db.getAppointmentsForExport`.
    *   `ical-service.js` uses `ical-generator` to create the iCalendar data string.
    *   Appropriate `Content-Type` and `Content-Disposition` headers are set for the download.

## API Endpoints

All endpoints are prefixed with `/api/calendar`.

-   `GET /:professional_id/availability?start_date=<date>&end_date=<date>`:
    Retrieves available time slots for a specified professional within a given date range.
-   `POST /slots/:slot_id/book`:
    Books a specific time slot. Requires `client_id` in the request body.
-   `GET /:professional_id/export.ics?start_date=<date>&end_date=<date>`:
    Exports booked appointments for a professional in iCalendar (.ics) format for the specified date range.

## Google Calendar Integration (Conceptual)

The file `google-calendar-integration.js` contains a placeholder function `createGoogleCalendarEvent`. This outlines where a call to the Google Calendar API would be made after a slot is successfully booked. Actual implementation would require handling OAuth 2.0 for authorization and using the Google Calendar API client library.

---

This README provides an overview of the calendar service. For production, consider robust configuration, error handling, security measures, and professional-specific availability settings (rather than hardcoded daily schedules).

# Quote Service (`quote-svc`)

The Quote Service is a microservice responsible for managing quote requests and proposals between clients and professionals.

## Features

-   Allows clients to request quotes for services.
-   Allows professionals to propose quotes for requested services.
-   Supports accepting or refusing quotes.
-   Handles quote expiration.
-   (Conceptual) Supports attaching files to quotes via S3.

## Prerequisites

-   Node.js (v14.x or later recommended)
-   npm (comes with Node.js)
-   A running PostgreSQL instance.

## Environment Variables (Placeholder)

Before running the service, you would typically set up the following environment variables. For development, defaults are provided in `db.js`.

-   `PORT`: Port for the service to run on (default: 3000)
-   `DB_HOST`: PostgreSQL host (default: `localhost`)
-   `DB_USER`: PostgreSQL user (default: `user`)
-   `DB_PASSWORD`: PostgreSQL password (default: `password`)
-   `DB_NAME`: PostgreSQL database name (default: `quotes_db`)
-   `DB_PORT`: PostgreSQL port (default: `5432`)
-   `KAFKA_BROKERS`: Comma-separated list of Kafka broker addresses (e.g., `localhost:9092`). This should be consistent with other services like chat-svc.
-   `KAFKA_CLIENT_ID_QUOTE_SVC`: Kafka client ID for this service (default: `quote-svc-producer`).
-   `KAFKA_TOPIC_QUOTE_EVENTS`: Kafka topic for publishing quote events like 'QUOTE_ACCEPTED' (default: `quote.events`).
-   `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID (for S3)
-   `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key (for S3)
-   `AWS_REGION`: The AWS region for your S3 bucket (e.g., `us-east-1`)
-   `S3_BUCKET_NAME`: The name of the S3 bucket for attachments.

## Installation

1.  Clone the repository (if applicable) or navigate to the `quote-svc` directory.
2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Copy `.env.example` to `.env` and adjust the database or Kafka settings if needed.

## Running the Service

1.  Ensure your PostgreSQL database and Kafka cluster are running and accessible with the configured credentials/addresses.
2.  Start the service:

    ```bash
    node index.js
    ```

    The service will attempt to:
    *   Connect to the database and create necessary tables.
    *   Connect to Kafka as a producer.
    *   Start the Express server.
    By default, the service will be available at `http://localhost:3000`.

## API Endpoints

-   `POST /quotes/request`: Create a new quote request.
    -   Body: `{ "clientId": "string", "professionalId": "string", "serviceDescription": "string" }`
-   `POST /quotes/:quote_request_id/propose`: Propose a quote for a request.
    -   Body: `{ "professionalId": "string", "offerDescription": "string", "estimatedPrice": number, "validUntilDays": number }`
-   `POST /quotes/:quote_id/accept`: Accept a specific quote.
    -   On successful acceptance, this endpoint also publishes a `QUOTE_ACCEPTED` event to the Kafka topic defined by `KAFKA_TOPIC_QUOTE_EVENTS`. This event is intended for consumption by other services (e.g., `chat-svc` for notifications).
-   `POST /quotes/:quote_id/refuse`: Refuse a specific quote.

## Kafka Integration

-   **Producer**: This service acts as a Kafka producer for quote-related events.
    -   When a quote is accepted, it publishes an event to the `KAFKA_TOPIC_QUOTE_EVENTS` topic.
    -   The event payload includes `eventType: 'QUOTE_ACCEPTED'`, `quoteId`, `clientId`, `professionalId`, and a notification `message`.

## Cron Jobs

-   **Expire Quotes**: Runs daily at midnight to update the status of quotes that have passed their `valid_until` date to `EXPIRED`.

## S3 Integration (Conceptual)

The service includes a placeholder (`s3-handler.js`) for integrating with AWS S3 to store attachments related to quotes. The actual S3 upload functionality is not implemented but can be added by configuring AWS credentials and completing the `uploadAttachment` function.

---

This README provides a basic overview. For a production environment, consider using a process manager (like PM2), more robust logging, and comprehensive error handling.

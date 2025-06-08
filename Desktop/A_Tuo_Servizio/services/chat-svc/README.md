# Chat Service (`chat-svc`)

The Chat Service is a microservice for handling real-time chat communication between users, including text messages and attachments. It uses WebSockets for real-time updates, Kafka for message queuing and persistence, and MongoDB for storing chat history.

## Features

-   Real-time chat messaging via WebSockets (Socket.io).
-   Message persistence using Kafka and MongoDB.
-   Support for text messages and file attachments (via HTTP upload).
-   Typing indicators.
-   User presence (basic room joining).
-   Reporting messages as spam.
-   HTTP polling fallback for fetching messages.

## Core Technologies

-   **Node.js**: Runtime environment.
-   **Express.js**: HTTP server framework (also for Socket.io and REST endpoints).
-   **Socket.io**: Real-time WebSocket communication.
-   **KafkaJS**: Kafka client for message queuing.
-   **Mongoose**: MongoDB object modeling for message storage.
-   **Multer**: Middleware for handling `multipart/form-data` (file uploads).

## Prerequisites

-   Node.js (v14.x or later recommended)
-   npm (comes with Node.js)
-   A running Kafka cluster.
-   A running MongoDB instance/cluster.
-   (Optional) An S3 bucket or other persistent file storage for attachments in a production environment.

## Environment Variables (Placeholder)

Configure these environment variables before running the service. For development, defaults are provided in the respective files (`mongo.js`, `kafka-handler.js`).

-   `PORT`: Port for the service to run on (default: 3001).
-   `MONGO_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/chat_db`).
-   `KAFKA_BROKERS`: Comma-separated list of Kafka broker addresses (e.g., `localhost:9092`). Should be consistent with other Kafka-integrated services.
-   `KAFKA_CLIENT_ID_CHAT_SVC`: Kafka client ID for this service (default: `chat-svc`).
-   `KAFKA_TOPIC_CHAT_MESSAGES`: Kafka topic for regular chat messages (default: `chat.messages`).
-   `KAFKA_TOPIC_QUOTE_EVENTS`: Kafka topic for consuming quote-related events, like 'QUOTE_ACCEPTED' from `quote-svc` (default: `quote.events`).
-   `UPLOAD_PATH`: Path to store uploaded files locally (default: `chat-svc/uploads/`). Note: for production, use a cloud storage solution.

## Installation

1.  Navigate to the `chat-svc` directory.
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Copy `.env.example` to `.env` and adjust values like `MONGO_URI` or `KAFKA_BROKERS` if needed.
4.  Ensure the `uploads` directory exists within `chat-svc` if not created automatically by the service start-up.

## Running the Service

1.  Ensure your Kafka and MongoDB instances are running and accessible with the configured details.
2.  Start the service:

    ```bash
    node index.js
    ```

    The service will connect to MongoDB, Kafka (producer and consumer), and start the HTTP/WebSocket server.
    By default, the HTTP service will be available at `http://localhost:3001`.

## Service Architecture

1.  **Client Connection (Socket.io):**
    *   Clients connect via WebSockets.
    *   Users `joinRoom` with their `userId` to receive direct messages and typing indicators.

2.  **Sending Messages:**
    *   **Text & Attachments via WebSocket:** When a client sends a `chatMessage` via WebSocket, the `socket-handler` generates a `conversation_id` (if needed) and sends the message payload to the `chat.messages` Kafka topic. It also emits the message directly to the recipient if they are connected for immediate real-time feel.
    *   **Attachments via HTTP:** Clients can upload files to `POST /api/chat/upload/:conversation_id`. This endpoint uses `multer` to save the file (locally for now), then constructs a message payload with attachment details and sends it to the `chat.messages` Kafka topic.

3.  **Message Processing (Kafka -> MongoDB):**
    *   A Kafka consumer (`kafka-handler.js`) listens to the `chat.messages` topic.
    *   **Chat Messages (`chat.messages` topic):** The `saveConsumedChatMessageToDB` function parses regular chat messages and saves them to MongoDB.
    *   **Quote Events (`quote.events` topic):** The `handleQuoteAcceptedEvent` function processes events like `QUOTE_ACCEPTED`. It:
        *   Constructs a system notification message.
        *   Saves this system message to MongoDB in the relevant conversation.
        *   Emits a `newMessage` Socket.io event to both the client and professional involved, so they receive the notification in their chat interface.

4.  **Receiving Messages & Notifications:**
    *   Connected clients receive new chat messages and system notifications (like quote acceptance) in real-time via the `newMessage` Socket.io event.

5.  **Other Features:**
    *   **Typing Indicators:** `typing` and `stopTyping` events are relayed via Socket.io for chat.
    *   **Spam Reporting:** `POST /api/chat/messages/:message_id/reportSpam` updates the `is_spam` flag for a message in MongoDB.
    *   **HTTP Polling:** `GET /api/chat/messages/:conversation_id` allows clients to fetch message history, useful as a fallback or for initial message load.

## API Endpoints (HTTP)

All chat-related HTTP endpoints are prefixed with `/api/chat`.

-   `POST /upload/:conversation_id`: Upload an attachment.
    -   Requires `sender_id` and `receiver_id` in the form data.
    -   File should be sent as `attachment` field.
-   `POST /messages/:message_id/reportSpam`: Mark a message as spam.
-   `GET /messages/:conversation_id`: Fetch messages for a conversation (polling).
    -   Query params: `last_message_id` (optional), `limit` (optional, default 50).
-   `/uploads/:filename`: (For local development) Serves uploaded files statically.

## Socket.io Events

-   **Client Emits:**
    -   `joinRoom (userId)`: Client joins a room identified by their user ID.
    -   `chatMessage (data)`: Client sends a chat message.
        -   `data`: `{ sender_id, receiver_id, text_content, [conversation_id], [attachment_url], [attachment_filename], [attachment_mimetype] }`
    -   `typing (data)`: Client indicates they are typing.
        -   `data`: `{ sender_id, receiver_id, conversation_id }`
    -   `stopTyping (data)`: Client indicates they have stopped typing.
        -   `data`: `{ sender_id, receiver_id, conversation_id }`
-   **Server Emits:**
    -   `newMessage (message)`: Server sends a new chat message to the recipient.
    -   `messageSent (message)`: Server confirms to sender that message was processed (sent to Kafka).
    -   `typing (data)`: Server relays typing indicator to the recipient.
    -   `stopTyping (data)`: Server relays stop typing indicator to the recipient.
    -   `messageError (error)`: Server indicates an error processing a message.

---

This README provides an overview of the chat service. For production, ensure robust configuration management, security hardening (CORS, input validation), comprehensive logging, monitoring, and scaling strategies for Kafka, MongoDB, and the Node.js instances.

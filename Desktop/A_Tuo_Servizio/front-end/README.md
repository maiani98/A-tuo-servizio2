# Client Autoservizio Frontend

This project is the frontend application for `client-autoservizio`.
(Further description of the project would go here).

## Development

### Prerequisites
- Node.js (version specified in project or latest LTS)
- npm or yarn

### Setup
1. Clone the repository.
2. Navigate to the `client-autoservizio` directory: `cd client-autoservizio`
3. Install dependencies: `npm install` (or `yarn install`)

### Running the Development Server
```bash
npm run dev
```
This will typically start the application on `http://localhost:3000`.

## Testing

### Unit & Integration Tests (Vitest)
This project uses Vitest for unit and component testing.
- Run all tests: `npm test`
- Run tests in UI mode: `npm run test:ui`

### End-to-End Tests (Cypress)

Cypress is used for End-to-End (E2E) testing.

**Setup:**
Cypress is included as a dev dependency. If you are setting it up for the first time or in a new environment:
1. Ensure all dependencies are installed: `npm install`
2. The Cypress configuration file is `cypress.config.js`.
3. Test files are located in `cypress/e2e/`.

**Running E2E Tests:**

-   **Open Cypress Interactive Runner:**
    ```bash
    npm run cypress:open
    ```
    This command opens the Cypress Test Runner, allowing you to see tests run in a browser and use Cypress's debugging tools.

-   **Run Cypress Tests Headlessly (in terminal):**
    ```bash
    npm run cypress:run
    ```
    This command runs all E2E tests headlessly. It's suitable for CI environments.

**Important Notes for E2E Tests:**

*   **Placeholder Tests:** The current E2E tests (e.g., `cypress/e2e/quote_flow_spec.cy.js`) are **placeholders**. They outline the expected user flows but rely on specific UI elements (identified by `data-cy` attributes or other selectors) that need to be implemented in the frontend application.
*   **Backend Dependency:** For these E2E tests to execute meaningfully and pass, the corresponding backend microservices (`quote-svc`, `chat-svc`, etc.) must be running and fully integrated with the frontend. This includes Kafka message queues for features like real-time chat notifications.
*   **Base URL:** Cypress tests are configured with a `baseUrl` in `cypress.config.js` (e.g., `http://localhost:3000`). Ensure the frontend development server is running on this URL when executing tests.
*   **Data Seeding/State:** True E2E tests might require specific data to be present in the backend (e.g., a professional user, specific services). Consider strategies for data seeding or using dedicated test accounts if necessary.

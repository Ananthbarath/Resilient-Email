Resilient Email Service

This project is a resilient email sending service implemented in TypeScript. The service is designed to handle failures gracefully with features like retry logic, fallback mechanisms, idempotency, rate limiting, status tracking, and a basic in-memory queue system. Additionally, it implements a circuit breaker pattern and logging for better reliability and observability.

Features:

Retry Mechanism: Retries sending emails with exponential backoff on failure.
Fallback Mechanism: Switches between two mock email providers in case of failures.
Idempotency: Ensures that the same email is not sent more than once.
Rate Limiting: Limits the number of emails sent per minute.
Status Tracking: Tracks the status of each email sending attempt.
Circuit Breaker: Temporarily disables a provider after repeated failures.
Logging: Provides simple logging for tracking the flow and outcomes.
Queue System: Queues emails that cannot be sent immediately.

Project Structure:

resilient-email-service/
│
├── src/
│   ├── EmailService.ts         # Main email service logic
│   ├── providers/
│   │   ├── MockProviderA.ts     # Mock email provider A
│   │   └── MockProviderB.ts     # Mock email provider B
│   └── index.ts                # Entry point for running the service
├── node_modules/               # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
└── package.json                # Node.js project configuration


How It Works:

-The service attempts to send an email using ProviderA. If ProviderA fails, it retries up to 3 times with exponential backoff.
-If ProviderA continues to fail, the service switches to ProviderB and attempts to send the email with similar retry logic.
-If a provider fails repeatedly (3 times), it is temporarily disabled for 1 minute, thanks to the circuit breaker.
-The service enforces a rate limit of 5 emails per minute. If the limit is exceeded, emails are added to an in-memory queue and processed later.
-Each email has a unique id to ensure idempotency, preventing duplicate sends.

Output:
Starting Email Service...
Sending email with ProviderA to test@example.com
ProviderA succeeded.
[LOG] Email with id 1 sent successfully.
Email processing completed.

Unit Tests
The project includes unit tests to ensure that the email service behaves as expected. To run the tests:
npm test
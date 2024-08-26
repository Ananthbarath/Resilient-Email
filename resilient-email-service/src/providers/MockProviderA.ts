// src/providers/MockProviderA.ts
import { Email } from '../EmailService';

export class MockProviderA {
    async sendEmail(email: Email): Promise<void> {
        console.log(`Sending email with ProviderA to ${email.to}`);
        // Simulate success or failure
        if (Math.random() > 0.7) {
            console.log('ProviderA failed.');
            throw new Error('ProviderA failed to send the email.');
        }
        console.log('ProviderA succeeded.');
    }
}

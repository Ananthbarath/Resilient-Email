// src/providers/MockProviderB.ts
import { Email } from '../EmailService';

export class MockProviderB {
    async sendEmail(email: Email): Promise<void> {
        console.log(`Sending email with ProviderB to ${email.to}`);
        // Simulate success or failure
        if (Math.random() > 0.7) {
            console.log('ProviderB failed.');
            throw new Error('ProviderB failed to send the email.');
        }
        console.log('ProviderB succeeded.');
    }
}

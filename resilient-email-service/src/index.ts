// src/index.ts
import { EmailService } from './EmailService';

async function main() {
    console.log('Starting Email Service...');
    
    const emailService = new EmailService();

    const email = {
        id: '1',
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email.'
    };

    await emailService.sendEmail(email);

    console.log('Email processing completed.');
}

main();

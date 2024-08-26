
import { EmailService } from '../src/EmailService';

test('should send email successfully', async () => {
    const emailService = new EmailService();
    const email = {
        id: '1',
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email.'
    };

    await emailService.sendEmail(email);
});

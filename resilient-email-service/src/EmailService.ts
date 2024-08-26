import { MockProviderA } from './providers/MockProviderA';
import { MockProviderB } from './providers/MockProviderB';

export type Email = {
    id: string;
    to: string;
    subject: string;
    body: string;
};

export class EmailService {
    private providerA = new MockProviderA();
    private providerB = new MockProviderB();
    private retryAttempts = 3;
    private rateLimit = 5; // 5 emails per minute
    private sentEmails = new Set<string>(); // For idempotency
    private emailQueue: Email[] = []; // Basic queue system
    private currentRate = 0;
    private failureCountA = 0;
    private failureCountB = 0;
    private circuitBreakerThreshold = 3;
    private circuitBreakerTimeout = 60000; // 1 minute
    private isProviderADisabled = false;
    private isProviderBDisabled = false;

    async sendEmail(email: Email) {
        if (this.sentEmails.has(email.id)) {
            console.log(`[LOG] Email with id ${email.id} has already been sent.`);
            return;
        }

        if (this.currentRate >= this.rateLimit) {
            console.log('[LOG] Rate limit exceeded. Email will be queued.');
            this.enqueueEmail(email);
            return;
        }

        this.currentRate++;
        setTimeout(() => this.currentRate--, 60000); // Decrease rate count after 1 minute

        let success = false;

        if (!this.isProviderADisabled) {
            success = await this.tryProvider(email, this.providerA, 'ProviderA');
        }

        if (!success && !this.isProviderBDisabled) {
            console.log('[LOG] Switching to ProviderB...');
            success = await this.tryProvider(email, this.providerB, 'ProviderB');
        }

        if (success) {
            this.sentEmails.add(email.id);
            console.log(`[LOG] Email with id ${email.id} sent successfully.`);
        } else {
            console.log(`[LOG] Failed to send email with id ${email.id} after multiple attempts.`);
        }

        this.processQueue(); // Process any queued emails
    }

    private async tryProvider(email: Email, provider: any, providerName: string): Promise<boolean> {
        for (let i = 0; i < this.retryAttempts; i++) {
            try {
                await provider.sendEmail(email);
                this.resetFailureCount(providerName);
                return true;
            } catch (err) {
                console.log(`[LOG] Attempt ${i + 1} with ${providerName} failed: ${err}`);
                this.incrementFailureCount(providerName);
                await this.sleep(this.getExponentialBackoffTime(i));
            }
        }

        if (this.getFailureCount(providerName) >= this.circuitBreakerThreshold) {
            this.triggerCircuitBreaker(providerName);
        }

        return false;
    }

    private getExponentialBackoffTime(attempt: number) {
        return Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s, etc.
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private enqueueEmail(email: Email) {
        this.emailQueue.push(email);
        console.log(`[LOG] Email with id ${email.id} added to the queue.`);
    }

    private async processQueue() {
        while (this.emailQueue.length > 0) {
            const email = this.emailQueue.shift();
            if (email) {
                await this.sendEmail(email);
            }
        }
    }

    private incrementFailureCount(providerName: string) {
        if (providerName === 'ProviderA') {
            this.failureCountA++;
        } else {
            this.failureCountB++;
        }
    }

    private resetFailureCount(providerName: string) {
        if (providerName === 'ProviderA') {
            this.failureCountA = 0;
        } else {
            this.failureCountB = 0;
        }
    }

    private getFailureCount(providerName: string): number {
        return providerName === 'ProviderA' ? this.failureCountA : this.failureCountB;
    }

    private triggerCircuitBreaker(providerName: string) {
        if (providerName === 'ProviderA') {
            this.isProviderADisabled = true;
        } else {
            this.isProviderBDisabled = true;
        }
        console.log(`[LOG] ${providerName} is temporarily disabled due to repeated failures.`);

        setTimeout(() => {
            if (providerName === 'ProviderA') {
                this.isProviderADisabled = false;
                console.log('[LOG] ProviderA is re-enabled.');
            } else {
                this.isProviderBDisabled = false;
                console.log('[LOG] ProviderB is re-enabled.');
            }
        }, this.circuitBreakerTimeout);
    }
}

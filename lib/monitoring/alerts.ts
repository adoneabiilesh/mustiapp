/**
 * Error Monitoring & Alerting System
 * Sends alerts for critical errors and system issues
 */

import * as Sentry from '@sentry/react-native';

export interface AlertConfig {
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: Record<string, any>;
  notify?: boolean; // Send to Slack/email
}

class AlertManager {
  private static instance: AlertManager;
  private alertThresholds = {
    paymentError: 3, // Alert after 3 payment errors
    apiError: 10, // Alert after 10 API errors in 5 minutes
    crash: 1, // Alert on any crash
  };

  private errorCounts: Map<string, number> = new Map();

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Send alert for critical error
   */
  async sendAlert(config: AlertConfig): Promise<void> {
    // Log to Sentry
    if (config.level === 'error') {
      Sentry.captureException(new Error(config.message), {
        tags: { alert: true },
        extra: config.context,
      });
    } else {
      Sentry.captureMessage(config.message, {
        level: config.level === 'warning' ? 'warning' : 'info',
        extra: config.context,
      });
    }

    // Check if we should send notification
    if (config.notify || config.level === 'error') {
      await this.sendNotification(config);
    }

    // Track error count
    this.trackError(config.message);
  }

  /**
   * Send notification (Slack/Email)
   */
  private async sendNotification(config: AlertConfig): Promise<void> {
    // Check thresholds
    const count = this.errorCounts.get(config.message) || 0;
    
    if (config.level === 'error' && count >= this.alertThresholds.apiError) {
      // Rate limit alerts to avoid spam
      return;
    }

    // In production, integrate with:
    // - Slack webhook
    // - Email service (SendGrid, AWS SES)
    // - PagerDuty (for critical alerts)
    
    console.error(`🚨 ALERT: ${config.level.toUpperCase()} - ${config.message}`, config.context);
    
    // Example: Send to webhook (implement actual integration)
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: config.level,
            message: config.message,
            context: config.context,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to send alert notification:', error);
      }
    }
  }

  /**
   * Track error count for rate limiting
   */
  private trackError(message: string): void {
    const count = this.errorCounts.get(message) || 0;
    this.errorCounts.set(message, count + 1);

    // Reset count after 5 minutes
    setTimeout(() => {
      this.errorCounts.delete(message);
    }, 5 * 60 * 1000);
  }

  /**
   * Alert on payment failures
   */
  async alertPaymentFailure(orderId: string, error: Error): Promise<void> {
    await this.sendAlert({
      level: 'error',
      message: `Payment failed for order ${orderId}`,
      context: {
        orderId,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      notify: true, // Always notify on payment failures
    });
  }

  /**
   * Alert on high error rate
   */
  async alertHighErrorRate(errorRate: number, threshold: number = 5): Promise<void> {
    if (errorRate > threshold) {
      await this.sendAlert({
        level: 'error',
        message: `High error rate detected: ${errorRate}%`,
        context: {
          errorRate,
          threshold,
          timestamp: new Date().toISOString(),
        },
        notify: true,
      });
    }
  }

  /**
   * Alert on API downtime
   */
  async alertAPIDowntime(endpoint: string, duration: number): Promise<void> {
    await this.sendAlert({
      level: 'error',
      message: `API endpoint ${endpoint} is down`,
      context: {
        endpoint,
        duration,
        timestamp: new Date().toISOString(),
      },
      notify: true,
    });
  }

  /**
   * Alert on security events
   */
  async alertSecurityEvent(event: string, details: Record<string, any>): Promise<void> {
    await this.sendAlert({
      level: 'error',
      message: `Security event: ${event}`,
      context: {
        event,
        ...details,
        timestamp: new Date().toISOString(),
      },
      notify: true,
    });
  }
}

export const alertManager = AlertManager.getInstance();

// Export convenience functions
export const alertPaymentFailure = (orderId: string, error: Error) =>
  alertManager.alertPaymentFailure(orderId, error);

export const alertHighErrorRate = (errorRate: number, threshold?: number) =>
  alertManager.alertHighErrorRate(errorRate, threshold);

export const alertAPIDowntime = (endpoint: string, duration: number) =>
  alertManager.alertAPIDowntime(endpoint, duration);

export const alertSecurityEvent = (event: string, details: Record<string, any>) =>
  alertManager.alertSecurityEvent(event, details);





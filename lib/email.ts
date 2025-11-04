// Email notification system
// This uses Resend as the email provider
// You can also use SendGrid, AWS SES, or other providers

import { Order, User } from './supabase';

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@mustiapp.com';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via Resend API
 */
async function sendEmail(template: EmailTemplate): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: template.to,
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    console.log('✅ Email sent successfully to:', template.to);
    return true;
  } catch (error: any) {
    console.error('❌ Email send failed:', error);
    return false;
  }
}

/**
 * Order confirmation email
 */
export async function sendOrderConfirmation(order: Order, user: User): Promise<boolean> {
  const itemsHtml = order.order_items?.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.menu_items?.name || 'Item'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        €${item.unit_price.toFixed(2)}
      </td>
    </tr>
  `).join('') || '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name}!</h2>
          <p>Thank you for your order. We're preparing it with care!</p>
          
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${order.id.slice(-6)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Item</th>
                <th style="text-align: center; padding: 10px; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; font-weight: bold;">Total</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">€${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <h3>Delivery Address</h3>
          <p>
            ${order.delivery_address?.street}<br/>
            ${order.delivery_address?.city}, ${order.delivery_address?.state} ${order.delivery_address?.zip}
          </p>
          
          <p style="margin-top: 20px;">
            <a href="https://mustiapp.com/orders" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Track Order
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 MustiApp. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order.id.slice(-6)}`,
    html,
  });
}

/**
 * Order status update email
 */
export async function sendOrderStatusUpdate(
  order: Order,
  user: User,
  newStatus: string
): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed!',
    paid: 'Payment received successfully!',
    preparing: 'Our kitchen is preparing your order!',
    out_for_delivery: 'Your order is on the way!',
    delivered: 'Your order has been delivered. Enjoy!',
    cancelled: 'Your order has been cancelled.',
  };

  const message = statusMessages[newStatus] || 'Your order status has been updated.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-badge { display: inline-block; padding: 8px 16px; background: #10B981; color: white; border-radius: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name}!</h2>
          <p>${message}</p>
          
          <p><strong>Order ID:</strong> #${order.id.slice(-6)}</p>
          <p><strong>Status:</strong> <span class="status-badge">${newStatus}</span></p>
          
          <p style="margin-top: 20px;">
            <a href="https://mustiapp.com/orders" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Track Order
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Order Update: ${newStatus}`,
    html,
  });
}

/**
 * Refund notification email
 */
export async function sendRefundNotification(
  order: Order,
  user: User,
  refundAmount: number
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processed</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name}!</h2>
          <p>Your refund has been processed successfully.</p>
          
          <p><strong>Order ID:</strong> #${order.id.slice(-6)}</p>
          <p><strong>Refund Amount:</strong> €${refundAmount.toFixed(2)}</p>
          
          <p>The refund will appear in your account within 5-10 business days.</p>
          
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Refund Processed',
    html,
  });
}

/**
 * Welcome email for new users
 */
export async function sendWelcomeEmail(user: User): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to MustiApp!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name}!</h2>
          <p>Welcome to MustiApp! We're excited to have you on board.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Browse our delicious menu</li>
            <li>Place orders for delivery</li>
            <li>Track your orders in real-time</li>
            <li>Save your favorite items</li>
          </ul>
          
          <p style="margin-top: 20px;">
            <a href="https://mustiapp.com" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Start Ordering
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Welcome to MustiApp!',
    html,
  });
}

// Export helper to configure email service
export const emailConfig = {
  configured: !!RESEND_API_KEY,
  provider: 'Resend',
};



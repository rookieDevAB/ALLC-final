/* global process */
import { Resend } from 'resend';
import { logger } from './logger.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ALLC Clinic <noreply@asianllc.com>';

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  logger.info('Resend email provider configured');
} else {
  logger.warn('RESEND_API_KEY not set — emails will be logged to console only');
}

/**
 * Send a transactional email.
 * Falls back to console logging when Resend is not configured.
 *
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<{ success: boolean, id?: string }>}
 */
export async function sendEmail({ to, subject, html }) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error('Resend email failed', { to, subject, error });
        return { success: false };
      }

      logger.info('Email sent via Resend', { to, subject, id: data?.id });
      return { success: true, id: data?.id };
    } catch (err) {
      logger.error('Resend send exception', { to, subject, error: err.message });
      return { success: false };
    }
  }

  // Fallback: log to console for local development
  logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`);
  logger.info(`[Email Mock] Body:\n${html}`);
  return { success: true, id: 'mock' };
}

/**
 * Build and send the password reset email.
 *
 * @param {{ email: string, resetToken: string, baseUrl: string }} options
 */
export async function sendPasswordResetEmail({ email, resetToken, baseUrl }) {
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fffe; border: 1px solid #e0f0ee; border-radius: 12px;">
      <h2 style="color: #062926; margin: 0 0 16px;">Password Reset Request</h2>
      <p style="color: #527B78; font-size: 14px; line-height: 1.6;">
        You requested a password reset for your ALLC admin account. Click the button below to set a new password.
        This link expires in <strong>15 minutes</strong>.
      </p>
      <a href="${resetLink}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #2AB5A5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Reset Password
      </a>
      <p style="color: #527B78; font-size: 12px; line-height: 1.5;">
        If you didn't request this, please ignore this email. Your password won't change.
      </p>
      <hr style="border: none; border-top: 1px solid #e0f0ee; margin: 24px 0;" />
      <p style="color: #9cb8b5; font-size: 11px;">ALLC — Asian Lifestyle Longevity Clinic</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your ALLC admin password',
    html,
  });
}

/**
 * Send booking confirmation to patient + internal clinic notification.
 * @param {object} order — ServiceOrder with items.service and items.pathway included
 */
export async function sendBookingConfirmation(order) {
  const CLINIC_EMAIL = process.env.CLINIC_NOTIFY_EMAIL || 'contact@asianllc.com';

  const formatPrice = (rs) => `₹${Number(rs).toLocaleString('en-IN')}`;

  const itemRows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0f0ee; color: #062926; font-size: 14px;">
            ${i.service.title}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0f0ee; color: #4A7C78; font-size: 14px;">
            ${i.pathway.name} · ${i.pathway.duration}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e0f0ee; color: #062926; font-size: 14px; text-align: right; font-weight: 600;">
            ${formatPrice(i.priceRs)}
          </td>
        </tr>`,
    )
    .join('');

  const patientHtml = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fffe; border: 1px solid #e0f0ee; border-radius: 12px; overflow: hidden;">
      <div style="background: #062926; padding: 28px 32px;">
        <p style="color: #2AB5A5; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px;">ALLC Clinic</p>
        <h1 style="color: #fff; font-size: 22px; margin: 0;">Booking Confirmed ✅</h1>
      </div>
      <div style="padding: 28px 32px;">
        <p style="color: #4A7C78; font-size: 14px; margin: 0 0 20px;">
          Hi <strong style="color: #062926;">${order.patientName}</strong>, your booking is confirmed.
          Our team will contact you within <strong>24 hours</strong> to schedule your first session.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #DCF4F1;">
              <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #4A7C78; text-transform: uppercase; letter-spacing: 1px;">Program</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #4A7C78; text-transform: uppercase; letter-spacing: 1px;">Pathway</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #4A7C78; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: 700; color: #062926; font-size: 15px;">Total Paid</td>
              <td style="padding: 12px; font-weight: 700; color: #2AB5A5; font-size: 15px; text-align: right;">${formatPrice(order.totalAmountRs)}</td>
            </tr>
          </tfoot>
        </table>

        <p style="color: #4A7C78; font-size: 13px; margin: 0 0 4px;">Booking ID: <strong style="color: #062926;">${order.txnid}</strong></p>
        <p style="color: #4A7C78; font-size: 13px; margin: 0;">Supervised by Dr. Divya Gautam &amp; the ALLC team.</p>
      </div>
      <div style="background: #DCF4F1; padding: 16px 32px;">
        <p style="color: #4A7C78; font-size: 11px; margin: 0;">ALLC — Asian Lifestyle Longevity Clinic · contact@asianllc.com</p>
      </div>
    </div>
  `;

  const clinicHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #062926; margin: 0 0 12px;">New Booking — ${order.txnid}</h2>
      <p><strong>Patient:</strong> ${order.patientName}</p>
      <p><strong>Email:</strong> ${order.patientEmail}</p>
      <p><strong>Phone:</strong> ${order.patientPhone}</p>
      <p><strong>Total:</strong> ${formatPrice(order.totalAmountRs)}</p>
      <p><strong>Programs:</strong></p>
      <ul>${order.items.map((i) => `<li>${i.service.title} — ${i.pathway.name}</li>`).join('')}</ul>
    </div>
  `;

  await Promise.allSettled([
    sendEmail({ to: order.patientEmail, subject: `Booking Confirmed — ALLC Clinic [${order.txnid}]`, html: patientHtml }),
    sendEmail({ to: CLINIC_EMAIL,        subject: `New Booking: ${order.patientName} — ${formatPrice(order.totalAmountRs)}`, html: clinicHtml }),
  ]);
}


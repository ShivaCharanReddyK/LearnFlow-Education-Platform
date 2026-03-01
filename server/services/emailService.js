const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }

    async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"LearnFlow Education" <${process.env.GMAIL_USER}>`,
                to,
                subject,
                html
            });
            console.log(`Email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`Email error: ${error.message}`);
            // Don't throw - email failure shouldn't break the flow
            return { success: false, error: error.message };
        }
    }

    async sendApplicationConfirmation(email, name, programTitle, applicationRef) {
        const subject = `Application Received - ${programTitle} | LearnFlow`;
        const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 LearnFlow</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Application Confirmation</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #a78bfa; margin-top: 0;">Hi ${name}!</h2>
          <p>Your application for <strong style="color: #c4b5fd;">${programTitle}</strong> has been successfully submitted.</p>
          <div style="background: #1a1a3e; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #94a3b8;">Application Reference Number</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #a78bfa; letter-spacing: 2px;">${applicationRef}</p>
          </div>
          <p style="color: #94a3b8;">Please keep this reference number for your records. You can track your application status on your dashboard.</p>
          <p style="color: #94a3b8;">Our team will review your application and get back to you shortly.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Application</a>
          </div>
        </div>
        <div style="background: #0a0a1a; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 LearnFlow. All rights reserved.</p>
        </div>
      </div>
    `;
        return this.sendEmail(email, subject, html);
    }

    async sendApprovalEmail(email, name, programTitle, applicationRef) {
        const subject = `🎉 Application Approved - ${programTitle} | LearnFlow`;
        const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 LearnFlow</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Congratulations!</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #34d399; margin-top: 0;">Hi ${name}!</h2>
          <p>Great news! Your application for <strong style="color: #6ee7b7;">${programTitle}</strong> has been <strong style="color: #34d399;">APPROVED</strong>! 🎉</p>
          <div style="background: #1a1a3e; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #94a3b8;">Reference: <strong style="color: #34d399;">${applicationRef}</strong></p>
          </div>
          <p style="color: #94a3b8;">Your next step is to complete the tuition payment. Please visit your dashboard to proceed with payment.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Complete Payment</a>
          </div>
        </div>
        <div style="background: #0a0a1a; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 LearnFlow. All rights reserved.</p>
        </div>
      </div>
    `;
        return this.sendEmail(email, subject, html);
    }

    async sendDenialEmail(email, name, programTitle, applicationRef, reason, recommendations = []) {
        const recHtml = recommendations.length > 0
            ? `<div style="margin-top: 20px;">
          <h3 style="color: #c4b5fd;">Recommended Programs For You</h3>
          ${recommendations.map(r => `
            <div style="background: #1a1a3e; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-weight: bold; color: #a78bfa;">${r.title}</p>
              <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">${r.shortDescription}</p>
            </div>
          `).join('')}
        </div>`
            : '';

        const subject = `Application Update - ${programTitle} | LearnFlow`;
        const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 LearnFlow</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Application Update</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #fbbf24; margin-top: 0;">Hi ${name},</h2>
          <p>We have reviewed your application for <strong style="color: #fcd34d;">${programTitle}</strong> (Ref: ${applicationRef}).</p>
          <p>After careful consideration, we regret to inform you that your application has not been approved at this time.</p>
          <div style="background: #1a1a3e; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #94a3b8;">Reason</p>
            <p style="margin: 5px 0 0; color: #fbbf24;">${reason}</p>
          </div>
          ${recHtml}
          <p style="color: #94a3b8; margin-top: 20px;">We encourage you to explore other programs that may be a better fit. Please don't hesitate to reach out if you have any questions.</p>
        </div>
        <div style="background: #0a0a1a; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 LearnFlow. All rights reserved.</p>
        </div>
      </div>
    `;
        return this.sendEmail(email, subject, html);
    }

    async sendPaymentConfirmation(email, name, programTitle, amount, transactionId, paymentType) {
        const subject = `Payment Confirmation - ${programTitle} | LearnFlow`;
        const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 LearnFlow</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Payment Confirmation</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #a78bfa; margin-top: 0;">Thank you, ${name}!</h2>
          <p>Your payment has been successfully processed.</p>
          <div style="background: #1a1a3e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="color: #94a3b8; padding: 8px 0;">Program</td><td style="color: #e2e8f0; font-weight: bold; text-align: right;">${programTitle}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Amount</td><td style="color: #34d399; font-weight: bold; text-align: right;">$${amount.toFixed(2)}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Type</td><td style="color: #e2e8f0; text-align: right;">${paymentType === 'full' ? 'Full Payment' : 'Installment'}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Transaction ID</td><td style="color: #a78bfa; text-align: right;">${transactionId}</td></tr>
            </table>
          </div>
          <p style="color: #94a3b8;">A detailed receipt has been generated for your records.</p>
        </div>
        <div style="background: #0a0a1a; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 LearnFlow. All rights reserved.</p>
        </div>
      </div>
    `;
        return this.sendEmail(email, subject, html);
    }
}

module.exports = new EmailService();

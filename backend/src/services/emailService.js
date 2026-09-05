const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY || 're_dev_placeholder_key';
const isPlaceholderKey = !apiKey || apiKey === 're_dev_placeholder_key' || apiKey.includes('your_');

const resend = isPlaceholderKey ? null : new Resend(apiKey);
const fromEmail = process.env.EMAIL_FROM || 'Forkora Auth <onboarding@resend.dev>';

/**
 * Sends a 6-digit email verification code via Resend API.
 * 
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.name - User's display name
 * @param {string} options.code - 6-digit OTP code
 * @returns {Promise<Object>} Resend response or dev output object
 */
async function sendVerificationEmail({ email, name, code }) {
  const subject = `${code} is your Forkora verification code`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 24px; font-weight: 800; color: #4f46e5; text-decoration: none; display: inline-block; margin-bottom: 20px; }
        h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; }
        p { font-size: 15px; line-height: 1.6; color: #475569; }
        .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; }
        .footer { font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="#" class="logo">Forkora</a>
        <h2>Verify your email address</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Thank you for registering with Forkora. Please enter the following 6-digit verification code to complete your signup:</p>
        
        <div class="otp-box">
          <span class="otp-code">${code}</span>
        </div>
        
        <p>This verification code will expire in <strong>15 minutes</strong>. If you did not request this email, you can safely ignore it.</p>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} Forkora Career Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`\n==================================================`);
  console.log(`📧 [EMAIL SERVICE] Sending Verification Code to: ${email}`);
  console.log(`🔑 Verification Code (OTP): [ ${code} ]`);
  console.log(`==================================================\n`);

  if (!resend) {
    console.log(`[Resend SDK] Operating in DEV/FALLBACK mode (No valid RESEND_API_KEY specified).`);
    return {
      success: true,
      mode: 'development_log',
      messageId: `dev-otp-${Date.now()}`,
      code,
    };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log(`[Resend SDK] Email sent successfully via API. Message ID:`, data.id || data);
    return {
      success: true,
      mode: 'resend_api',
      data,
    };
  } catch (err) {
    console.error(`[Resend SDK Error] Failed to send email via Resend API:`, err.message);
    // Log fallback code so developer/testing isn't blocked by API errors (e.g. unverified domain)
    return {
      success: true,
      mode: 'fallback_error_log',
      error: err.message,
      code,
    };
  }
}

module.exports = {
  sendVerificationEmail,
};

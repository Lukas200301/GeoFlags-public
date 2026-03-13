/**
 * Utility to send a verification email to a new user.
 * During development (unless overridden), this will simply output the link to console
 * instead of actually calling the mail provider to prevent accidental spam.
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string,
  forceSend: boolean = false
): Promise<boolean> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyLink = `${frontendUrl}/auth/verify-email?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1b26; color: #a9b1d6; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7aa2f7; margin-bottom: 10px;">GeoFlags Verification</h1>
        </div>
        <div style="background-color: #24283b; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #c0caf5; margin-top: 0;">Welcome, ${username}!</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #9aa5ce;">
                Thank you for joining GeoFlags. To complete your setup, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyLink}" style="background-color: #7aa2f7; color: #1a1b26; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="font-size: 14px; color: #565f89; margin-bottom: 0;">
                Note: This verification link is valid for 24 hours. If you did not create an account, you can safely ignore this email.
            </p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #565f89;">
            <p>&copy; ${new Date().getFullYear()} GeoFlags. All rights reserved.</p>
        </div>
    </div>
  `;

  // Development bypass
  if (process.env.NODE_ENV !== 'production' && !forceSend) {
    console.log('\n--- DEVELOPMENT EMAIL BYPASS ---');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your email address - GeoFlags`);
    console.log(`Link: ${verifyLink}`);
    console.log('--------------------------------\n');
    return true;
  }

  const apiKey = process.env.MAIL_API;
  if (!apiKey) {
    console.error('❌ Error: MAIL_API not found in environment variables.');
    return false;
  }

  const payload = {
    sender: { name: 'GeoFlags App', email: 'noreply@geoflags.org' },
    to: [{ email, name: username }],
    subject: 'Verify your email address - GeoFlags',
    htmlContent,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`✅ Verification email sent to ${email}`);
      return true;
    } else {
      console.error(`❌ Failed to send email. Status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ An error occurred while sending the email:', error);
    return false;
  }
}

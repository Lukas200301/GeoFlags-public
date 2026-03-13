import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const sendBrevoMail = async () => {
  const apiKey = process.env.MAIL_API;

  if (!apiKey) {
    console.error('❌ Error: MAIL_API not found in environment variables.');
    process.exit(1);
  }

  rl.question('Enter the email address to send the test email to: ', async (recipientEmail) => {
    if (!recipientEmail || !recipientEmail.trim()) {
      console.error('❌ No email provided. Exiting.');
      rl.close();
      process.exit(1);
    }

    const email = recipientEmail.trim();

    const payload = {
      sender: { name: 'GeoFlags App', email: 'noreply@geoflags.org' },
      to: [{ email: email, name: 'Test User' }],
      subject: 'Please verify your GeoFlags account',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GeoFlags</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 0; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">GeoFlags <span style="font-size: 36px;">🌍</span></h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin-top: 0; margin-bottom: 24px; color: #f8fafc; font-size: 24px; font-weight: 700;">Welcome Explorer!</h2>
                      <p style="margin-top: 0; margin-bottom: 24px; color: #cbd5e1; font-size: 16px; line-height: 24px;">
                        Thank you for joining GeoFlags. You're just one step away from testing your geography knowledge and competing with players worldwide. To complete your setup, please verify your email address.
                      </p>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px 0;">
                            <a href="https://geoflags.org/verify?token=SAMPLE_TOKEN_123" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3); text-align: center;">
                              Verify My Account
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin-top: 0; margin-bottom: 24px; color: #94a3b8; font-size: 14px; line-height: 20px; font-style: italic;">
                        Note: This verification link is valid for 24 hours. If you did not create an account, you can safely ignore this email.
                      </p>
                      
                      <p style="margin-top: 0; margin-bottom: 8px; color: #cbd5e1; font-size: 16px; font-weight: 600;">
                        Happy exploring!
                      </p>
                      <p style="margin: 0; color: #94a3b8; font-size: 16px;">
                        The GeoFlags Team
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 24px; background-color: #0f172a; border-top: 1px solid #334155;">
                      <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px;">
                        © 2026 GeoFlags. All rights reserved.<br>
                        <a href="https://geoflags.org" style="color: #3b82f6; text-decoration: none;">geoflags.org</a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    console.log(`Sending test email to ${email} via Brevo...`);

    try {
      /* DEVELOPMENT OVERRIDE: Email sending is currently disabled to prevent accidental sends during development.
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json() as { messageId?: string };
        console.log("✅ Success! Email sent successfully.");
        console.log("Brevo Message ID:", data.messageId || "N/A");
      } else {
        const errorData = await response.text();
        console.error(`❌ Failed to send email. Status: ${response.status} ${response.statusText}`);
        console.error("Response details:", errorData);
      }
      */
      console.log(
        '✅ Success! Email HTML generated successfully. (Email sending is currently disabled)'
      );
      console.log('You can save the HTML payload to a test.html file to preview it.');

      // We can also save it locally to view it easier
      const fs = require('fs');
      fs.writeFileSync('test-email-preview.html', payload.htmlContent);
      console.log('📄 Wrote email preview to test-email-preview.html');
    } catch (error) {
      console.error('❌ An error occurred while sending the email:', error);
    } finally {
      rl.close();
    }
  });
};

sendBrevoMail();

import { sendVerificationEmail } from './utils/mail';
import prisma from './utils/prisma';
import crypto from 'crypto';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const testVerificationMail = async () => {
  const apiKey = process.env.MAIL_API;

  if (!apiKey) {
    console.error('❌ Error: MAIL_API not found in environment variables.');
    process.exit(1);
  }

  rl.question(
    'Enter the email address of the account to test verification: ',
    async (recipientEmail) => {
      if (!recipientEmail || !recipientEmail.trim()) {
        console.error('❌ No email provided. Exiting.');
        process.exit(1);
      }

      const email = recipientEmail.trim();

      try {
        // Find the user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error(`❌ User with email ${email} not found.`);
          process.exit(1);
        }

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);

        // Update the user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationToken,
            verificationExpires,
            emailVerified: false,
          },
        });

        console.log(`✅ Updated user ${user.username} with new validation token.`);
        console.log(`Sending test verification email to ${email} via Brevo...`);

        // Force send even in development
        const success = await sendVerificationEmail(email, user.username, verificationToken, true);

        if (success) {
          console.log('✅ Success! You can now check your inbox.');
        } else {
          console.log('❌ Failed to send the email. Check logs above.');
        }
      } catch (error) {
        console.error('❌ An error occurred:', error);
      } finally {
        await prisma.$disconnect();
        rl.close();
        process.exit(0);
      }
    }
  );
};

testVerificationMail();

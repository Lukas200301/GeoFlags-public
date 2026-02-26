import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const backendDir = path.resolve(__dirname, '../backend');

  console.log('Starting database update process...');

  try {
    console.log('📦 Applying Prisma schema changes (db push)...');
    // We use db push during dev to quickly sync models, or you can use "migrate deploy" for strict production migrations
    const pushResult = await execAsync('npx prisma db push', { cwd: backendDir });
    console.log(pushResult.stdout);
    if (pushResult.stderr) console.warn(pushResult.stderr);

    console.log('⚙️ Generating Prisma client...');
    const generateResult = await execAsync('npx prisma generate', { cwd: backendDir });
    console.log(generateResult.stdout);
    if (generateResult.stderr) console.warn(generateResult.stderr);

    console.log('✅ Database update completed successfully!');
  } catch (error) {
    console.error('❌ Database update failed:\n', error.message || error);
    process.exit(1);
  }
}

main();

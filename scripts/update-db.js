import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const backendDir = path.resolve(__dirname, '../backend')

  console.log('Starting database update process...')

  try {
    console.log('📦 Applying Prisma migrations...')
    // We use migrate deploy to safely apply migration history to the database without drifting
    const migrateResult = await execAsync('npx prisma migrate deploy', { cwd: backendDir })
    console.log(migrateResult.stdout)
    if (migrateResult.stderr) console.warn(migrateResult.stderr)

    console.log('⚙️ Generating Prisma client...')
    const generateResult = await execAsync('npx prisma generate', { cwd: backendDir })
    console.log(generateResult.stdout)
    if (generateResult.stderr) console.warn(generateResult.stderr)

    console.log('✅ Database update completed successfully!')
  } catch (error) {
    console.error('❌ Database update failed:\n', error.message || error)
    process.exit(1)
  }
}

main()

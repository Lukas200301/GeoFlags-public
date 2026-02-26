import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function getDatabaseUrl() {
  const envPath = path.resolve(__dirname, '../backend/.env')
  try {
    const envContent = await fs.readFile(envPath, 'utf8')
    const dbUrlMatch = envContent.match(/^DATABASE_URL=["']?(.*?)["']?$/m)
    if (!dbUrlMatch) {
      throw new Error('DATABASE_URL not found in backend/.env')
    }
    return dbUrlMatch[1].trim()
  } catch (error) {
    console.error('Error reading backend/.env:', error.message)
    process.exit(1)
  }
}

async function main() {
  const dbUrl = await getDatabaseUrl()
  const backupsDir = path.resolve(__dirname, '../backups')

  // Create backups directory if it doesn't exist
  try {
    await fs.access(backupsDir)
  } catch {
    await fs.mkdir(backupsDir)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(backupsDir, `backup-${timestamp}.sql`)

  console.log(`Starting database backup to ${backupFile}...`)

  try {
    // We use pg_dump. Make sure PostgreSQL tools are in PATH.
    // Using --clean to include DROP statements so restore is easier
    const { stdout, stderr } = await execAsync(
      `pg_dump "${dbUrl}" --clean --if-exists --file="${backupFile}"`
    )
    if (stderr && !stderr.includes('notice')) {
      console.warn('pg_dump warning/info (can often be ignored):', stderr)
    }
    console.log('✅ Backup completed successfully!')
  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    process.exit(1)
  }
}

main()

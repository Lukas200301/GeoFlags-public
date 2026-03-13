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
  const args = process.argv.slice(2)
  let backupFile = args[0]

  const backupsDir = path.resolve(__dirname, '../backups')

  if (!backupFile) {
    try {
      const files = await fs.readdir(backupsDir)
      const sqlFiles = files
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .reverse()
      if (sqlFiles.length === 0) {
        console.error('❌ No backup files found in ' + backupsDir)
        process.exit(1)
      }
      backupFile = path.join(backupsDir, sqlFiles[0])
      console.log(`No file specified, using most recent backup: ${sqlFiles[0]}`)
    } catch (err) {
      console.error('❌ Error reading backups directory:', err.message)
      process.exit(1)
    }
  } else {
    backupFile = path.resolve(process.cwd(), backupFile)
  }

  try {
    await fs.access(backupFile)
  } catch {
    console.error(`❌ Backup file not found: ${backupFile}`)
    process.exit(1)
  }

  const dbUrl = await getDatabaseUrl()

  console.log(`Starting database safe-restore from ${path.basename(backupFile)}...`)
  console.log(
    '⚠️ Note: This script will ONLY insert missing records. It will NOT overwrite existing data or drop tables.'
  )

  try {
    // 1) We will temporarily use the PostgreSQL connection via pg command-line tools
    // but ask it to do an INSERT with ON CONFLICT DO NOTHING logic.
    // However, since standard pg_dump creates COPY FROM stdin statements which fail on conflict,
    // we must convert the backup file.

    console.log('🔄 Parsing backup dump to extract raw data...')
    const sqlContent = await fs.readFile(backupFile, 'utf8')

    // Split the SQL file by lines to find COPY statements
    const lines = sqlContent.split('\n')
    let currentTable = null
    let currentColumns = []

    let isInsideCopyBlock = false

    // Buffer inserts by table
    const tableInserts = {}

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith('COPY public.')) {
        // e.g., COPY public."User" (id, email, password) FROM stdin;
        const match = line.match(/COPY public\."?([^"\s]+)"?\s*\(([^)]+)\)\s*FROM stdin;/i)
        if (match) {
          currentTable = match[1]
          currentColumns = match[2].split(',').map((c) => c.trim().replace(/"/g, ''))
          if (!tableInserts[currentTable]) tableInserts[currentTable] = []
          isInsideCopyBlock = true
          continue
        }
      }

      if (isInsideCopyBlock) {
        if (line.trim() === '\\.') {
          isInsideCopyBlock = false
          currentTable = null
          continue
        }

        // This is a row of data
        if (line.trim() !== '') {
          const values = line.split('\t')

          // Format values for SQL INSERT
          const formattedValues = values.map((val) => {
            if (val === '\\N') return 'NULL'

            // Escape single quotes for SQL string
            const escapedVal = val.replace(/'/g, "''")
            return `'${escapedVal}'`
          })

          // Buffer it instead of writing directly
          tableInserts[currentTable].push(
            `INSERT INTO public."${currentTable}" ("${currentColumns.join('", "')}") VALUES (${formattedValues.join(', ')}) ON CONFLICT DO NOTHING;\n`
          )
        }
      }
    }

    // Topological sort manually defined based on Prisma schema:
    // Independent tables first, then dependencies
    const insertionOrder = [
      'countries',
      'users',
      'user_profiles',
      'user_stats',
      'game_modes',
      'auth_tokens',
      'admin_audits',
      'friends',
      'friend_requests',
      'games',
      'battles',
      'battle_participants',
      'uptime_pings',
      'DailyUptime',
    ]

    // We will dynamically write an append-only transaction file
    const safeBackupPath = backupFile.replace('.sql', '-safe-inserts.sql')
    let safeSqlContent = 'BEGIN;\n'

    // Insert according to priority order
    for (const table of insertionOrder) {
      if (tableInserts[table]) {
        safeSqlContent += tableInserts[table].join('')
        delete tableInserts[table]
      }
    }

    // Dump any remaining tables that were not in the explicit order map
    for (const table in tableInserts) {
      safeSqlContent += tableInserts[table].join('')
    }

    safeSqlContent += 'COMMIT;\n'

    console.log('📝 Generated safe insert statements. Applying to database...')
    await fs.writeFile(safeBackupPath, safeSqlContent, 'utf8')

    const { stdout, stderr } = await execAsync(
      `psql "${dbUrl}" -v ON_ERROR_STOP=1 -f "${safeBackupPath}"`
    )
    if (stderr && !stderr.includes('NOTICE:')) {
      console.warn('psql warning/info:', stderr)
    }

    // Clean up
    await fs.unlink(safeBackupPath)

    console.log('✅ Safely merged missing data back into the database!')
  } catch (error) {
    console.error('❌ Restore failed:', error.message)
    process.exit(1)
  }
}

main()

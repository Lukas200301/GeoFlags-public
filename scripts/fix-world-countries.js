/**
 * Fix world-countries ESM import issue
 *
 * This script patches the world-countries package to properly import JSON
 * with the required import assertion for Node.js ESM compatibility.
 *
 * Issue: Node.js requires `with { type: 'json' }` or `assert { type: 'json' }`
 * when importing JSON files in ESM modules.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const INDEX_PATH = join(__dirname, '../node_modules/world-countries/index.mjs')

try {
  const content = readFileSync(INDEX_PATH, 'utf-8')

  // Check if already patched
  if (content.includes('with { type:') || content.includes("with { type: 'json' }")) {
    console.log('✓ world-countries already patched')
    process.exit(0)
  }

  // Apply the patch
  const patchedContent = `import countriesData from './countries.json' with { type: 'json' };
export default countriesData;
`

  writeFileSync(INDEX_PATH, patchedContent, 'utf-8')
  console.log('✓ Successfully patched world-countries package')
} catch (error) {
  console.error('✗ Failed to patch world-countries:', error.message)
  process.exit(1)
}

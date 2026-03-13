#!/usr/bin/env node

/**
 * Build script for GeoFlags - builds both frontend and backend
 * with nice formatted output
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
  white: '\x1b[37m',
}

function log(msg) {
  console.log(msg)
}

function header(text) {
  const line = '═'.repeat(48)
  log('')
  log(`${colors.cyan}  ╔${line}╗${colors.reset}`)
  log(
    `${colors.cyan}  ║${colors.bold}${colors.white}${text.padStart(24 + text.length / 2).padEnd(48)}${colors.reset}${colors.cyan}║${colors.reset}`
  )
  log(`${colors.cyan}  ╚${line}╝${colors.reset}`)
  log('')
}

function step(icon, label) {
  log(`  ${icon}  ${colors.bold}${label}${colors.reset}`)
}

function success(label, duration) {
  log(`  ${colors.green}✓${colors.reset}  ${label} ${colors.dim}(${duration})${colors.reset}`)
}

function error(label) {
  log(`  ${colors.red}✗${colors.reset}  ${colors.red}${label}${colors.reset}`)
}

function formatDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function runStep(label, command, cwd) {
  step('⏳', `${label}...`)
  const start = performance.now()
  try {
    execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
    })
    const duration = formatDuration(performance.now() - start)
    // Move cursor up one line and overwrite
    process.stdout.write('\x1b[1A\x1b[2K')
    success(label, duration)
    return true
  } catch (err) {
    process.stdout.write('\x1b[1A\x1b[2K')
    error(`${label} failed!`)
    log('')
    log(err.stdout || '')
    log(err.stderr || '')
    return false
  }
}

// ─── Main ────────────────────────────────────────

header('GeoFlags Build')

const totalStart = performance.now()
let allPassed = true

// Step 1: Build backend
log(`  ${colors.blue}${colors.bold}Backend${colors.reset}`)
if (!runStep('TypeScript compile', 'npx tsc', './backend')) {
  allPassed = false
}
if (
  allPassed &&
  !runStep('Copy assets', 'npx copyfiles -u 1 "src/**/*.geo.json" dist', './backend')
) {
  allPassed = false
}
log('')

// Step 2: Build frontend
log(`  ${colors.magenta}${colors.bold}Frontend${colors.reset}`)
if (allPassed && !runStep('Nuxt build', 'npx nuxt build', '.')) {
  allPassed = false
}

// Summary
const totalDuration = formatDuration(performance.now() - totalStart)
log('')

if (allPassed) {
  const line = '─'.repeat(48)
  log(`  ${colors.dim}${line}${colors.reset}`)
  log('')
  log(
    `  ${colors.bgGreen}${colors.bold}${colors.white} BUILD SUCCESSFUL ${colors.reset}  ${colors.dim}Total: ${totalDuration}${colors.reset}`
  )
  log('')
  log(
    `  ${colors.dim}Run ${colors.reset}${colors.cyan}npm run test:prod${colors.reset}${colors.dim} to start both servers${colors.reset}`
  )
  log('')
} else {
  const line = '─'.repeat(48)
  log(`  ${colors.dim}${line}${colors.reset}`)
  log('')
  log(
    `  ${colors.bgRed}${colors.bold}${colors.white} BUILD FAILED ${colors.reset}  ${colors.dim}after ${totalDuration}${colors.reset}`
  )
  log('')
  process.exit(1)
}

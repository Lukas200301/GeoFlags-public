import dotenv from 'dotenv';
import prisma from './utils/prisma';

/**
 * Database Seed Script
 *
 * Seeds the database with:
 * - Initial admin user (from env variables)
 * - Default game modes (FLAGS, CAPITALS, MAPS, MIXED)
 * - Optional demo users and scores for development
 */

dotenv.config();


async function main() {
  console.log('Starting database seed...');

  try {
    
    /**
     * 3. Create Game Modes
     */
    const gameModes = [
      {
        id: 'GUESS_FLAG',
        name: 'Guess the Flag - Infinite Mode',
        description: 'Guess country flags infinitely until you make a mistake',
        enabled: true,
      },
      {
        id: 'TIME_TRIAL',
        name: 'Time Trial',
        description: '60 seconds to guess as many flags as possible. Correct answers give +1 point, wrong answers deduct 5 seconds.',
        enabled: true,
      },
      {
        id: 'FIND_CAPITAL',
        name: 'Find the Capital',
        description: 'Click on the correct capital city location on the map. Get within 100km to score!',
        enabled: true,
      },
      {
        id: 'HIGHER_LOWER',
        name: 'Higher/Lower',
        description: 'Compare country sizes and guess if the next country is larger or smaller. Build your streak!',
        enabled: true,
      },
      // Battle modes
      {
        id: 'BATTLE_FLAG_SPEED',
        name: 'Flag Speed Battle',
        description: '10 rounds - Identify flags as fast as possible. Speed and accuracy matter!',
        enabled: true,
      },
      {
        id: 'BATTLE_CAPITAL_RUSH',
        name: 'Capital Rush',
        description: '10 rounds - Race to match countries with their capitals',
        enabled: true,
      },
      {
        id: 'BATTLE_GEOGRAPHY_DUEL',
        name: 'Geography Duel',
        description: '15 rounds - Mixed questions: flags, capitals, and locations',
        enabled: true,
      },
      {
        id: 'BATTLE_EXPERT_SHOWDOWN',
        name: 'Expert Showdown',
        description: '20 rounds - Ultimate geography challenge. Only for experts!',
        enabled: true,
      },
    ];

    for (const mode of gameModes) {
      const existing = await prisma.gameMode.findUnique({
        where: { id: mode.id as any },
      });

      if (existing) {
        console.log(`Game mode already exists: ${mode.name}`);
      } else {
        await prisma.gameMode.create({
          data: mode as any,
        });
        console.log(`✓ Created game mode: ${mode.name}`);
      }
    }

    console.log('\n✓ Database seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error during seed:', error);
    process.exit(1);
  });

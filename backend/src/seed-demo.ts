import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import prisma from './utils/prisma';
import { GameModeType } from '@prisma/client';

/**
 * Demo Database Seed Script
 *
 * Seeds the database with realistic demo data:
 * - 50 demo users with realistic gamertags and secure passwords
 * - Game sessions for each user across all game modes
 * - Leaderboard entries with varied scores
 * - Realistic game statistics
 */

dotenv.config();

// Realistic gamertag components
const adjectives = [
  'Swift', 'Silent', 'Cosmic', 'Shadow', 'Crimson', 'Golden', 'Azure', 'Mystic',
  'Epic', 'Legendary', 'Thunder', 'Viper', 'Ninja', 'Phantom', 'Arctic', 'Blaze',
  'Frost', 'Storm', 'Titan', 'Stealth', 'Rogue', 'Neon', 'Cyber', 'Dark',
  'Iron', 'Steel', 'Diamond', 'Quantum', 'Dragon', 'Wolf', 'Ghost', 'Raven',
  'Crystal', 'Omega', 'Alpha', 'Nova', 'Void', 'Prism', 'Echo', 'Zen'
];

const nouns = [
  'Hunter', 'Warrior', 'Striker', 'Reaper', 'Phoenix', 'Eagle', 'Lion', 'Tiger',
  'Falcon', 'Vortex', 'Blade', 'Fang', 'Claw', 'Knight', 'Ranger', 'Sniper',
  'Ace', 'Champion', 'Legend', 'Master', 'King', 'Emperor', 'Overlord', 'Slayer',
  'Destroyer', 'Conqueror', 'Berserker', 'Assassin', 'Tempest', 'Sentinel', 'Guardian',
  'Sorcerer', 'Wizard', 'Demon', 'Angel', 'Titan', 'Golem', 'Wraith', 'Specter', 'Shade'
];

const gamerWords = [
  'xXx', 'Pro', 'GG', 'TTV', 'YT', 'Twitch', 'Gaming', 'Plays', 'FTW',
  'MVP', 'Clutch', 'Toxic', 'Noob', 'Elite', 'Savage', 'Beast', 'Insane'
];

// Modern gamer suffixes
const numbers = ['69', '420', '666', '777', '1337', '2077', '3000', '9000', '42', '21'];

// Avatar URLs from DiceBear API (consistent avatar generation)
const getAvatarUrl = (seed: string) => {
  const styles = ['avataaars', 'bottts', 'identicon', 'lorelei', 'micah', 'personas', 'pixel-art'];
  const style = styles[Math.floor(Math.random() * styles.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};

// Generate realistic gamer username
const generateUsername = (): string => {
  const rand = Math.random();
  
  if (rand > 0.7) {
    // Style 1: AdjectiveNoun + Number (e.g., ShadowHunter420)
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = numbers[Math.floor(Math.random() * numbers.length)];
    return `${adj}${noun}${num}`;
  } else if (rand > 0.4) {
    // Style 2: xXx_Name_xXx (e.g., xXx_DarkPhoenix_xXx)
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `xXx_${adj}${noun}_xXx`;
  } else if (rand > 0.2) {
    // Style 3: GamerWord + AdjectiveNoun (e.g., ProNinjaStrike, TTVCyberWolf)
    const word = gamerWords[Math.floor(Math.random() * gamerWords.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${word}${adj}${noun}`;
  } else {
    // Style 4: Simple AdjectiveNoun (e.g., GoldenEagle, MysticDragon)
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}`;
  }
};

// Generate cryptographically secure random password
const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Random number in range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Random date in the past 90 days
const randomPastDate = (daysBack: number = 90): Date => {
  const now = Date.now();
  const pastTime = now - (Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(pastTime);
};

async function main() {
  console.log('Starting demo data seed...');

  try {
    // Get existing game modes
    const gameModes = await prisma.gameMode.findMany();
    if (gameModes.length === 0) {
      console.log('⚠️  No game modes found. Please run the main seed first.');
      return;
    }

    console.log(`Found ${gameModes.length} game modes`);

    // Create 50 demo users
    console.log('\nCreating demo users...');
    const users = [];
    const createdUsernames = new Set<string>();

    for (let i = 1; i <= 50; i++) {
      // Generate unique username
      let username = generateUsername();
      let attempts = 0;
      while (createdUsernames.has(username) && attempts < 100) {
        username = generateUsername();
        attempts++;
      }
      createdUsernames.add(username);

      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@geoflags.demo`;
      const securePassword = generateSecurePassword();
      const passwordHash = await bcrypt.hash(securePassword, 10);

      // 30% of users don't have a profile image
      const hasAvatar = Math.random() > 0.3;

      try {
        const user = await prisma.user.create({
          data: {
            username,
            email,
            password_hash: passwordHash,
            avatarUrl: hasAvatar ? getAvatarUrl(username) : null,
            role: 'USER',
            status: 'ACTIVE',
            createdAt: randomPastDate(90),
            lastActive: randomPastDate(7),
          },
        });
        users.push(user);
        console.log(`✓ Created user ${i}/50: ${username} ${hasAvatar ? '(with avatar)' : '(no avatar)'}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User ${username} already exists, skipping...`);
          const existingUser = await prisma.user.findUnique({ where: { username } });
          if (existingUser) users.push(existingUser);
        } else {
          throw error;
        }
      }
    }

    console.log(`\n✓ Created/found ${users.length} users`);

    // Create game sessions and leaderboard entries for each user
    console.log('\nCreating game sessions and leaderboard entries...');

    for (const user of users) {
      // Determine activity level (some users are more active than others)
      const activityLevel = Math.random();
      let gamesPerMode: number;

      if (activityLevel > 0.8) {
        gamesPerMode = randomInt(15, 30); // Very active
      } else if (activityLevel > 0.5) {
        gamesPerMode = randomInt(5, 15); // Moderately active
      } else {
        gamesPerMode = randomInt(1, 5); // Casual
      }

      for (const gameMode of gameModes) {
        const numGames = randomInt(1, gamesPerMode);
        let bestScore = 0;

        for (let i = 0; i < numGames; i++) {
          // Generate score based on game mode
          let score: number;
          
          switch (gameMode.id) {
            case 'GUESS_FLAG':
              // Infinite mode: 0-50 range, with some high scorers
              score = Math.random() > 0.9 
                ? randomInt(30, 100) 
                : randomInt(0, 30);
              break;
            
            case 'TIME_TRIAL':
              // Time trial: 0-40 range
              score = Math.random() > 0.85 
                ? randomInt(25, 50) 
                : randomInt(5, 25);
              break;
            
            case 'FIND_CAPITAL':
              // Find capital: 0-30 range
              score = Math.random() > 0.9 
                ? randomInt(20, 40) 
                : randomInt(0, 20);
              break;
            
            case 'HIGHER_LOWER':
              // Higher or Lower: 0-30 range
              score = Math.random() > 0.9
                ? randomInt(20, 40)
                : randomInt(0, 20);
              break;
            
            default:
              score = randomInt(0, 50);
          }

          if (score > bestScore) {
            bestScore = score;
          }

          // Create game session
          await prisma.gameSession.create({
            data: {
              userId: user.id,
              mode: gameMode.id as GameModeType,
              score,
              createdAt: randomPastDate(60),
            },
          });
        }

        // Create or update leaderboard entry with best score
        const existingEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            userId: user.id,
            mode: gameMode.id as GameModeType,
          },
        });

        if (existingEntry) {
          if (bestScore > existingEntry.score) {
            await prisma.leaderboardEntry.update({
              where: { id: existingEntry.id },
              data: { score: bestScore },
            });
          }
        } else {
          await prisma.leaderboardEntry.create({
            data: {
              userId: user.id,
              mode: gameMode.id as GameModeType,
              score: bestScore,
            },
          });
        }
      }

      console.log(`✓ Created game data for: ${user.username}`);
    }

    console.log('\n✓ Demo data seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - Each user has multiple game sessions across ${gameModes.length} game modes`);
    console.log(`   - Realistic scores and timestamps`);
    console.log(`   - All users have cryptographically secure random passwords`);
    console.log('\nNote: Passwords are randomly generated and secure (24 characters).');
    console.log('Example usernames:', users.slice(0, 5).map(u => u.username).join(', '));

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

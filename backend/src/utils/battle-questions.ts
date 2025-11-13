import countries from 'world-countries';

/**
 * Battle Questions Generator
 *
 * Generates randomized questions for battle modes
 */

interface BattleQuestion {
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  countryCode?: string;
  flagUrl?: string;
}

/**
 * Shuffle array helper
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = Array.from(array);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random countries
 */
function getRandomCountries(count: number): typeof countries {
  return shuffleArray(countries).slice(0, count);
}

/**
 * Generate flag guess questions
 */
function generateFlagQuestions(count: number): BattleQuestion[] {
  const questions: BattleQuestion[] = [];
  // Filter countries that have valid flag data
  const countriesWithFlags = countries.filter((c) => c.flag);
  const selectedCountries = shuffleArray(countriesWithFlags).slice(0, count);

  for (const country of selectedCountries) {
    // Get 3 random wrong answers
    const wrongAnswers = shuffleArray(
      countriesWithFlags.filter((c) => c.cca2 !== country.cca2)
    )
      .slice(0, 3)
      .map((c) => c.name.common);

    // Add correct answer and shuffle
    const options = shuffleArray([...wrongAnswers, country.name.common]);

    questions.push({
      type: 'flag',
      question: 'Which country does this flag belong to?',
      options,
      correctAnswer: country.name.common,
      countryCode: country.cca2,
      flagUrl: country.flag,
    });
  }

  return questions;
}

/**
 * Generate capital questions
 */
function generateCapitalQuestions(count: number): BattleQuestion[] {
  const questions: BattleQuestion[] = [];
  const selectedCountries = getRandomCountries(count).filter((c) => c.capital && c.capital.length > 0);

  for (let i = 0; i < Math.min(count, selectedCountries.length); i++) {
    const country = selectedCountries[i];
    const capital = country.capital[0];

    // Get 3 random wrong answers (other capitals)
    const wrongAnswers = shuffleArray(
      countries.filter((c) => c.cca2 !== country.cca2 && c.capital && c.capital.length > 0)
    )
      .slice(0, 3)
      .map((c) => c.capital[0]);

    // Add correct answer and shuffle
    const options = shuffleArray([...wrongAnswers, capital]);

    questions.push({
      type: 'capital',
      question: `What is the capital of ${country.name.common}?`,
      options,
      correctAnswer: capital,
      countryCode: country.cca2,
    });
  }

  return questions;
}

/**
 * Generate higher/lower questions
 */
function generateHigherLowerQuestions(count: number): BattleQuestion[] {
  const questions: BattleQuestion[] = [];
  const selectedCountries = getRandomCountries(count * 2);

  // Only use area since we don't have population data
  const statTypes = [
    { key: 'area', label: 'area (km²)', format: (n: number) => n.toLocaleString() },
  ];

  for (let i = 0; i < count && i * 2 + 1 < selectedCountries.length; i++) {
    const country1 = selectedCountries[i * 2];
    const country2 = selectedCountries[i * 2 + 1];
    const statType = statTypes[0]; // Only area available

    const value1 = (country1 as any)[statType.key] || 0;
    const value2 = (country2 as any)[statType.key] || 0;

    const correctAnswer = value2 > value1 ? 'Higher' : 'Lower';

    questions.push({
      type: 'higher_lower',
      question: `${country1.name.common} has a ${statType.label} of ${statType.format(value1)}.\nDoes ${country2.name.common} have a HIGHER or LOWER ${statType.label}?`,
      options: ['Higher', 'Lower'],
      correctAnswer,
    });
  }

  return questions;
}

/**
 * Generate time trial questions (mixed)
 */
function generateTimeTrialQuestions(count: number): BattleQuestion[] {
  const flagCount = Math.ceil(count / 2);
  const capitalCount = count - flagCount;

  const flagQuestions = generateFlagQuestions(flagCount);
  const capitalQuestions = generateCapitalQuestions(capitalCount);

  return shuffleArray([...flagQuestions, ...capitalQuestions]);
}

/**
 * Generate mixed geography questions (flags, capitals, higher/lower)
 */
function generateMixedQuestions(count: number): BattleQuestion[] {
  const flagCount = Math.ceil(count / 3);
  const capitalCount = Math.ceil(count / 3);
  const higherLowerCount = count - flagCount - capitalCount;

  const flagQuestions = generateFlagQuestions(flagCount);
  const capitalQuestions = generateCapitalQuestions(capitalCount);
  const higherLowerQuestions = generateHigherLowerQuestions(higherLowerCount);

  return shuffleArray([...flagQuestions, ...capitalQuestions, ...higherLowerQuestions]);
}

/**
 * Main function to generate battle questions based on mode
 */
export function generateBattleQuestions(mode: string, count: number = 10): BattleQuestion[] {
  switch (mode) {
    // Battle-specific modes
    case 'BATTLE_FLAG_SPEED':
      return generateFlagQuestions(10);
    case 'BATTLE_CAPITAL_RUSH':
      return generateCapitalQuestions(10);
    case 'BATTLE_GEOGRAPHY_DUEL':
      return generateMixedQuestions(15);
    case 'BATTLE_EXPERT_SHOWDOWN':
      return generateMixedQuestions(20);

    // Legacy modes (for backward compatibility)
    case 'GUESS_FLAG':
      return generateFlagQuestions(count);
    case 'FIND_CAPITAL':
      return generateCapitalQuestions(count);
    case 'HIGHER_LOWER':
      return generateHigherLowerQuestions(count);
    case 'TIME_TRIAL':
      return generateTimeTrialQuestions(count);

    default:
      // Default to flag speed battle
      return generateFlagQuestions(10);
  }
}

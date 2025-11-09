import dictionaryText from './dictionary.txt?raw';

interface PuzzleData {
  centerLetter: string;
  outerLetters: string[];
  validWords: string[];
  pangrams: string[];
  maxScore: number;
}

// Parse dictionary once
const DICTIONARY = dictionaryText
  .split('\n')
  .map(w => w.trim().toLowerCase())
  .filter(w => w.length >= 4);

/**
 * Check if a word can be formed using only the allowed letters
 */
const canFormWord = (word: string, allowedLetters: Set<string>): boolean => {
  return [...word].every(char => allowedLetters.has(char));
};

/**
 * Check if a word uses all 7 letters (pangram)
 */
const isPangram = (word: string, allLetters: Set<string>): boolean => {
  const wordLetters = new Set([...word]);
  return allLetters.size === wordLetters.size && 
         [...allLetters].every(letter => wordLetters.has(letter));
};

/**
 * Calculate score for a word
 */
const calculateWordScore = (word: string, isPangram: boolean): number => {
  if (word.length === 4) return 1;
  if (isPangram) return word.length + 7;
  return word.length;
};

/**
 * Generate a valid puzzle from a set of letters
 */
export const generatePuzzle = (centerLetter: string, outerLetters: string[]): PuzzleData => {
  const center = centerLetter.toLowerCase();
  const outer = outerLetters.map(l => l.toLowerCase());
  const allLetters = new Set([center, ...outer]);
  const allowedLetters = new Set(allLetters);
  
  const validWords: string[] = [];
  const pangrams: string[] = [];
  let maxScore = 0;

  for (const word of DICTIONARY) {
    // Must contain center letter
    if (!word.includes(center)) continue;
    
    // Must only use allowed letters
    if (!canFormWord(word, allowedLetters)) continue;
    
    validWords.push(word);
    const wordIsPangram = isPangram(word, allLetters);
    
    if (wordIsPangram) {
      pangrams.push(word);
    }
    
    maxScore += calculateWordScore(word, wordIsPangram);
  }

  return {
    centerLetter: centerLetter.toUpperCase(),
    outerLetters: outer.map(l => l.toUpperCase()),
    validWords,
    pangrams,
    maxScore,
  };
};

/**
 * Pick random letters and generate a puzzle
 * Ensures at least some valid words exist
 */
export const generateRandomPuzzle = (): PuzzleData => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const commonConsonants = ['r', 't', 'n', 's', 'l', 'c', 'd', 'p', 'g', 'h', 'm', 'b'];
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    // Pick 2-3 vowels and 4-5 consonants for better word coverage
    const numVowels = Math.random() > 0.5 ? 2 : 3;
    const numConsonants = 7 - numVowels;
    
    const selectedVowels = [...vowels]
      .sort(() => Math.random() - 0.5)
      .slice(0, numVowels);
    
    const selectedConsonants = [...commonConsonants]
      .sort(() => Math.random() - 0.5)
      .slice(0, numConsonants);
    
    const allLetters = [...selectedVowels, ...selectedConsonants];
    
    // Prefer a vowel or common consonant as center
    const centerLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
    const outerLetters = allLetters.filter(l => l !== centerLetter);
    
    const puzzle = generatePuzzle(centerLetter, outerLetters);
    
    // Ensure puzzle has at least 20 words and at least 1 pangram
    if (puzzle.validWords.length >= 20 && puzzle.pangrams.length >= 1) {
      return puzzle;
    }
    
    attempts++;
  }
  
  // Fallback to a known good puzzle
  return generatePuzzle('e', ['r', 't', 'a', 'c', 'h', 's']);
};

/**
 * Get or create today's puzzle (same puzzle for the whole day)
 */
export const getTodaysPuzzle = (): PuzzleData => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('velarix-daily-puzzle');
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed.puzzle;
      }
    } catch (e) {
      console.error('Failed to parse stored puzzle:', e);
    }
  }
  
  // Generate new puzzle for today
  const puzzle = generateRandomPuzzle();
  localStorage.setItem('velarix-daily-puzzle', JSON.stringify({
    date: today,
    puzzle,
  }));
  
  return puzzle;
};

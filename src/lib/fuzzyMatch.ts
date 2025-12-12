// Common connector words to ignore in French and English
const STOP_WORDS = new Set([
  // French
  'et', 'ou', 'mais', 'donc', 'car', 'cependant', 'ainsi', 'puisque', 'lorsque',
  'ni', 'or', 'puis', 'que', 'quand', 'si', 'comme', 'parce', 'pendant',
  'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'par', 'entre', 'vers',
  'chez', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'ce', 'cette',
  'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
  'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'qui', 'dont', 'où',
  // English
  'and', 'or', 'but', 'so', 'because', 'however', 'thus', 'since', 'when',
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'which', 'who', 'whom'
]);

/**
 * Remove accents from a string
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize text for comparison:
 * - Convert to lowercase
 * - Remove accents
 * - Remove punctuation and special characters
 * - Reduce multiple spaces
 * - Optionally remove stop words
 */
export function normalizeText(text: string, removeStopWords = true): string {
  let normalized = text
    .toLowerCase()
    .trim();
  
  // Remove accents
  normalized = removeAccents(normalized);
  
  // Remove punctuation and special characters, keep only letters, numbers, and spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  
  // Reduce multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Remove stop words if requested
  if (removeStopWords) {
    const words = normalized.split(' ');
    const filteredWords = words.filter(word => !STOP_WORDS.has(word) && word.length > 0);
    // If all words were stop words, keep the original
    normalized = filteredWords.length > 0 ? filteredWords.join(' ') : normalized;
  }
  
  return normalized;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Initialize first column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  // Initialize first row
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0 to 1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  return 1 - (distance / maxLength);
}

export interface AnswerCheckResult {
  isCorrect: boolean;
  similarity: number;
  isPerfect: boolean;
  userNormalized: string;
  expectedNormalized: string;
}

/**
 * Check if user answer matches expected answer with fuzzy matching
 * Returns detailed result including whether the answer is perfect
 */
export function checkAnswer(userAnswer: string, expectedAnswer: string): AnswerCheckResult {
  // Normalize both texts
  const normalizedUser = normalizeText(userAnswer);
  const normalizedExpected = normalizeText(expectedAnswer);
  
  // If both are empty after normalization, consider it incorrect
  if (normalizedUser.length === 0 && normalizedExpected.length === 0) {
    return { isCorrect: false, similarity: 0, isPerfect: false, userNormalized: '', expectedNormalized: '' };
  }
  
  // Calculate similarity
  const similarity = calculateSimilarity(normalizedUser, normalizedExpected);
  
  // Determine threshold based on answer length
  // Short answers (< 10 chars after normalization) need stricter matching
  const isShortAnswer = normalizedExpected.length < 10;
  const threshold = isShortAnswer ? 0.92 : 0.85;
  
  // Check if answer is perfect (exact match after normalization)
  const isPerfect = normalizedUser === normalizedExpected;
  
  return {
    isCorrect: similarity >= threshold,
    similarity,
    isPerfect,
    userNormalized: normalizedUser,
    expectedNormalized: normalizedExpected
  };
}

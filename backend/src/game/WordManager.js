/**
 * WordManager
 * Handles word selection, validation, and guess matching
 */

const GAME_CONFIG = require('../config/gameConfig');

class WordManager {
    constructor() {
        // Word bank categorized by difficulty
        this.wordBank = {
            easy: [
                'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star',
                'book', 'chair', 'table', 'phone', 'apple', 'banana', 'pizza',
                'ball', 'fish', 'bird', 'flower', 'cloud', 'rain', 'snow'
            ],
            medium: [
                'elephant', 'guitar', 'mountain', 'rainbow', 'butterfly', 'umbrella',
                'computer', 'bicycle', 'camera', 'rocket', 'castle', 'dragon',
                'penguin', 'volcano', 'lighthouse', 'treasure', 'dinosaur', 'robot'
            ],
            hard: [
                'astronaut', 'helicopter', 'microscope', 'telescope', 'pyramid',
                'skyscraper', 'submarine', 'parachute', 'chandelier', 'saxophone',
                'trampoline', 'windmill', 'scarecrow', 'octopus', 'kangaroo'
            ]
        };
    }

    /**
     * Get random word options for the drawer
     * @param {number} count - Number of word options to return
     * @returns {string[]} Array of random words
     */
    getWordOptions(count = GAME_CONFIG.WORD_OPTIONS_COUNT) {
        const allWords = [
            ...this.wordBank.easy,
            ...this.wordBank.medium,
            ...this.wordBank.hard
        ];

        const options = [];
        const usedIndices = new Set();

        while (options.length < count && options.length < allWords.length) {
            const randomIndex = Math.floor(Math.random() * allWords.length);

            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                options.push(allWords[randomIndex]);
            }
        }

        return options;
    }

    /**
     * Validate if a guess matches the current word
     * @param {string} guess - Player's guess
     * @param {string} correctWord - The correct word
     * @returns {boolean} True if guess is correct
     */
    validateGuess(guess, correctWord) {
        if (!guess || !correctWord) return false;

        // Normalize both strings: lowercase, trim whitespace
        const normalizedGuess = guess.toLowerCase().trim();
        const normalizedWord = correctWord.toLowerCase().trim();

        return normalizedGuess === normalizedWord;
    }

    /**
     * Check if guess is close to the correct word (for future hint system)
     * @param {string} guess - Player's guess
     * @param {string} correctWord - The correct word
     * @returns {boolean} True if guess is close
     */
    isCloseGuess(guess, correctWord) {
        if (!guess || !correctWord) return false;

        const normalizedGuess = guess.toLowerCase().trim();
        const normalizedWord = correctWord.toLowerCase().trim();

        // Check if guess contains the word or vice versa
        return normalizedGuess.includes(normalizedWord) ||
            normalizedWord.includes(normalizedGuess);
    }

    /**
     * Generate hint for the current word (for future use)
     * @param {string} word - The word to generate hint for
     * @param {number} revealCount - Number of letters to reveal
     * @returns {string} Hint string with some letters revealed
     */
    generateHint(word, revealCount = 1) {
        if (!word) return '';

        const wordArray = word.split('');
        const revealIndices = new Set();

        // Randomly select indices to reveal
        while (revealIndices.size < Math.min(revealCount, word.length)) {
            const randomIndex = Math.floor(Math.random() * word.length);
            revealIndices.add(randomIndex);
        }

        // Create hint with underscores and revealed letters
        return wordArray.map((char, index) => {
            if (char === ' ') return ' ';
            return revealIndices.has(index) ? char : '_';
        }).join(' ');
    }

    /**
     * Get word length hint
     * @param {string} word - The word
     * @returns {string} Hint showing word length
     */
    getWordLengthHint(word) {
        if (!word) return '';
        return word.split('').map(char => char === ' ' ? ' ' : '_').join(' ');
    }
}

module.exports = new WordManager();

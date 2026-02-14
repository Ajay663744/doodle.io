/**
 * Game Configuration
 * Contains all game-related constants and settings
 */

const GAME_CONFIG = {
    // Timer settings
    ROUND_DURATION: 60, // seconds
    TIMER_BROADCAST_INTERVAL: 1000, // milliseconds (1 second)

    // Game rules
    MIN_PLAYERS_TO_START: 2,
    MAX_PLAYERS_PER_ROOM: 8,
    TOTAL_ROUNDS: 3, // Total rounds before game ends (each player draws once per round)

    // Scoring system
    POINTS: {
        // Guesser scoring (time-decay based)
        MAX_GUESSER_POINTS: 100, // Maximum points for first correct guess
        MIN_GUESSER_POINTS: 20,  // Minimum points for late guesses
        TIME_DECAY_FACTOR: 2,    // Points lost per second after first guess

        // Drawer scoring (proportional based)
        DRAWER_BASE: 100,        // Base points for drawer (multiplied by participation rate)

        // Legacy support
        GUESSER_FIRST: 100,      // Kept for backward compatibility
        GUESSER_SECOND: 80,
        GUESSER_THIRD: 60,
        GUESSER_DEFAULT: 40,
        TIME_BONUS_MULTIPLIER: 0.5
    },

    // Game status enums
    GAME_STATUS: {
        WAITING: 'waiting',
        PLAYING: 'playing',
        ROUND_END: 'round_end',
        GAME_END: 'game_end'
    },

    // Word selection
    WORD_OPTIONS_COUNT: 3,

    // Cleanup settings
    INACTIVE_GAME_TIMEOUT: 300000 // 5 minutes in milliseconds
};

module.exports = GAME_CONFIG;

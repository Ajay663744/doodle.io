/**
 * TimerManager
 * Manages round timers for all active games
 */

const GAME_CONFIG = require('../config/gameConfig');

class TimerManager {
    constructor() {
        // Store active timers: roomId -> { interval, timeRemaining, callbacks }
        this.timers = new Map();
    }

    /**
     * Start a timer for a room
     * @param {string} roomId - Room ID
     * @param {number} duration - Timer duration in seconds
     * @param {function} onTick - Callback on each second (receives timeRemaining)
     * @param {function} onComplete - Callback when timer completes
     */
    startTimer(roomId, duration = GAME_CONFIG.ROUND_DURATION, onTick, onComplete) {
        // Clear existing timer if any
        this.clearTimer(roomId);

        let timeRemaining = duration;

        // Create interval
        const interval = setInterval(() => {
            timeRemaining--;

            // Call tick callback
            if (onTick && typeof onTick === 'function') {
                onTick(timeRemaining);
            }

            // Check if timer completed
            if (timeRemaining <= 0) {
                this.clearTimer(roomId);

                // Call completion callback
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }, GAME_CONFIG.TIMER_BROADCAST_INTERVAL);

        // Store timer info
        this.timers.set(roomId, {
            interval,
            timeRemaining,
            startTime: Date.now(),
            duration,
            onTick,
            onComplete
        });

        console.log(`⏱️  Timer started for room ${roomId}: ${duration} seconds`);
    }

    /**
     * Clear/stop a timer for a room
     * @param {string} roomId - Room ID
     */
    clearTimer(roomId) {
        const timer = this.timers.get(roomId);

        if (timer) {
            clearInterval(timer.interval);
            this.timers.delete(roomId);
            console.log(`⏱️  Timer cleared for room ${roomId}`);
        }
    }

    /**
     * Get remaining time for a room
     * @param {string} roomId - Room ID
     * @returns {number|null} Time remaining in seconds, or null if no timer
     */
    getTimeRemaining(roomId) {
        const timer = this.timers.get(roomId);
        return timer ? timer.timeRemaining : null;
    }

    /**
     * Check if a timer is active for a room
     * @param {string} roomId - Room ID
     * @returns {boolean} True if timer is active
     */
    isTimerActive(roomId) {
        return this.timers.has(roomId);
    }

    /**
     * Pause a timer (for future use)
     * @param {string} roomId - Room ID
     */
    pauseTimer(roomId) {
        const timer = this.timers.get(roomId);

        if (timer && timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
            console.log(`⏸️  Timer paused for room ${roomId}`);
        }
    }

    /**
     * Resume a paused timer (for future use)
     * @param {string} roomId - Room ID
     */
    resumeTimer(roomId) {
        const timer = this.timers.get(roomId);

        if (timer && !timer.interval) {
            const interval = setInterval(() => {
                timer.timeRemaining--;

                if (timer.onTick) {
                    timer.onTick(timer.timeRemaining);
                }

                if (timer.timeRemaining <= 0) {
                    this.clearTimer(roomId);
                    if (timer.onComplete) {
                        timer.onComplete();
                    }
                }
            }, GAME_CONFIG.TIMER_BROADCAST_INTERVAL);

            timer.interval = interval;
            console.log(`▶️  Timer resumed for room ${roomId}`);
        }
    }

    /**
     * Clear all timers (cleanup)
     */
    clearAllTimers() {
        this.timers.forEach((timer, roomId) => {
            this.clearTimer(roomId);
        });
        console.log('🧹 All timers cleared');
    }

    /**
     * Get all active timer room IDs
     * @returns {string[]} Array of room IDs with active timers
     */
    getActiveTimerRooms() {
        return Array.from(this.timers.keys());
    }
}

module.exports = new TimerManager();

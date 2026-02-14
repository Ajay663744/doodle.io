/**
 * TEST HELPER - Socket.io Client Test Script
 * 
 * This file provides example code for testing the game engine
 * using socket.io-client in Node.js or browser console
 * 
 * USAGE:
 * 1. Install socket.io-client: npm install socket.io-client
 * 2. Run this script: node TEST_CLIENT.js
 * OR copy functions into browser console
 */

// For Node.js testing
// const io = require('socket.io-client');
// const socket = io('http://localhost:5000');

// For browser console testing
// const socket = io('http://localhost:5000');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a test player
 */
function createPlayer(roomId, userId, username) {
    const socket = io('http://localhost:5000');

    // Join game room
    socket.emit('join_game_room', { roomId, userId, username });

    // Listen to all events
    socket.on('game_state_update', (data) => {
        console.log(`[${username}] Game state updated:`, data.gameState);
    });

    socket.on('player_joined_game', (data) => {
        console.log(`[${username}] Player joined:`, data.player.username);
    });

    socket.on('game_started', (data) => {
        console.log(`[${username}] 🎮 Game started!`, data);
    });

    socket.on('word_options', (data) => {
        console.log(`[${username}] 📝 Word options:`, data.options);
        // Auto-select first word for testing
        socket.emit('select_word', {
            roomId,
            userId,
            word: data.options[0]
        });
    });

    socket.on('turn_started', (data) => {
        console.log(`[${username}] 🎨 Turn started! Drawer: ${data.drawer.username}, Hint: ${data.wordHint}`);
    });

    socket.on('timer_update', (data) => {
        console.log(`[${username}] ⏱️  Time: ${data.timeRemaining}s`);
    });

    socket.on('correct_guess', (data) => {
        console.log(`[${username}] ✅ ${data.username} guessed correctly! +${data.points} points`);
    });

    socket.on('player_guess', (data) => {
        console.log(`[${username}] 💬 ${data.username}: ${data.guess}`);
    });

    socket.on('round_ended', (data) => {
        console.log(`[${username}] 🏁 Round ended! Word was: ${data.correctWord}`);
        console.log(`[${username}] Scores:`, data.scores);
    });

    socket.on('game_error', (data) => {
        console.error(`[${username}] ❌ Error:`, data.message);
    });

    return socket;
}

// ============================================
// TEST SCENARIOS
// ============================================

/**
 * Test Scenario 1: Basic Game Flow
 */
function testBasicGameFlow() {
    console.log('🧪 Testing Basic Game Flow...\n');

    const roomId = 'test-room-' + Date.now();

    // Create 3 players
    const alice = createPlayer(roomId, 'user1', 'Alice');
    const bob = createPlayer(roomId, 'user2', 'Bob');
    const charlie = createPlayer(roomId, 'user3', 'Charlie');

    // Wait for all to join, then start game
    setTimeout(() => {
        console.log('\n🚀 Starting game...\n');
        alice.emit('start_game', { roomId, userId: 'user1' });
    }, 2000);

    // Bob guesses after 5 seconds
    setTimeout(() => {
        console.log('\n💭 Bob is guessing...\n');
        bob.emit('send_guess', {
            roomId,
            userId: 'user2',
            username: 'Bob',
            guess: 'elephant' // Change this based on word options
        });
    }, 7000);

    return { alice, bob, charlie };
}

/**
 * Test Scenario 2: Quick Guess Test
 */
function testQuickGuess(roomId, word) {
    const socket = io('http://localhost:5000');

    socket.emit('join_game_room', {
        roomId,
        userId: 'tester-' + Date.now(),
        username: 'Tester'
    });

    setTimeout(() => {
        socket.emit('send_guess', {
            roomId,
            userId: 'tester-' + Date.now(),
            username: 'Tester',
            guess: word
        });
    }, 1000);

    return socket;
}

/**
 * Test Scenario 3: Host Controls
 */
function testHostControls() {
    const roomId = 'host-test-' + Date.now();
    const socket = io('http://localhost:5000');

    // Join as host
    socket.emit('join_game_room', {
        roomId,
        userId: 'host1',
        username: 'Host'
    });

    // Listen for word options
    socket.on('word_options', (data) => {
        console.log('📝 Received word options:', data.options);
        console.log('Select a word by calling:');
        console.log(`socket.emit('select_word', { roomId: '${roomId}', userId: 'host1', word: '${data.options[0]}' })`);
    });

    // Start game after 2 seconds
    setTimeout(() => {
        socket.emit('start_game', { roomId, userId: 'host1' });
    }, 2000);

    return socket;
}

// ============================================
// MANUAL TESTING COMMANDS
// ============================================

/*
// Copy these into browser console for manual testing:

// 1. Connect to server
const socket = io('http://localhost:5000');

// 2. Join a room
socket.emit('join_game_room', {
    roomId: 'my-room',
    userId: 'user123',
    username: 'YourName'
});

// 3. Start game (if you're host)
socket.emit('start_game', {
    roomId: 'my-room',
    userId: 'user123'
});

// 4. Select word (when you receive word_options event)
socket.emit('select_word', {
    roomId: 'my-room',
    userId: 'user123',
    word: 'elephant'
});

// 5. Send a guess
socket.emit('send_guess', {
    roomId: 'my-room',
    userId: 'user123',
    username: 'YourName',
    guess: 'elephant'
});

// 6. Listen to all events
socket.onAny((eventName, ...args) => {
    console.log(`📡 Event: ${eventName}`, args);
});
*/

// ============================================
// EXPORT FOR NODE.JS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createPlayer,
        testBasicGameFlow,
        testQuickGuess,
        testHostControls
    };
}

// ============================================
// AUTO-RUN TEST (uncomment to run)
// ============================================

// testBasicGameFlow();

/**
 * GAME STATE STRUCTURE EXAMPLE
 * 
 * This file demonstrates the structure of a game state object
 * and provides examples of how the game state changes throughout gameplay
 */

// ============================================
// EXAMPLE 1: Initial Game State (Waiting)
// ============================================
const gameStateWaiting = {
    roomId: "room_abc123",
    players: [
        {
            socketId: "socket_player1",
            userId: "user_001",
            username: "Alice",
            isHost: true
        },
        {
            socketId: "socket_player2",
            userId: "user_002",
            username: "Bob",
            isHost: false
        },
        {
            socketId: "socket_player3",
            userId: "user_003",
            username: "Charlie",
            isHost: false
        }
    ],
    currentDrawerIndex: -1,
    currentDrawerSocketId: null,
    currentWord: null,
    wordOptions: [],
    roundNumber: 0,
    roundTimeRemaining: 60,
    gameStatus: "waiting", // waiting | playing | round_end | game_end
    scores: {
        "user_001": 0,
        "user_002": 0,
        "user_003": 0
    },
    guessedPlayers: [],
    createdAt: new Date("2026-02-10T19:00:00Z"),
    lastActivity: new Date("2026-02-10T19:00:00Z")
};

// ============================================
// EXAMPLE 2: Game Started (Playing - Word Selection)
// ============================================
const gameStateWordSelection = {
    roomId: "room_abc123",
    players: [
        {
            socketId: "socket_player1",
            userId: "user_001",
            username: "Alice",
            isHost: true
        },
        {
            socketId: "socket_player2",
            userId: "user_002",
            username: "Bob",
            isHost: false
        },
        {
            socketId: "socket_player3",
            userId: "user_003",
            username: "Charlie",
            isHost: false
        }
    ],
    currentDrawerIndex: 0, // Alice is drawing
    currentDrawerSocketId: "socket_player1",
    currentWord: null, // Not selected yet
    wordOptions: ["elephant", "guitar", "rainbow"], // Only Alice sees these
    roundNumber: 1,
    roundTimeRemaining: 60,
    gameStatus: "playing",
    scores: {
        "user_001": 0,
        "user_002": 0,
        "user_003": 0
    },
    guessedPlayers: [],
    createdAt: new Date("2026-02-10T19:00:00Z"),
    lastActivity: new Date("2026-02-10T19:01:00Z")
};

// ============================================
// EXAMPLE 3: Round In Progress
// ============================================
const gameStateRoundInProgress = {
    roomId: "room_abc123",
    players: [
        {
            socketId: "socket_player1",
            userId: "user_001",
            username: "Alice",
            isHost: true
        },
        {
            socketId: "socket_player2",
            userId: "user_002",
            username: "Bob",
            isHost: false
        },
        {
            socketId: "socket_player3",
            userId: "user_003",
            username: "Charlie",
            isHost: false
        }
    ],
    currentDrawerIndex: 0,
    currentDrawerSocketId: "socket_player1",
    currentWord: "elephant", // Alice selected this word
    wordOptions: [], // Cleared after selection
    roundNumber: 1,
    roundTimeRemaining: 45, // Timer counting down
    gameStatus: "playing",
    scores: {
        "user_001": 50, // Alice got points when Bob guessed
        "user_002": 100, // Bob guessed first
        "user_003": 0
    },
    guessedPlayers: ["user_002"], // Bob guessed correctly
    createdAt: new Date("2026-02-10T19:00:00Z"),
    lastActivity: new Date("2026-02-10T19:01:30Z")
};

// ============================================
// EXAMPLE 4: Round Ended
// ============================================
const gameStateRoundEnd = {
    roomId: "room_abc123",
    players: [
        {
            socketId: "socket_player1",
            userId: "user_001",
            username: "Alice",
            isHost: true
        },
        {
            socketId: "socket_player2",
            userId: "user_002",
            username: "Bob",
            isHost: false
        },
        {
            socketId: "socket_player3",
            userId: "user_003",
            username: "Charlie",
            isHost: false
        }
    ],
    currentDrawerIndex: 0,
    currentDrawerSocketId: "socket_player1",
    currentWord: "elephant",
    wordOptions: [],
    roundNumber: 1,
    roundTimeRemaining: 0, // Timer expired
    gameStatus: "round_end",
    scores: {
        "user_001": 100, // Alice got points for both guessers
        "user_002": 100, // Bob guessed first
        "user_003": 80  // Charlie guessed second
    },
    guessedPlayers: ["user_002", "user_003"],
    createdAt: new Date("2026-02-10T19:00:00Z"),
    lastActivity: new Date("2026-02-10T19:02:00Z")
};

// ============================================
// EXAMPLE 5: Next Round Started (Bob's Turn)
// ============================================
const gameStateNextRound = {
    roomId: "room_abc123",
    players: [
        {
            socketId: "socket_player1",
            userId: "user_001",
            username: "Alice",
            isHost: true
        },
        {
            socketId: "socket_player2",
            userId: "user_002",
            username: "Bob",
            isHost: false
        },
        {
            socketId: "socket_player3",
            userId: "user_003",
            username: "Charlie",
            isHost: false
        }
    ],
    currentDrawerIndex: 1, // Bob's turn now (round-robin)
    currentDrawerSocketId: "socket_player2",
    currentWord: null,
    wordOptions: ["mountain", "bicycle", "castle"], // Bob's word options
    roundNumber: 1, // Still round 1 (will increment after all players draw)
    roundTimeRemaining: 60,
    gameStatus: "playing",
    scores: {
        "user_001": 100,
        "user_002": 100,
        "user_003": 80
    },
    guessedPlayers: [], // Reset for new round
    createdAt: new Date("2026-02-10T19:00:00Z"),
    lastActivity: new Date("2026-02-10T19:02:05Z")
};

// ============================================
// SOCKET EVENT EXAMPLES
// ============================================

/*
CLIENT → SERVER EVENTS:

1. join_game_room
   Payload: { roomId: "room_abc123", userId: "user_001", username: "Alice" }

2. start_game
   Payload: { roomId: "room_abc123", userId: "user_001" }

3. select_word
   Payload: { roomId: "room_abc123", userId: "user_001", word: "elephant" }

4. send_guess
   Payload: { roomId: "room_abc123", userId: "user_002", username: "Bob", guess: "elephant" }

5. leave_game_room
   Payload: { roomId: "room_abc123", userId: "user_001" }
*/

/*
SERVER → CLIENT EVENTS:

1. game_state_update
   Payload: { gameState: { ...sanitizedGameState } }

2. player_joined_game
   Payload: { player: { userId, username, socketId }, playerCount: 3 }

3. game_started
   Payload: { gameState: { ...sanitizedGameState }, message: "Game has started!" }

4. word_options (sent only to drawer)
   Payload: { options: ["elephant", "guitar", "rainbow"], roundNumber: 1 }

5. turn_started
   Payload: { drawer: { userId, username }, wordHint: "_ _ _ _ _ _ _ _", roundNumber: 1, roundDuration: 60 }

6. timer_update
   Payload: { timeRemaining: 45 }

7. correct_guess
   Payload: { userId: "user_002", username: "Bob", points: 100, guessPosition: 1 }

8. player_guess (incorrect guess shown as chat)
   Payload: { userId: "user_003", username: "Charlie", guess: "tiger", isCorrect: false }

9. round_ended
   Payload: { correctWord: "elephant", scores: {...}, guessedPlayers: [...], drawer: {...} }

10. player_left_game
    Payload: { userId: "user_001", playerCount: 2 }

11. game_error
    Payload: { message: "Error message here" }
*/

// ============================================
// SCORING SYSTEM
// ============================================

/*
POINTS CONFIGURATION:

Drawer Points:
- Base: 50 points per player who guesses correctly

Guesser Points:
- 1st to guess: 100 points + time bonus
- 2nd to guess: 80 points + time bonus
- 3rd to guess: 60 points + time bonus
- 4th+ to guess: 40 points + time bonus

Time Bonus:
- timeRemaining * 0.5
- Example: If 45 seconds remaining, bonus = 22 points
*/

module.exports = {
    gameStateWaiting,
    gameStateWordSelection,
    gameStateRoundInProgress,
    gameStateRoundEnd,
    gameStateNextRound
};

# Backend Game State Manager - Quick Reference

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── gameConfig.js          # Game constants and settings
│   ├── game/
│   │   ├── GameStateManager.js    # Core game state management
│   │   ├── TurnManager.js         # Round-robin turn system
│   │   ├── TimerManager.js        # Round timer management
│   │   ├── WordManager.js         # Word selection & validation
│   │   └── GAME_STATE_EXAMPLES.js # Example game states
│   └── sockets/
│       ├── gameSocketHandler.js   # Game socket events
│       └── socketHandler.js       # Main socket handler (updated)
```

## 🎮 Socket Events Reference

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_game_room` | `{ roomId, userId, username }` | Join game room |
| `start_game` | `{ roomId, userId }` | Start game (host only) |
| `select_word` | `{ roomId, userId, word }` | Select word (drawer only) |
| `send_guess` | `{ roomId, userId, username, guess }` | Submit guess |
| `leave_game_room` | `{ roomId, userId }` | Leave game |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `game_state_update` | `{ gameState }` | Game state changed |
| `player_joined_game` | `{ player, playerCount }` | Player joined |
| `game_started` | `{ gameState, message }` | Game began |
| `word_options` | `{ options, roundNumber }` | 3 words (drawer only) |
| `turn_started` | `{ drawer, wordHint, roundNumber, roundDuration }` | Round started |
| `timer_update` | `{ timeRemaining }` | Timer tick (every 1s) |
| `correct_guess` | `{ userId, username, points, guessPosition }` | Correct guess |
| `player_guess` | `{ userId, username, guess, isCorrect }` | Guess (chat) |
| `round_ended` | `{ correctWord, scores, guessedPlayers, drawer }` | Round finished |
| `player_left_game` | `{ userId, playerCount }` | Player left |
| `game_error` | `{ message }` | Error occurred |

## 🔧 Key Functions

### GameStateManager
```javascript
const GameStateManager = require('./src/game/GameStateManager');

// Create game
GameStateManager.createGame(roomId, players);

// Get game state
const gameState = GameStateManager.getGame(roomId);

// Add/remove players
GameStateManager.addPlayer(roomId, { socketId, userId, username });
GameStateManager.removePlayer(roomId, socketId);

// Game flow
GameStateManager.startGame(roomId);
GameStateManager.startNewRound(roomId);
GameStateManager.endRound(roomId);

// Scoring
GameStateManager.recordCorrectGuess(roomId, userId, timeRemaining);
```

### TimerManager
```javascript
const TimerManager = require('./src/game/TimerManager');

// Start timer
TimerManager.startTimer(roomId, duration, onTick, onComplete);

// Clear timer
TimerManager.clearTimer(roomId);

// Get time
const time = TimerManager.getTimeRemaining(roomId);
```

### WordManager
```javascript
const WordManager = require('./src/game/WordManager');

// Get word options
const words = WordManager.getWordOptions(3); // Returns 3 random words

// Validate guess
const isCorrect = WordManager.validateGuess(guess, correctWord);

// Get hint
const hint = WordManager.getWordLengthHint(word); // "_ _ _ _ _ _ _ _"
```

## 🎯 Game Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. WAITING                                                  │
│    Players join → Host starts game                          │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. WORD SELECTION                                           │
│    Send 3 words to drawer → Drawer selects word            │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PLAYING                                                  │
│    Timer starts (60s) → Players guess → Award points       │
│    Conditions to end:                                       │
│    - All guessers guessed correctly                         │
│    - Timer expired (0s)                                     │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ROUND END                                                │
│    Show results → 5 second delay → Next round              │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
                Back to step 2 (next drawer in round-robin)
```

## 📊 Scoring Reference

| Position | Points | Time Bonus |
|----------|--------|------------|
| Drawer | 50 per correct guess | - |
| 1st Guesser | 100 | ✓ |
| 2nd Guesser | 80 | ✓ |
| 3rd Guesser | 60 | ✓ |
| 4th+ Guesser | 40 | ✓ |

**Time Bonus Formula:** `timeRemaining × 0.5`

## 🚀 Quick Start

1. **Start server:**
```bash
cd backend
npm run dev
```

2. **Test with Socket.io client:**
```javascript
const socket = io('http://localhost:5000');

// Join game
socket.emit('join_game_room', {
  roomId: 'test-room',
  userId: 'user1',
  username: 'Alice'
});

// Listen for events
socket.on('game_started', (data) => console.log('Game started!', data));
socket.on('timer_update', (data) => console.log('Time:', data.timeRemaining));
```

## 📝 Configuration

Edit `src/config/gameConfig.js` to customize:
- Round duration (default: 60s)
- Minimum players (default: 2)
- Points system
- Timer interval

## 🔒 Security Features

✅ Word hidden from non-drawers  
✅ Only drawer can select words  
✅ Only host can start game  
✅ Drawer cannot submit guesses  
✅ Duplicate guess prevention  

---

**Status:** ✅ Production Ready  
**Next Step:** Build frontend UI to connect to these socket events

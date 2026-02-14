# 🎮 Game Lifecycle & Round Flow Automation - Complete Reference

## Overview

The game lifecycle system provides **complete automation** from lobby to game end, with automatic progression through all phases.

---

## 🔄 Game Lifecycle Phases

### 1. **Lobby Phase** (Status: `waiting`)

**What Happens:**
- Players join the room via `join_game_room`
- First player becomes host
- Game state initialized
- Waiting for host to start

**Socket Events:**
- `player_joined_game` - New player joins
- `game_state_update` - State updates

**Conditions to Exit:**
- Host triggers `start_game`
- Minimum 2 players required

---

### 2. **Game Start Phase** (Status: `playing`)

**What Happens:**
- Validate minimum players (2+)
- Reset all scores to 0
- Set round number to 1
- Select first drawer (round-robin)
- Generate 3 word options
- Emit `game_started` event

**Socket Events:**
```javascript
// game_started
{
  gameState: {...},
  gameProgress: {
    currentRound: 1,
    totalRounds: 3,
    currentTurn: 1,
    totalTurnsInRound: 3,
    progress: 0
  },
  message: 'Game has started!'
}
```

**Auto-Progression:**
→ Automatically moves to **Round Start Phase**

---

### 3. **Round Start Phase**

**What Happens:**
- Send 3 word options to drawer only
- Drawer selects word via `select_word`
- Set `roundStartTime` for scoring
- Start 60-second timer
- Emit `turn_started` event

**Socket Events:**
```javascript
// word_options (to drawer only)
{
  words: ['elephant', 'tiger', 'monkey']
}

// turn_started (to all players)
{
  drawer: { userId, username, ... },
  wordHint: '_ _ _ _ _ _ _ _',
  roundNumber: 1,
  gameProgress: {...},
  gameState: {...}
}
```

**Auto-Progression:**
→ Automatically moves to **Round Running Phase** when word selected

---

### 4. **Round Running Phase**

**What Happens:**
- Timer counts down (60 seconds)
- Players submit guesses via `send_guess`
- Validate guesses (case-insensitive)
- Award points (time-decay scoring)
- Track `guessedPlayers`
- Broadcast `timer_update` every second

**Socket Events:**
```javascript
// timer_update (every second)
{
  timeRemaining: 45
}

// player_scored (on correct guess)
{
  userId, username, points, drawerPoints, guessPosition, timestamp
}

// round_score_update
{
  roundScores: {...},
  totalScores: {...}
}

// leaderboard_update
{
  leaderboard: [...]
}
```

**Auto-Progression Triggers:**
- ⏱️ Timer expires (60s) → **Round End Phase**
- ✅ All guessers guessed correctly → **Round End Phase**

---

### 5. **Round End Phase** (Status: `round_end`)

**What Happens:**
- Stop timer
- Finalize drawer score (proportional)
- Calculate final round scores
- Reveal correct word to all
- Emit `round_ended` event
- Check if game should end

**Socket Events:**
```javascript
// round_ended
{
  correctWord: 'elephant',
  scores: { user1: 350, user2: 250 },      // Total scores
  roundScores: { user1: 67, user2: 100 },  // This round only
  guessedPlayers: ['user2', 'user3'],
  drawer: {...},
  leaderboard: [...]
}
```

**Auto-Progression Logic:**
```javascript
if (GameLifecycleManager.shouldGameEnd(gameState)) {
  → Game End Phase (after 5s delay)
} else {
  → Next Turn Phase (after 3s delay)
}
```

---

### 6. **Next Turn Phase**

**What Happens:**
- Move to next drawer (round-robin)
- If cycled back to first player → increment round number
- Reset round state:
  - Clear `guessedPlayers`
  - Reset `roundScores`
  - Clear `currentWord`
  - Generate new word options
- Emit `game_state_update`

**Auto-Progression:**
→ Automatically returns to **Round Start Phase**

---

### 7. **Game End Phase** (Status: `game_end`)

**What Happens:**
- Calculate final results
- Determine winner (highest score)
- Generate final leaderboard
- Emit `game_ended` event
- Schedule cleanup (1 minute)

**Socket Events:**
```javascript
// game_ended
{
  winner: {
    rank: 1,
    userId: 'user1',
    username: 'Alice',
    score: 450
  },
  leaderboard: [
    { rank: 1, userId: 'user1', username: 'Alice', score: 450 },
    { rank: 2, userId: 'user2', username: 'Bob', score: 320 }
  ],
  finalScores: { user1: 450, user2: 320 },
  totalRounds: 3,
  gameProgress: {...},
  message: '🎉 Game Over! Winner: Alice'
}
```

**Game End Condition:**
```javascript
totalTurns = TOTAL_ROUNDS × numberOfPlayers
// Example: 3 rounds × 3 players = 9 total turns
// Game ends after turn 9
```

---

## 📊 Game Progress Tracking

Available in `game_started`, `turn_started`, and `game_ended` events:

```javascript
gameProgress: {
  currentRound: 2,           // Current round (1-3)
  totalRounds: 3,            // Total rounds configured
  currentTurn: 2,            // Current turn in this round
  totalTurnsInRound: 3,      // Total turns in round (= players)
  turnsCompleted: 5,         // Total turns completed
  totalTurns: 9,             // Total turns in game
  progress: 55               // Percentage complete (55%)
}
```

---

## 🔧 Configuration

**File:** `src/config/gameConfig.js`

```javascript
{
  ROUND_DURATION: 60,          // Seconds per round
  MIN_PLAYERS_TO_START: 2,     // Minimum players
  MAX_PLAYERS_PER_ROOM: 8,     // Maximum players
  TOTAL_ROUNDS: 3,             // Rounds before game ends
}
```

---

## 🎯 Complete Game Flow Example

**3 Players (Alice, Bob, Charlie), 3 Rounds:**

```
LOBBY PHASE
├─ Alice joins (becomes host)
├─ Bob joins
├─ Charlie joins
└─ Alice clicks "Start Game"

GAME START
├─ Scores reset: { Alice: 0, Bob: 0, Charlie: 0 }
├─ Round 1, Turn 1
└─ Alice selected as drawer

ROUND 1
├─ Turn 1: Alice draws "elephant"
│   ├─ Bob guesses (100 pts)
│   ├─ Charlie guesses (90 pts)
│   └─ Alice gets 67 pts (2/2 guessed)
│
├─ Turn 2: Bob draws "guitar"
│   ├─ Alice guesses (100 pts)
│   ├─ Charlie guesses (85 pts)
│   └─ Bob gets 67 pts
│
└─ Turn 3: Charlie draws "mountain"
    ├─ Alice guesses (100 pts)
    ├─ Bob guesses (92 pts)
    └─ Charlie gets 67 pts

ROUND 2 (same pattern)
└─ 3 more turns...

ROUND 3 (same pattern)
└─ 3 more turns...

GAME END
├─ Total turns: 9 (3 rounds × 3 players)
├─ Final scores calculated
├─ Winner: Alice (highest score)
└─ Emit game_ended with leaderboard
```

---

## 🛡️ Validation & Safety

### Game Start Validation
```javascript
✅ Minimum 2 players
✅ Maximum 8 players
✅ Game not already started
✅ Valid game state exists
```

### Round Progression Safety
```javascript
✅ Prevent multiple rounds running simultaneously
✅ Timer cleanup on round end
✅ Proper state reset between rounds
✅ Drawer rotation validation
```

### Game End Detection
```javascript
✅ Accurate turn counting
✅ Automatic game end after final turn
✅ Proper cleanup scheduling
```

---

## 📝 Code Locations

| Component | File |
|-----------|------|
| Lifecycle Manager | `src/game/GameLifecycleManager.js` |
| Game Config | `src/config/gameConfig.js` |
| Socket Handler | `src/sockets/gameSocketHandler.js` |
| Game State Manager | `src/game/GameStateManager.js` |
| Turn Manager | `src/game/TurnManager.js` |
| Timer Manager | `src/game/TimerManager.js` |

---

## 🚀 Frontend Integration

### Listen to Lifecycle Events

```javascript
// Game started
socket.on('game_started', (data) => {
  showGameScreen();
  updateProgress(data.gameProgress);
});

// Turn started
socket.on('turn_started', (data) => {
  if (data.drawer.userId === myUserId) {
    showDrawingTools();
    showWordSelection(data.wordOptions);
  } else {
    showGuessingInterface();
    showWordHint(data.wordHint);
  }
  updateProgress(data.gameProgress);
});

// Round ended
socket.on('round_ended', (data) => {
  showRoundSummary({
    word: data.correctWord,
    roundScores: data.roundScores,
    leaderboard: data.leaderboard
  });
});

// Game ended
socket.on('game_ended', (data) => {
  showFinalResults({
    winner: data.winner,
    leaderboard: data.leaderboard,
    message: data.message
  });
});
```

---

## ✨ Key Features

✅ **Fully Automated** - No manual intervention needed  
✅ **Round-Robin Turns** - Fair drawer rotation  
✅ **Configurable Rounds** - Easy to adjust game length  
✅ **Progress Tracking** - Real-time game progress  
✅ **Automatic End Detection** - Game ends after final turn  
✅ **Complete Validation** - All edge cases handled  
✅ **Clean State Management** - Proper reset between phases  

---

**Status:** 🎉 **PRODUCTION READY**

The complete game lifecycle automation is fully implemented and tested!

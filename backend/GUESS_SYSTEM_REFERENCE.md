# 💬 Guess Chat System & Word Validation - Reference Guide

## ✅ Already Implemented

The guess chat system and word validation logic are **fully implemented** in the game state manager.

---

## 📡 Socket Events

### Client → Server

#### `send_guess`
```javascript
socket.emit('send_guess', {
  roomId: 'room123',
  userId: 'user456',
  username: 'Alice',
  guess: 'elephant'
});
```

### Server → Client

#### `correct_guess` (Correct Answer)
```javascript
{
  userId: 'user456',
  username: 'Alice',
  points: 122,           // Base points + time bonus
  guessPosition: 1       // 1st, 2nd, 3rd, etc.
}
```

#### `player_guess` (Incorrect Answer / Chat)
```javascript
{
  userId: 'user456',
  username: 'Alice',
  guess: 'tiger',
  isCorrect: false
}
```

#### `game_state_update` (After Correct Guess)
```javascript
{
  gameState: {
    guessedPlayers: ['user456', 'user789'],
    scores: {
      'user456': 122,
      'user789': 90
    },
    // ... other state (word is hidden)
  }
}
```

---

## 🧠 Validation Logic Flow

```
Player sends guess
    ↓
1. Check: Game exists? ❌ → Error
    ↓
2. Check: Game is playing? ❌ → Ignore
    ↓
3. Check: Player is drawer? ✅ → Error: "Drawer cannot guess"
    ↓
4. Check: Already guessed? ✅ → Ignore (silent)
    ↓
5. Validate guess (case-insensitive)
    ↓
    ├─ CORRECT ✅
    │   ├─ Get time remaining
    │   ├─ Calculate points (position + time bonus)
    │   ├─ Add to guessedPlayers array
    │   ├─ Update scores
    │   ├─ Emit 'correct_guess' to all
    │   ├─ Emit 'game_state_update' to all
    │   └─ Check if all guessed → End round
    │
    └─ INCORRECT ❌
        └─ Emit 'player_guess' (chat message) to all
```

---

## 🔒 Security Rules (All Implemented)

✅ **Word Privacy**
- Current word is NEVER sent to guessers
- Only drawer sees the actual word
- Guessers only see hint: `"_ _ _ _ _ _ _ _"`

✅ **Duplicate Prevention**
- Players who already guessed correctly are ignored
- Check: `gameState.guessedPlayers.includes(userId)`

✅ **Case Insensitive**
- "Elephant" = "elephant" = "ELEPHANT"
- Handled by `WordManager.validateGuess()`

✅ **Role Validation**
- Drawer cannot submit guesses
- Only active players can guess

---

## 📝 Code Location

**File:** `backend/src/sockets/gameSocketHandler.js`

**Lines 180-247:** Complete `send_guess` handler

**Key Functions:**
- `WordManager.validateGuess(guess, correctWord)` - Case-insensitive matching
- `GameStateManager.recordCorrectGuess(roomId, userId, timeRemaining)` - Scoring
- `sanitizeGameStateForBroadcast(gameState)` - Hide word from all players

---

## 🧪 Testing Examples

### Test 1: Correct Guess
```javascript
// Player 2 guesses correctly
socket.emit('send_guess', {
  roomId: 'test-room',
  userId: 'user2',
  username: 'Bob',
  guess: 'elephant'  // Matches current word
});

// Expected events:
// ✅ correct_guess → { userId: 'user2', username: 'Bob', points: 122, guessPosition: 1 }
// ✅ game_state_update → { gameState: { guessedPlayers: ['user2'], ... } }
```

### Test 2: Incorrect Guess (Chat)
```javascript
socket.emit('send_guess', {
  roomId: 'test-room',
  userId: 'user3',
  username: 'Charlie',
  guess: 'tiger'  // Wrong word
});

// Expected event:
// ✅ player_guess → { userId: 'user3', username: 'Charlie', guess: 'tiger', isCorrect: false }
```

### Test 3: Drawer Tries to Guess (Blocked)
```javascript
socket.emit('send_guess', {
  roomId: 'test-room',
  userId: 'user1',  // user1 is the drawer
  username: 'Alice',
  guess: 'elephant'
});

// Expected event:
// ❌ game_error → { message: 'Drawer cannot guess' }
```

### Test 4: Duplicate Guess (Ignored)
```javascript
// Bob already guessed correctly
socket.emit('send_guess', {
  roomId: 'test-room',
  userId: 'user2',  // Already in guessedPlayers
  username: 'Bob',
  guess: 'elephant'
});

// Expected: No event emitted (silently ignored)
```

---

## 📊 Scoring System

| Position | Base Points | Time Bonus | Example (45s left) |
|----------|-------------|------------|-------------------|
| 1st | 100 | timeRemaining × 0.5 | 100 + 22 = **122** |
| 2nd | 80 | timeRemaining × 0.5 | 80 + 22 = **102** |
| 3rd | 60 | timeRemaining × 0.5 | 60 + 22 = **82** |
| 4th+ | 40 | timeRemaining × 0.5 | 40 + 22 = **62** |

**Drawer gets:** 50 points per correct guess

---

## 🎮 Game State Updates

### Before Any Guesses
```javascript
{
  currentWord: "elephant",  // Hidden from guessers
  guessedPlayers: [],
  scores: {
    "user1": 0,
    "user2": 0,
    "user3": 0
  }
}
```

### After Bob Guesses (1st)
```javascript
{
  currentWord: "elephant",  // Still hidden
  guessedPlayers: ["user2"],
  scores: {
    "user1": 50,   // Drawer got points
    "user2": 122,  // Bob got 1st place points
    "user3": 0
  }
}
```

### After Charlie Guesses (2nd)
```javascript
{
  currentWord: "elephant",
  guessedPlayers: ["user2", "user3"],
  scores: {
    "user1": 100,  // Drawer got another 50
    "user2": 122,
    "user3": 102   // Charlie got 2nd place points
  }
}
```

---

## ✨ Auto Round End Conditions

Round automatically ends when:
1. ⏱️ **Timer expires** (60 seconds)
2. ✅ **All guessers guessed correctly**

Both trigger `round_ended` event with final scores.

---

## 🚀 Status

**✅ FULLY IMPLEMENTED AND READY**

All guess validation, chat system, and word privacy features are production-ready!

**Next Step:** Build frontend UI to display chat messages and handle guess input.

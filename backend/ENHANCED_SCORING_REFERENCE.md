# 🏆 Enhanced Scoring System - Complete Reference

## Overview

The enhanced scoring system implements:
- **Time-decay scoring** for guessers (faster guesses = more points)
- **Proportional drawer scoring** (based on participation rate)
- **Real-time score tracking** with multiple socket events

---

## 📊 Scoring Formulas

### Guesser Scoring (Time-Decay)

```javascript
points = MAX_POINTS - (timeDifference × DECAY_FACTOR)
points = Math.max(points, MIN_POINTS)
```

**Parameters:**
- `MAX_POINTS` = 100 (first correct guess)
- `MIN_POINTS` = 20 (minimum points)
- `DECAY_FACTOR` = 2 (points lost per second)
- `timeDifference` = seconds since first correct guess

**Examples:**
| Time After First Guess | Points Awarded |
|------------------------|----------------|
| 0s (first guess) | 100 |
| 5s | 90 (100 - 5×2) |
| 10s | 80 (100 - 10×2) |
| 20s | 60 (100 - 20×2) |
| 40s | 20 (capped at minimum) |

### Drawer Scoring (Proportional)

```javascript
drawerPoints = BASE_POINTS × (correctGuesses / totalGuessers)
```

**Parameters:**
- `BASE_POINTS` = 100
- `correctGuesses` = number of players who guessed correctly
- `totalGuessers` = total players minus drawer

**Examples:**
| Correct Guesses | Total Guessers | Participation Rate | Drawer Points |
|-----------------|----------------|-------------------|---------------|
| 3 | 3 | 100% | 100 |
| 2 | 3 | 67% | 67 |
| 1 | 3 | 33% | 33 |
| 0 | 3 | 0% | 0 |

---

## 📡 Socket Events

### 1. `player_scored` (New)
Emitted when a player guesses correctly.

**Payload:**
```javascript
{
  userId: 'user123',
  username: 'Alice',
  points: 90,              // Guesser points awarded
  drawerPoints: 67,        // Current drawer points
  guessPosition: 2,        // 1st, 2nd, 3rd, etc.
  timestamp: 1707582000000 // Guess timestamp
}
```

### 2. `round_score_update` (New)
Emitted after each correct guess.

**Payload:**
```javascript
{
  roundScores: {
    'user1': 100,  // Drawer's current round score
    'user2': 100,  // First guesser
    'user3': 90    // Second guesser
  },
  totalScores: {
    'user1': 350,  // Total game score
    'user2': 250,
    'user3': 180
  }
}
```

### 3. `leaderboard_update` (New)
Emitted after each correct guess.

**Payload:**
```javascript
{
  leaderboard: [
    { rank: 1, userId: 'user1', username: 'Alice', score: 350 },
    { rank: 2, userId: 'user2', username: 'Bob', score: 250 },
    { rank: 3, userId: 'user3', username: 'Charlie', score: 180 }
  ]
}
```

### 4. `round_ended` (Enhanced)
Emitted when round ends, now includes complete scoring.

**Payload:**
```javascript
{
  correctWord: 'elephant',
  scores: {              // Total scores
    'user1': 350,
    'user2': 250,
    'user3': 180
  },
  roundScores: {         // This round's scores
    'user1': 67,
    'user2': 100,
    'user3': 90
  },
  guessedPlayers: ['user2', 'user3'],
  drawer: { userId: 'user1', username: 'Alice', ... },
  leaderboard: [...]     // Final leaderboard
}
```

---

## 🎮 Game State Structure

### New Fields Added

```javascript
{
  // ... existing fields ...
  
  // Enhanced scoring metadata
  firstCorrectGuessTime: 5234,      // ms since round start
  playerGuessTimes: {
    'user2': 5234,                  // First guess at 5.2s
    'user3': 10567                  // Second guess at 10.5s
  },
  roundScores: {
    'user1': 67,                    // Drawer
    'user2': 100,                   // Guesser 1
    'user3': 90                     // Guesser 2
  },
  roundStartTime: 1707582000000     // Timestamp when word selected
}
```

---

## 🔄 Scoring Flow

```
1. Word Selected
   └─ Set roundStartTime

2. First Correct Guess
   ├─ Record firstCorrectGuessTime
   ├─ Calculate points: 100 (max)
   ├─ Emit player_scored
   ├─ Emit round_score_update
   └─ Emit leaderboard_update

3. Second Correct Guess (5s later)
   ├─ Calculate timeDiff: 5s
   ├─ Calculate points: 100 - (5 × 2) = 90
   ├─ Update drawer score: 67% participation
   ├─ Emit player_scored
   ├─ Emit round_score_update
   └─ Emit leaderboard_update

4. Round Ends
   ├─ Finalize drawer score
   ├─ Calculate final leaderboard
   └─ Emit round_ended with complete data
```

---

## 🛡️ Security & Validation

✅ **Prevent Negative Scores**
```javascript
ScoreCalculator.validateScore(score) // Returns Math.max(0, score)
```

✅ **Prevent Duplicate Scoring**
```javascript
if (gameState.guessedPlayers.includes(userId)) {
  return { guesserPoints: 0, drawerPoints: 0 };
}
```

✅ **Case Insensitive Matching**
```javascript
WordManager.validateGuess(guess, correctWord) // Normalizes to lowercase
```

---

## 📝 Code Locations

| Component | File |
|-----------|------|
| Score Calculator | `src/game/ScoreCalculator.js` |
| Game Config | `src/config/gameConfig.js` |
| Game State Manager | `src/game/GameStateManager.js` |
| Socket Handler | `src/sockets/gameSocketHandler.js` |

---

## 🧪 Testing Examples

### Example 1: Time-Decay Scoring

```javascript
// Round starts at t=0
// Word selected: "elephant"

// t=5s: Alice guesses (first)
// Points: 100 (first guess always gets max)

// t=10s: Bob guesses (5s after Alice)
// Points: 100 - (5 × 2) = 90

// t=25s: Charlie guesses (20s after Alice)
// Points: 100 - (20 × 2) = 60
```

### Example 2: Drawer Proportional Scoring

```javascript
// 4 players total: 1 drawer + 3 guessers

// Scenario A: All 3 guessers guess correctly
// Drawer points: 100 × (3/3) = 100

// Scenario B: Only 2 guessers guess correctly
// Drawer points: 100 × (2/3) = 67

// Scenario C: Only 1 guesser guesses correctly
// Drawer points: 100 × (1/3) = 33

// Scenario D: Nobody guesses correctly
// Drawer points: 100 × (0/3) = 0
```

---

## 🚀 Frontend Integration

### Listen to Scoring Events

```javascript
// Player scored
socket.on('player_scored', (data) => {
  console.log(`${data.username} scored ${data.points} points!`);
  showScoreAnimation(data.username, data.points);
});

// Round score update
socket.on('round_score_update', (data) => {
  updateScoreboard(data.roundScores, data.totalScores);
});

// Leaderboard update
socket.on('leaderboard_update', (data) => {
  displayLeaderboard(data.leaderboard);
});

// Round ended
socket.on('round_ended', (data) => {
  showRoundSummary({
    word: data.correctWord,
    roundScores: data.roundScores,
    leaderboard: data.leaderboard
  });
});
```

---

## ✨ Key Features

✅ **Fair Time-Based Scoring** - Rewards faster guesses  
✅ **Proportional Drawer Rewards** - Drawer benefits from good drawings  
✅ **Real-Time Updates** - Instant score feedback  
✅ **Comprehensive Leaderboard** - Always up-to-date rankings  
✅ **Round Score Tracking** - See performance per round  
✅ **No Negative Scores** - All scores validated  
✅ **Duplicate Prevention** - Can't score twice  

---

**Status:** ✅ **PRODUCTION READY**

The enhanced scoring system is fully implemented and ready for frontend integration!

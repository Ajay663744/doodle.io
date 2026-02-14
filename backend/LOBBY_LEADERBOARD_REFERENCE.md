# 🎮 Lobby & Leaderboard System - Complete Reference

## Overview

The lobby and leaderboard system provides player ready status tracking, live leaderboard updates, and comprehensive round result summaries.

---

## 🏁 Lobby Ready System

### Player Status Fields

Each player now has:
```javascript
{
  userId: 'user123',
  username: 'Alice',
  isHost: true,
  isReady: false,           // NEW: Ready status for lobby
  isDrawing: false,         // NEW: Currently drawing
  hasGuessedCorrectly: false // NEW: Guessed correctly this round
}
```

### Socket Events

#### `player_ready_toggle` (Client → Server)
Player toggles their ready status.

**Request:**
```javascript
socket.emit('player_ready_toggle', {
  roomId: 'room123',
  userId: 'user456'
});
```

**Response:**
Emits `lobby_status_update` to all players in room.

---

#### `lobby_status_update` (Server → Client)
Sent when lobby status changes (player joins, ready toggle, etc.).

**Payload:**
```javascript
{
  totalPlayers: 3,
  readyPlayers: 2,
  canStart: true,           // true if enough ready players
  minPlayersRequired: 2,
  gameStatus: 'waiting',
  players: [
    {
      userId: 'user1',
      username: 'Alice',
      isHost: true,
      isReady: true,
      isDrawing: false,
      hasGuessedCorrectly: false
    },
    {
      userId: 'user2',
      username: 'Bob',
      isHost: false,
      isReady: true,
      isDrawing: false,
      hasGuessedCorrectly: false
    },
    {
      userId: 'user3',
      username: 'Charlie',
      isHost: false,
      isReady: false,
      isDrawing: false,
      hasGuessedCorrectly: false
    }
  ]
}
```

---

#### `get_lobby_status` (Client → Server)
Request current lobby status.

**Request:**
```javascript
socket.emit('get_lobby_status', {
  roomId: 'room123'
});
```

**Response:**
Emits `lobby_status_update` to requesting client.

---

## 📊 Live Leaderboard

### When Leaderboard Updates

Leaderboard is emitted in these scenarios:

1. **After correct guess** → `leaderboard_update`
2. **After round ends** → included in `round_ended`
3. **After game ends** → included in `game_ended`

### `leaderboard_update` Event

**Payload:**
```javascript
{
  leaderboard: [
    {
      rank: 1,
      userId: 'user1',
      username: 'Alice',
      score: 450
    },
    {
      rank: 2,
      userId: 'user2',
      username: 'Bob',
      score: 320
    },
    {
      rank: 3,
      userId: 'user3',
      username: 'Charlie',
      score: 180
    }
  ]
}
```

---

## 🎯 Round Result Summary

### `round_result_summary` Event

Emitted after each round ends, provides comprehensive round results.

**Payload:**
```javascript
{
  correctWord: 'elephant',
  drawer: {
    userId: 'user1',
    username: 'Alice',
    points: 67              // Points earned this round
  },
  correctGuessers: [
    {
      userId: 'user2',
      username: 'Bob',
      points: 100           // First guesser
    },
    {
      userId: 'user3',
      username: 'Charlie',
      points: 90            // Second guesser
    }
  ],
  roundScores: {            // Points earned this round only
    'user1': 67,
    'user2': 100,
    'user3': 90
  },
  totalScores: {            // Total game scores
    'user1': 350,
    'user2': 250,
    'user3': 180
  },
  leaderboard: [...],       // Current leaderboard
  roundNumber: 2,
  guessedCount: 2,          // How many guessed correctly
  totalGuessers: 2          // Total guessers (excluding drawer)
}
```

---

## 🔄 Game Flow with Lobby System

### 1. Lobby Phase

```
Players join room
├─ lobby_status_update emitted
├─ Players toggle ready
│   └─ lobby_status_update emitted
└─ Host clicks "Start Game"
    ├─ Validate: canStart === true
    ├─ Reset all isReady to false
    └─ Start game
```

### 2. Round Running

```
Player guesses correctly
├─ Set hasGuessedCorrectly = true
├─ Emit player_scored
├─ Emit round_score_update
└─ Emit leaderboard_update
```

### 3. Round End

```
Round ends
├─ Emit round_ended
├─ Emit round_result_summary
├─ Reset hasGuessedCorrectly for all
└─ Start next round OR end game
```

---

## 🛡️ Validation Rules

### Game Start Validation

```javascript
canStart = readyPlayers >= minPlayersRequired && 
           gameStatus === 'waiting'
```

**Requirements:**
- ✅ Minimum 2 ready players
- ✅ Game status is 'waiting'
- ✅ Not already in progress

### Status Reset Rules

**On Game Start:**
- ✅ Reset all `isReady` to `false`
- ✅ Reset all `hasGuessedCorrectly` to `false`
- ✅ Set drawer's `isDrawing` to `true`

**On Round Start:**
- ✅ Reset all `hasGuessedCorrectly` to `false`
- ✅ Update `isDrawing` for new drawer

---

## 📝 Code Locations

| Component | File |
|-----------|------|
| Lobby Socket Handler | `src/sockets/lobbySocketHandler.js` |
| Game Socket Handler | `src/sockets/gameSocketHandler.js` |
| Game State Manager | `src/game/GameStateManager.js` |

---

## 🚀 Frontend Integration

### Lobby UI

```javascript
// Listen for lobby updates
socket.on('lobby_status_update', (data) => {
  updatePlayerList(data.players);
  updateReadyCount(data.readyPlayers, data.totalPlayers);
  
  // Enable/disable start button
  if (isHost) {
    startButton.disabled = !data.canStart;
  }
});

// Toggle ready status
function toggleReady() {
  socket.emit('player_ready_toggle', {
    roomId: currentRoomId,
    userId: myUserId
  });
}
```

### Live Leaderboard

```javascript
// Update leaderboard in real-time
socket.on('leaderboard_update', (data) => {
  displayLeaderboard(data.leaderboard);
});

// Show round summary
socket.on('round_result_summary', (data) => {
  showRoundSummary({
    word: data.correctWord,
    drawer: data.drawer,
    guessers: data.correctGuessers,
    leaderboard: data.leaderboard
  });
});
```

---

## ✨ Key Features

✅ **Player Ready System** - Players must ready up before game starts  
✅ **Live Status Updates** - Real-time lobby status for all players  
✅ **Player State Tracking** - Track ready, drawing, and guessed status  
✅ **Live Leaderboard** - Updates after every score change  
✅ **Round Summaries** - Comprehensive round results  
✅ **Auto Status Reset** - Proper state management between rounds  

---

**Status:** 🎉 **PRODUCTION READY**

The lobby and leaderboard system is fully implemented!

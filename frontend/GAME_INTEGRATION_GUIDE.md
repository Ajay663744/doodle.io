# 🎮 Frontend Game Integration - Complete Guide

## Overview

The frontend now fully connects to the backend game engine with complete UI for all game phases.

---

## 📁 New Files Created

### Services & Hooks
- **`src/socket/gameSocketService.js`** - Game socket event emitters and listeners
- **`src/hooks/useGameState.js`** - Custom hook for game state management

### UI Components
- **`src/components/GameLobby.jsx`** - Lobby with player ready status
- **`src/components/WordSelection.jsx`** - Word selection modal for drawer
- **`src/components/GameTimer.jsx`** - Countdown timer with progress bar
- **`src/components/GuessChat.jsx`** - Chat for guesses and messages
- **`src/components/RoundResult.jsx`** - Round end results modal
- **`src/components/GameEnd.jsx`** - Final game results modal

### Updated Files
- **`src/pages/Room.jsx`** - Complete game flow integration

---

## 🎯 Game Phases

### 1. Lobby Phase (`gamePhase === 'lobby'`)

**UI Shows:**
- Player list with ready status
- Ready/Not Ready toggle button
- Start Game button (host only, enabled when enough players ready)

**Socket Events:**
- Listens: `lobby_status_update`
- Emits: `player_ready_toggle`, `start_game`

---

### 2. Playing Phase (`gamePhase === 'playing'`)

**UI Shows:**
- Current drawer name
- Word hint (for guessers) or actual word (for drawer)
- Timer countdown
- Canvas board
- Leaderboard (top 5)
- Guess chat
- Drawing toolbar (drawer only)

**Socket Events:**
- Listens: `turn_started`, `word_options`, `timer_update`, `correct_guess`, `player_guess`, `leaderboard_update`
- Emits: `select_word`, `send_guess`

**Drawer Experience:**
1. Receives 3 word options → WordSelection modal appears
2. Selects word → Modal closes, word displayed
3. Can draw on canvas with toolbar
4. Sees chat messages (cannot guess)

**Guesser Experience:**
1. Sees word hint (e.g., "_ _ _ _ _ _ _ _")
2. Sees who is drawing
3. Can type guesses in chat
4. Cannot draw on canvas

---

### 3. Round End Phase (`gamePhase === 'round_end'`)

**UI Shows:**
- RoundResult modal with:
  - Correct word
  - Drawer and points earned
  - List of correct guessers with points
  - Current leaderboard
  - Continue button

**Socket Events:**
- Listens: `round_ended`, `round_result_summary`

**Flow:**
- User clicks "Continue" → resets round state → returns to playing phase

---

### 4. Game End Phase (`gamePhase === 'game_end'`)

**UI Shows:**
- GameEnd modal with:
  - Winner announcement
  - Final leaderboard with rankings
  - Total rounds played
  - Exit button

**Socket Events:**
- Listens: `game_ended`

**Flow:**
- User clicks "Exit" → navigates back to dashboard

---

## 🔌 Socket Event Flow

```
USER ACTION                 FRONTEND EMITS           BACKEND RESPONDS
──────────────────────────────────────────────────────────────────────
Join room                → join_game_room         → lobby_status_update
Toggle ready             → player_ready_toggle    → lobby_status_update
Start game (host)        → start_game             → game_started
                                                   → turn_started
                                                   → word_options (drawer)
Select word (drawer)     → select_word            → timer_update (every 1s)
Type guess (guesser)     → send_guess             → correct_guess OR player_guess
                                                   → leaderboard_update
Timer expires            → (automatic)            → round_ended
                                                   → round_result_summary
All rounds complete      → (automatic)            → game_ended
```

---

## 🎨 useGameState Hook

**Purpose:** Manages all game state and socket event listeners in one place.

**Returns:**
```javascript
{
  // Game state
  gamePhase,        // 'lobby' | 'playing' | 'round_end' | 'game_end'
  gameState,        // Full game state object
  lobbyStatus,      // Lobby status with players and ready count
  
  // Turn state
  currentDrawer,    // Current drawer object
  isDrawer,         // Boolean: is current user the drawer?
  wordOptions,      // Array of 3 words (drawer only)
  currentWord,      // Selected word (drawer only during play, all after round)
  wordHint,         // Word hint for guessers (e.g., "_ _ _ _")
  
  // Timer
  timeRemaining,    // Seconds remaining
  
  // Results
  roundResult,      // Round end data
  gameResult,       // Game end data
  
  // Chat
  chatMessages,     // Array of chat/guess messages
  
  // Leaderboard
  leaderboard,      // Current leaderboard array
  
  // Actions
  resetRoundState,  // Function to reset round state
  setGamePhase      // Function to manually set game phase
}
```

---

## 🎮 Room Page Structure

```jsx
<Room>
  {/* Header with room info and game phase indicator */}
  
  {/* Main Content */}
  <div className="flex">
    {/* Left: Canvas Area */}
    <div>
      {gamePhase === 'playing' && (
        <>
          {/* Game info bar: drawer, word hint, timer */}
          <GameTimer />
        </>
      )}
      <CanvasBoard />
    </div>
    
    {/* Right: Sidebar */}
    <div>
      {gamePhase === 'lobby' && <GameLobby />}
      {gamePhase === 'playing' && (
        <>
          <Leaderboard />
          <GuessChat />
          {isDrawer && <Toolbar />}
        </>
      )}
    </div>
  </div>
  
  {/* Modals */}
  {wordOptions.length > 0 && isDrawer && <WordSelection />}
  {gamePhase === 'round_end' && <RoundResult />}
  {gamePhase === 'game_end' && <GameEnd />}
</Room>
```

---

## 🚀 How to Test

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Flow
1. Open two browser windows (different users)
2. Both join the same room
3. Both click "Ready Up"
4. Host clicks "Start Game"
5. Drawer selects a word
6. Guessers type guesses
7. Watch timer countdown
8. See round results
9. Continue through all rounds
10. See final game results

---

## ✨ Key Features

✅ **Complete Game Flow** - Lobby → Playing → Round End → Game End  
✅ **Real-time Updates** - All socket events connected  
✅ **Role-based UI** - Different experience for drawer vs guessers  
✅ **Live Leaderboard** - Updates after every correct guess  
✅ **Timer Countdown** - Visual progress bar  
✅ **Chat System** - Guesses appear in chat  
✅ **Round Summaries** - Detailed results after each round  
✅ **Game End Screen** - Winner announcement and final standings  

---

## 🎨 UI States Summary

| Phase | Drawer Sees | Guesser Sees |
|-------|-------------|--------------|
| **Lobby** | Player list, Ready button, Start button (if host) | Player list, Ready button |
| **Playing** | Word selection → Actual word, Canvas + Toolbar, Chat (read-only) | Word hint, Canvas (view-only), Chat + Input |
| **Round End** | Round results modal | Round results modal |
| **Game End** | Final results modal | Final results modal |

---

**Status:** 🎉 **PRODUCTION READY**

Frontend is now fully connected to the backend game engine!

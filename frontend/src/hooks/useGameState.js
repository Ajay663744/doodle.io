/**
 * useGameState Hook
 * Manages game state and socket event listeners
 */

import { useState, useEffect, useCallback } from 'react';
import {
    joinGameRoom,
    onGameStarted,
    onTurnStarted,
    onWordOptions,
    onTimerUpdate,
    onCorrectGuess,
    onPlayerGuess,
    onRoundEnded,
    onGameEnded,
    onLobbyStatusUpdate,
    onRoundResultSummary,
    onLeaderboardUpdate,
    onGameError,
    removeGameListeners
} from '../socket/gameSocketService';

export const useGameState = (roomId, user) => {
    // Game state
    const [gamePhase, setGamePhase] = useState('lobby'); // lobby, playing, round_end, game_end
    const [gameState, setGameState] = useState(null);
    const [lobbyStatus, setLobbyStatus] = useState(null);

    // Turn state
    const [currentDrawer, setCurrentDrawer] = useState(null);
    const [wordOptions, setWordOptions] = useState([]);
    const [currentWord, setCurrentWord] = useState('');
    const [wordHint, setWordHint] = useState('');

    // Timer
    const [timeRemaining, setTimeRemaining] = useState(60);

    // Round results
    const [roundResult, setRoundResult] = useState(null);
    const [gameResult, setGameResult] = useState(null);

    // Chat/guesses
    const [chatMessages, setChatMessages] = useState([]);

    // Leaderboard
    const [leaderboard, setLeaderboard] = useState([]);

    // Check if current user is drawer
    const isDrawer = currentDrawer?.userId === user?.id;

    // Debug log for isDrawer state
    useEffect(() => {
        console.log('🔍 DEBUG - isDrawer state updated:', {
            isDrawer,
            currentDrawer,
            userId: user?.id
        });
    }, [isDrawer, currentDrawer, user]);

    // Join game room on mount
    useEffect(() => {
        if (roomId && user) {
            joinGameRoom(roomId, user.id, user.username);
        }
    }, [roomId, user]);

    // Setup game event listeners
    useEffect(() => {
        // Game started
        onGameStarted((data) => {
            console.log('🎮 Game started:', data);
            setGamePhase('playing');
            setGameState(data.gameState);
            setChatMessages([]);
        });

        // Turn started
        onTurnStarted((data) => {
            console.log('🎨 Turn started:', data);
            console.log('🔍 DEBUG - Drawer info:', {
                drawerUserId: data.drawer?.userId,
                currentUserId: user?.id,
                isMatch: data.drawer?.userId === user?.id,
                waitingForWordSelection: data.waitingForWordSelection
            });
            setCurrentDrawer(data.drawer);
            setWordHint(data.wordHint);
            setTimeRemaining(60);
            setGamePhase('playing');

            // ✅ FIX: Clear word options when word has been selected
            // If waitingForWordSelection is false, it means word was already selected
            if (!data.waitingForWordSelection) {
                console.log('✅ Word already selected, clearing word options UI');
                setWordOptions([]);
            }
        });

        // Word options (drawer only)
        onWordOptions((data) => {
            console.log('📝 Word options received:', data);
            console.log('🔍 DEBUG - Word options:', data.options);
            setWordOptions(data.options || []); // Fixed: was data.words
        });

        // Timer update
        onTimerUpdate((data) => {
            setTimeRemaining(data.timeRemaining);
        });

        // Correct guess
        onCorrectGuess((data) => {
            console.log('✅ Correct guess:', data);
            const message = {
                type: 'correct',
                username: data.username,
                text: `${data.username} guessed correctly! (+${data.points} points)`,
                timestamp: Date.now()
            };
            setChatMessages(prev => [...prev, message]);
        });

        // Player guess (chat)
        onPlayerGuess((data) => {
            const message = {
                type: 'guess',
                username: data.username,
                text: data.guess,
                timestamp: Date.now()
            };
            setChatMessages(prev => [...prev, message]);
        });

        // Round ended
        onRoundEnded((data) => {
            console.log('🏁 Round ended:', data);
            setGamePhase('round_end');
            setRoundResult(data);
            setCurrentWord(data.correctWord);
        });

        // Round result summary
        onRoundResultSummary((data) => {
            console.log('📊 Round summary:', data);
            setRoundResult(data);
        });

        // Game ended
        onGameEnded((data) => {
            console.log('🎉 Game ended:', data);
            setGamePhase('game_end');
            setGameResult(data);
        });

        // Lobby status update
        onLobbyStatusUpdate((data) => {
            console.log('🏁 Lobby status:', data);
            setLobbyStatus(data);
        });

        // Leaderboard update
        onLeaderboardUpdate((data) => {
            setLeaderboard(data.leaderboard);
        });

        // Cleanup listeners on unmount
        return () => {
            removeGameListeners();
        };
    }, []);

    // Reset round state
    const resetRoundState = useCallback(() => {
        setRoundResult(null);
        setCurrentWord('');
        setWordOptions([]);
        setChatMessages([]);
    }, []);

    return {
        // Game state
        gamePhase,
        gameState,
        lobbyStatus,

        // Turn state
        currentDrawer,
        isDrawer,
        wordOptions,
        currentWord,
        wordHint,

        // Timer
        timeRemaining,

        // Results
        roundResult,
        gameResult,

        // Chat
        chatMessages,

        // Leaderboard
        leaderboard,

        // Actions
        resetRoundState,
        setGamePhase
    };
};

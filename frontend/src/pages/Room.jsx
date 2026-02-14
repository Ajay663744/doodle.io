import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as roomService from '../services/roomService';
import { initializeSocket, connectSocket, joinRoom, leaveRoom } from '../socket/socketService';
import { useGameState } from '../hooks/useGameState';
import CanvasBoard from '../components/CanvasBoard';
import Toolbar from '../components/Toolbar';
import GameLobby from '../components/GameLobby';
import WordSelection from '../components/WordSelection';
import GameTimer from '../components/GameTimer';
import GuessChat from '../components/GuessChat';
import RoundResult from '../components/RoundResult';
import GameEnd from '../components/GameEnd';
import Leaderboard from '../components/Leaderboard';

const Room = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Drawing tool states
    const [selectedTool, setSelectedTool] = useState('pen');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [selectedSize, setSelectedSize] = useState(5);

    // Game state from custom hook
    const {
        gamePhase,
        lobbyStatus,
        currentDrawer,
        isDrawer,
        wordOptions,
        currentWord,
        wordHint,
        timeRemaining,
        roundResult,
        gameResult,
        chatMessages,
        leaderboard,
        resetRoundState,
        setGamePhase
    } = useGameState(roomId, user);

    // Initialize socket connection
    useEffect(() => {
        initializeSocket();
        connectSocket();
    }, []);

    // Load room data
    useEffect(() => {
        const loadRoom = async () => {
            try {
                const response = await roomService.getRoom(roomId);
                if (response.success) {
                    setRoom(response.data);
                }
            } catch (err) {
                setError(err || 'Failed to load room');
            } finally {
                setLoading(false);
            }
        };

        loadRoom();
    }, [roomId]);

    // Join room via socket
    useEffect(() => {
        if (user && roomId) {
            joinRoom(roomId, user.id);
        }

        // Cleanup: leave room on unmount
        return () => {
            if (user && roomId) {
                leaveRoom(roomId, user.id);
            }
        };
    }, [roomId, user]);

    // Handle clear board
    const handleClearBoard = () => {
        if (window.clearCanvasBoard) {
            window.clearCanvasBoard();
        }
    };

    // Handle round continue
    const handleRoundContinue = () => {
        resetRoundState();
        setGamePhase('playing');
    };

    // Handle game exit
    const handleGameExit = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'This room does not exist'}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
                            <p className="text-sm text-gray-600">
                                Room ID: <span className="font-mono font-semibold">{room.roomId}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Game Phase Indicator */}
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {gamePhase === 'lobby' && '🏁 Lobby'}
                            {gamePhase === 'playing' && '🎮 Playing'}
                            {gamePhase === 'round_end' && '🏁 Round End'}
                            {gamePhase === 'game_end' && '🎉 Game Over'}
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold">{lobbyStatus?.totalPlayers || room.activeUsers?.length || 0}</span> active
                            user{(lobbyStatus?.totalPlayers || room.activeUsers?.length) !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Canvas Area */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* Game Info Bar (when playing) */}
                    {gamePhase === 'playing' && (
                        <div className="mb-4 space-y-3">
                            {/* Current Drawer & Word Hint */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {isDrawer ? '🎨 You are drawing!' : '👀 Guess the word!'}
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {isDrawer ? `Your word: ${currentWord}` : wordHint || '_ _ _ _ _'}
                                        </p>
                                        {currentDrawer && !isDrawer && (
                                            <p className="text-sm text-gray-600">
                                                Drawer: <span className="font-semibold">{currentDrawer.username}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Timer */}
                            <GameTimer timeRemaining={timeRemaining} />
                        </div>
                    )}

                    {/* Canvas Board */}
                    <div className="flex-1">
                        <CanvasBoard
                            selectedTool={selectedTool}
                            selectedColor={selectedColor}
                            selectedSize={selectedSize}
                            onClearBoard={handleClearBoard}
                            roomId={roomId}
                            isDrawer={isDrawer}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 p-6 bg-gray-100 overflow-y-auto space-y-4">
                    {/* Lobby Phase */}
                    {gamePhase === 'lobby' && (
                        <GameLobby
                            roomId={roomId}
                            user={user}
                            lobbyStatus={lobbyStatus}
                        />
                    )}

                    {/* Playing Phase */}
                    {gamePhase === 'playing' && (
                        <>
                            {/* Leaderboard */}
                            <Leaderboard
                                leaderboard={leaderboard}
                                currentUserId={user?.id}
                            />


                            {/* Guess Chat */}
                            <GuessChat
                                roomId={roomId}
                                user={user}
                                chatMessages={chatMessages}
                                isDrawer={isDrawer}
                            />

                            {/* Toolbar (for drawer) */}
                            {isDrawer && (
                                <Toolbar
                                    selectedTool={selectedTool}
                                    onToolChange={setSelectedTool}
                                    selectedColor={selectedColor}
                                    onColorChange={setSelectedColor}
                                    selectedSize={selectedSize}
                                    onSizeChange={setSelectedSize}
                                    onClearBoard={handleClearBoard}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* Word Selection Modal (drawer only) */}
            {wordOptions.length > 0 && isDrawer && (
                <WordSelection
                    roomId={roomId}
                    user={user}
                    wordOptions={wordOptions}
                />
            )}

            {/* Round Result Modal */}
            {gamePhase === 'round_end' && roundResult && (
                <RoundResult
                    roundResult={roundResult}
                    onContinue={handleRoundContinue}
                />
            )}

            {/* Game End Modal */}
            {gamePhase === 'game_end' && gameResult && (
                <GameEnd
                    gameResult={gameResult}
                    onExit={handleGameExit}
                />
            )}
        </div>
    );
};

export default Room;

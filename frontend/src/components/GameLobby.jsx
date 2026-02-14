/**
 * GameLobby Component
 * Shows players and ready status before game starts
 */

import { startGame, togglePlayerReady } from '../socket/gameSocketService';

const GameLobby = ({ roomId, user, lobbyStatus }) => {
    if (!lobbyStatus) return null;

    const currentPlayer = lobbyStatus.players?.find(p => p.userId === user?.id);
    const isHost = currentPlayer?.isHost;

    const handleToggleReady = () => {
        togglePlayerReady(roomId, user.id);
    };

    const handleStartGame = () => {
        startGame(roomId, user.id);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎮 Game Lobby</h2>

            {/* Player List */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Players ({lobbyStatus.readyPlayers}/{lobbyStatus.totalPlayers} ready)
                </h3>
                <div className="space-y-2">
                    {lobbyStatus.players?.map((player) => (
                        <div
                            key={player.userId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-300'
                                    }`}></div>
                                <span className="font-medium text-gray-900">
                                    {player.username}
                                </span>
                                {player.isHost && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                        HOST
                                    </span>
                                )}
                            </div>
                            <span className={`text-sm font-semibold ${player.isReady ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {player.isReady ? 'READY' : 'NOT READY'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ready Button */}
            <button
                onClick={handleToggleReady}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-3 ${currentPlayer?.isReady
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
            >
                {currentPlayer?.isReady ? '❌ Not Ready' : '✅ Ready Up'}
            </button>

            {/* Start Game Button (Host Only) */}
            {isHost && (
                <button
                    onClick={handleStartGame}
                    disabled={!lobbyStatus.canStart}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${lobbyStatus.canStart
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    🚀 Start Game
                </button>
            )}

            {!lobbyStatus.canStart && (
                <p className="text-sm text-gray-500 text-center mt-2">
                    Need at least {lobbyStatus.minPlayersRequired} ready players to start
                </p>
            )}
        </div>
    );
};

export default GameLobby;

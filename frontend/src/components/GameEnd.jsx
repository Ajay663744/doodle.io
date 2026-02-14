/**
 * GameEnd Component
 * Shows final game results
 */

const GameEnd = ({ gameResult, onPlayAgain, onExit }) => {
    if (!gameResult) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                    🎉 Game Over!
                </h2>

                {/* Winner */}
                {gameResult.winner && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-6 text-center">
                        <p className="text-white text-lg mb-2">👑 Winner 👑</p>
                        <p className="text-white text-3xl font-bold">{gameResult.winner.username}</p>
                        <p className="text-white text-2xl font-semibold mt-2">{gameResult.winner.score} points</p>
                    </div>
                )}

                {/* Final Leaderboard */}
                {gameResult.leaderboard && gameResult.leaderboard.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                            🏆 Final Standings
                        </h3>
                        <div className="space-y-3">
                            {gameResult.leaderboard.map((player) => (
                                <div
                                    key={player.userId}
                                    className={`rounded-lg p-4 flex justify-between items-center ${player.rank === 1
                                            ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                                            : player.rank === 2
                                                ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                                                : player.rank === 3
                                                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                                                    : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl">
                                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                                        </span>
                                        <span className="font-bold text-lg">{player.username}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{player.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Game Stats */}
                {gameResult.totalRounds && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                        <p className="text-gray-600">Total Rounds Played: <span className="font-bold text-blue-600">{gameResult.totalRounds}</span></p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4">
                    {onPlayAgain && (
                        <button
                            onClick={onPlayAgain}
                            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            🔄 Play Again
                        </button>
                    )}
                    <button
                        onClick={onExit}
                        className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        🚪 Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameEnd;

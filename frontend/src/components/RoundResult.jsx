/**
 * RoundResult Component
 * Shows round end results
 */

const RoundResult = ({ roundResult, onContinue }) => {
    if (!roundResult) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                    🏁 Round Over!
                </h2>

                {/* Correct Word */}
                <div className="bg-blue-100 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-gray-600 mb-1">The word was:</p>
                    <p className="text-4xl font-bold text-blue-600">{roundResult.correctWord}</p>
                </div>

                {/* Drawer Info */}
                {roundResult.drawer && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">🎨 Drawer</h3>
                        <div className="bg-purple-50 rounded-lg p-3">
                            <span className="font-medium">{roundResult.drawer.username}</span>
                            <span className="text-purple-600 font-bold ml-2">
                                +{roundResult.drawerPoints || roundResult.drawer.points || 0} points
                            </span>
                        </div>
                    </div>
                )}

                {/* Correct Guessers */}
                {roundResult.correctGuessers && roundResult.correctGuessers.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            ✅ Correct Guessers ({roundResult.correctGuessers.length})
                        </h3>
                        <div className="space-y-2">
                            {roundResult.correctGuessers.map((guesser, index) => (
                                <div key={index} className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                                    <div>
                                        <span className="font-medium">{guesser.username}</span>
                                        <span className="text-sm text-gray-500 ml-2">#{index + 1}</span>
                                    </div>
                                    <span className="text-green-600 font-bold">+{guesser.points} points</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                {roundResult.leaderboard && roundResult.leaderboard.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">🏆 Leaderboard</h3>
                        <div className="space-y-2">
                            {roundResult.leaderboard.slice(0, 5).map((player) => (
                                <div
                                    key={player.userId}
                                    className={`rounded-lg p-3 flex justify-between items-center ${player.rank === 1
                                            ? 'bg-yellow-100 border-2 border-yellow-400'
                                            : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">
                                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                                        </span>
                                        <span className="font-medium">{player.username}</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{player.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default RoundResult;

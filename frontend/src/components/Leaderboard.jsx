/**
 * Leaderboard Component
 * Displays live player rankings and scores
 */

const Leaderboard = ({ leaderboard, currentUserId }) => {
    if (!leaderboard || leaderboard.length === 0) {
        return null;
    }

    // Medal emojis for top 3
    const getMedal = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                🏆 Leaderboard
            </h3>

            <div className="space-y-2">
                {leaderboard.map((player) => {
                    const isCurrentUser = player.userId === currentUserId;

                    return (
                        <div
                            key={player.userId}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all ${isCurrentUser
                                    ? 'bg-blue-50 border-2 border-blue-300'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                {/* Rank */}
                                <div className="text-xl font-bold min-w-[40px]">
                                    {getMedal(player.rank)}
                                </div>

                                {/* Player Name */}
                                <div>
                                    <p className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                                        }`}>
                                        {player.username}
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Score */}
                            <div className={`text-xl font-bold ${isCurrentUser ? 'text-blue-700' : 'text-gray-700'
                                }`}>
                                {player.score} pts
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;

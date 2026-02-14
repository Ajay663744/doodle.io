/**
 * GameTimer Component
 * Shows countdown timer during game
 */

const GameTimer = ({ timeRemaining }) => {
    const percentage = (timeRemaining / 60) * 100;
    const isLowTime = timeRemaining <= 10;

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Time Remaining</span>
                <span className={`text-2xl font-bold ${isLowTime ? 'text-red-600 animate-pulse' : 'text-blue-600'
                    }`}>
                    {timeRemaining}s
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isLowTime ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default GameTimer;

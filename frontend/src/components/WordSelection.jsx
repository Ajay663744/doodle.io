/**
 * WordSelection Component
 * Shows word options for drawer to select
 */

import { selectWord } from '../socket/gameSocketService';

const WordSelection = ({ roomId, user, wordOptions }) => {
    const handleSelectWord = (word) => {
        selectWord(roomId, user.id, word);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    🎨 Choose a Word to Draw
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    Select one of the words below
                </p>

                <div className="space-y-3">
                    {wordOptions.map((word, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectWord(word)}
                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                        >
                            {word}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WordSelection;

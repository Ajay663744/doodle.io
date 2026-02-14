/**
 * GuessChat Component
 * Shows chat messages and guess input
 */

import { useState } from 'react';
import { sendGuess } from '../socket/gameSocketService';

const GuessChat = ({ roomId, user, chatMessages, isDrawer }) => {
    const [guessInput, setGuessInput] = useState('');

    const handleSubmitGuess = (e) => {
        e.preventDefault();
        if (guessInput.trim() && !isDrawer) {
            sendGuess(roomId, user.id, user.username, guessInput.trim());
            setGuessInput('');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md flex flex-col h-96">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">💬 Chat & Guesses</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chatMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded-lg ${msg.type === 'correct'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        <span className="font-semibold">{msg.username}:</span>{' '}
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>

            {/* Input */}
            {!isDrawer && (
                <form onSubmit={handleSubmitGuess} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={guessInput}
                            onChange={(e) => setGuessInput(e.target.value)}
                            placeholder="Type your guess..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            Send
                        </button>
                    </div>
                </form>
            )}

            {isDrawer && (
                <div className="p-4 border-t border-gray-200 text-center text-gray-500">
                    You are drawing! You cannot guess.
                </div>
            )}
        </div>
    );
};

export default GuessChat;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as roomService from '../services/roomService';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { user } = useAuth();
    const navigate = useNavigate();

    // Load rooms on mount
    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const response = await roomService.getRooms();
            if (response.success) {
                setRooms(response.data);
            }
        } catch (err) {
            console.error('Error loading rooms:', err);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!roomName.trim()) {
            setError('Please enter a room name');
            return;
        }

        setLoading(true);

        try {
            const response = await roomService.createRoom(roomName, roomPassword);
            if (response.success) {
                const passwordMsg = response.data.plainPassword
                    ? ` | Password: ${response.data.plainPassword} (Save this!)`
                    : '';
                setSuccess(`Room created! Room ID: ${response.data.roomId}${passwordMsg}`);
                setRoomName('');
                setRoomPassword('');
                loadRooms(); // Reload rooms list

                // Navigate to room after 2 seconds
                setTimeout(() => {
                    navigate(`/room/${response.data.roomId}`);
                }, 2000);
            }
        } catch (err) {
            setError(err || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setError('');

        if (!joinRoomId.trim()) {
            setError('Please enter a room ID');
            return;
        }

        // Navigate to room
        navigate(`/room/${joinRoomId.toUpperCase()}`);
    };

    const handleDeleteRoom = async (roomId, roomName, e) => {
        e.stopPropagation(); // Prevent room navigation

        if (!window.confirm(`Are you sure you want to delete "${roomName}"?`)) {
            return;
        }

        try {
            const response = await roomService.deleteRoom(roomId);
            if (response.success) {
                setSuccess('Room deleted successfully');
                loadRooms(); // Reload rooms list

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete room');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Create a new whiteboard room or join an existing one
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600">{success}</p>
                    </div>
                )}

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Create Room Card */}
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Create Room</h2>
                        </div>

                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Name
                                </label>
                                <input
                                    id="roomName"
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="My Awesome Whiteboard"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="roomPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password (Optional)
                                </label>
                                <input
                                    id="roomPassword"
                                    type="text"
                                    value={roomPassword}
                                    onChange={(e) => setRoomPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    placeholder="Leave empty for public room"
                                />
                                <p className="text-xs text-gray-500 mt-1">Set a password to make this room private</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Room'}
                            </button>
                        </form>
                    </div>

                    {/* Join Room Card */}
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Join Room</h2>
                        </div>

                        <form onSubmit={handleJoinRoom} className="space-y-4">
                            <div>
                                <label htmlFor="joinRoomId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room ID
                                </label>
                                <input
                                    id="joinRoomId"
                                    type="text"
                                    value={joinRoomId}
                                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none uppercase"
                                    placeholder="ABC123"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Join Room
                            </button>
                        </form>
                    </div>
                </div>

                {/* Available Rooms */}
                <div className="bg-white rounded-xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>

                    {rooms.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No rooms available. Create one to get started!
                        </p>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map((room) => (
                                <div
                                    key={room._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer relative"
                                    onClick={() => navigate(`/room/${room.roomId}`)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{room.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                                {room.roomId}
                                            </span>

                                            {/* Delete button (only for room creator) */}
                                            {room.createdBy?._id === user?.id && (
                                                <button
                                                    onClick={(e) => handleDeleteRoom(room.roomId, room.name, e)}
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                                    title="Delete room"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Created by: {room.createdBy?.name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Active users: {room.activeUsers?.length || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

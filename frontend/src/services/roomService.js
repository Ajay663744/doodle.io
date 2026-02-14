import api from './api';

/**
 * Create a new room
 * @param {string} name - Room name
 * @param {string} password - Optional room password
 * @returns {Promise} Response with room data
 */
export const createRoom = async (name, password = null) => {
    const response = await api.post('/rooms', { name, password });
    return response.data;
};

/**
 * Get all rooms
 * @returns {Promise} Response with array of rooms
 */
export const getRooms = async () => {
    const response = await api.get('/rooms');
    return response.data;
};

/**
 * Get room by ID
 * @param {string} roomId - Room ID
 * @returns {Promise} Response with room data
 */
export const getRoom = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
};

/**
 * Delete a room
 * @param {string} roomId - Room ID
 * @returns {Promise} Response with success message
 */
export const deleteRoom = async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
};

/**
 * Verify room password
 * @param {string} roomId - Room ID
 * @param {string} password - Room password
 * @returns {Promise} Response with verification result
 */
export const verifyRoomPassword = async (roomId, password) => {
    const response = await api.post(`/rooms/${roomId}/verify-password`, { password });
    return response.data;
};

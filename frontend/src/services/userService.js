import api from './api';

/**
 * User Service - REST calls for user profile
 *
 * All calls require a valid JWT token (handled automatically by the
 * Axios interceptor in api.js via localStorage 'token').
 */

/**
 * GET /api/users/profile
 * Retrieve the currently authenticated user's profile and lifetime stats.
 *
 * @returns {Promise<{ id, name, email, totalScore, gamesPlayed, createdAt }>}
 *
 * Example:
 *   const { data } = await getUserProfile();
 *   console.log(data.name, data.totalScore);
 */
export const getUserProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;   // { success, data: { id, name, email, totalScore, gamesPlayed, createdAt } }
};

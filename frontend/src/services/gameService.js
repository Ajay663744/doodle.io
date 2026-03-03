import api from './api';

/**
 * Game Service - REST calls for leaderboard and game history
 *
 * All calls require a valid JWT token (handled automatically by the
 * Axios interceptor in api.js via localStorage 'token').
 */

/**
 * GET /api/leaderboard
 * Retrieve global top players ranked by total lifetime score.
 *
 * @param {number} limit - Number of players to return (default: 10)
 * @returns {Promise<{ success, count, data: Array<{ rank, id, name, totalScore, gamesPlayed }> }>}
 *
 * Example:
 *   const { data } = await getLeaderboard(10);
 *   data.forEach(player => console.log(player.rank, player.name, player.totalScore));
 */
export const getLeaderboard = async (limit = 10) => {
    const response = await api.get('/leaderboard', { params: { limit } });
    return response.data;
};

/**
 * GET /api/games/history
 * Retrieve paginated list of completed games for the authenticated user.
 *
 * @param {number} page  - Page number (default: 1)
 * @param {number} limit - Games per page (default: 10)
 * @returns {Promise<{ success, total, page, pages, data: Array<GameHistoryEntry> }>}
 *
 * GameHistoryEntry shape:
 *   { roomId, roomName, playedAt, totalRounds, myScore, myRank, winner, playerCount }
 *
 * Example:
 *   const { data, total } = await getGameHistory(1, 5);
 *   data.forEach(g => console.log(g.roomName, g.myScore, g.myRank));
 */
export const getGameHistory = async (page = 1, limit = 10) => {
    const response = await api.get('/games/history', { params: { page, limit } });
    return response.data;
};

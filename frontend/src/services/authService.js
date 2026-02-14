import api from './api';

/**
 * Register a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Response with user data and token
 */
export const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
        name,
        email,
        password,
    });
    return response.data;
};

/**
 * Login user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Response with user data and token
 */
export const login = async (email, password) => {
    const response = await api.post('/auth/login', {
        email,
        password,
    });
    return response.data;
};

/**
 * Get current logged in user
 * @returns {Promise} Response with user data
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

import api from './api';

/**
 * POST /api/ai/hint
 * Asks the backend to generate a Stable Diffusion sketch for the given word.
 *
 * @param {string} word - The word the drawer needs to draw (e.g. "elephant")
 * @returns {Promise<{ success: boolean, image: string }>}
 *   `image` is a base64 data URL: "data:image/png;base64,..."
 *
 * Example:
 *   const { image } = await getAIHint('elephant');
 *   // Pass image as src to an <img> element
 */
export const getAIHint = async (word) => {
    const response = await api.post('/ai/hint', { word });
    return response.data;
};

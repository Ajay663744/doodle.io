const axios = require('axios');

/**
 * POST /api/ai/hint
 * Body: { word: string }
 * Response: { success: true, image: "data:image/png;base64,..." }
 *
 * Calls the Hugging Face Inference API to generate a simple sketch of the
 * given word using Stable Diffusion.
 */
const generateHint = async (req, res) => {
    const { word } = req.body;

    if (!word || typeof word !== 'string' || !word.trim()) {
        return res.status(400).json({
            success: false,
            message: 'A valid "word" field is required in the request body.'
        });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            success: false,
            message: 'Hugging Face API key is not configured on the server.'
        });
    }

    const prompt = `A simple black line sketch of ${word.trim()}, minimal drawing tutorial style, white background`;

    // Primary model: SDXL. Falls back gracefully via error handling.
    const MODEL_URL =
        'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

    try {
        const hfResponse = await axios.post(
            MODEL_URL,
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'image/png'
                },
                responseType: 'arraybuffer',   // receive raw image bytes
                timeout: 120000                // 120 s — HF cold-starts can be slow
            }
        );

        // Convert binary → base64 data URL
        const base64Image = Buffer.from(hfResponse.data, 'binary').toString('base64');
        const contentType = hfResponse.headers['content-type'] || 'image/png';
        const dataUrl = `data:${contentType};base64,${base64Image}`;

        return res.status(200).json({
            success: true,
            image: dataUrl
        });
    } catch (error) {
        // Hugging Face returns a JSON error body even for HTTP 4xx/5xx
        if (error.response) {
            const statusCode = error.response.status;
            let errorMessage = 'Hugging Face API error.';

            // HF sometimes returns JSON inside the arraybuffer
            try {
                const raw = Buffer.from(error.response.data).toString('utf-8');
                const parsed = JSON.parse(raw);
                errorMessage = parsed.error || errorMessage;
            } catch (_) {
                // non-JSON body — keep the default message
            }

            if (statusCode === 401 || statusCode === 403) {
                return res.status(401).json({ success: false, message: 'Invalid or missing Hugging Face API key.' });
            }
            if (statusCode === 503) {
                return res.status(503).json({ success: false, message: 'AI model is loading. Please wait 30 seconds and try again.' });
            }

            return res.status(502).json({ success: false, message: errorMessage });
        }

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ success: false, message: 'Request timed out. The AI model may be loading — please try again.' });
        }

        console.error('AI Hint Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to generate AI hint. Please try again.' });
    }
};

module.exports = { generateHint };

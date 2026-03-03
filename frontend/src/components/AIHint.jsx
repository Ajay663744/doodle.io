import { useState } from 'react';
import { getAIHint } from '../services/aiService';

/**
 * AIHint — only rendered for the current drawer during the playing phase.
 *
 * Props:
 *   word {string} — the word the drawer must draw (e.g. "elephant")
 */
const AIHint = ({ word }) => {
    const [hintImage, setHintImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [revealed, setRevealed] = useState(false);

    const handleShowHint = async () => {
        if (loading) return;
        setLoading(true);
        setError('');
        setRevealed(true);

        try {
            const data = await getAIHint(word);
            if (data.success && data.image) {
                setHintImage(data.image);
            } else {
                setError('No image returned. Please try again.');
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to generate AI hint. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset if the word changes (new turn)
    if (!revealed && hintImage) {
        setHintImage(null);
        setError('');
    }

    return (
        <div
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>🤖</span>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                    AI Drawing Hint
                </h3>
            </div>

            {/* Button */}
            {!revealed && (
                <button
                    onClick={handleShowHint}
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    ✨ Show AI Hint
                </button>
            )}

            {/* Loading state */}
            {loading && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 0'
                    }}
                >
                    {/* Spinner */}
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid #e5e7eb',
                            borderTopColor: '#6366f1',
                            borderRadius: '50%',
                            animation: 'ai-hint-spin 0.8s linear infinite'
                        }}
                    />
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                        Generating AI hint…
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                        This may take up to 30 seconds
                    </p>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div
                    style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#dc2626',
                        fontSize: '13px'
                    }}
                >
                    <strong>⚠️ </strong>{error}
                    <button
                        onClick={handleShowHint}
                        style={{
                            display: 'block',
                            marginTop: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            padding: 0
                        }}
                    >
                        Try again →
                    </button>
                </div>
            )}

            {/* Image result */}
            {!loading && hintImage && (
                <div style={{ marginTop: '8px' }}>
                    <img
                        src={hintImage}
                        alt={`AI sketch of ${word}`}
                        style={{
                            width: '100%',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'block'
                        }}
                    />
                    <p
                        style={{
                            margin: '8px 0 0',
                            fontSize: '11px',
                            color: '#9ca3af',
                            textAlign: 'center'
                        }}
                    >
                        AI-generated reference sketch
                    </p>
                    {/* Allow re-generating */}
                    <button
                        onClick={() => {
                            setRevealed(false);
                            setHintImage(null);
                            setError('');
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            marginTop: '10px',
                            padding: '7px',
                            background: 'none',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            color: '#6b7280',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        🔄 Generate new hint
                    </button>
                </div>
            )}

            {/* Spinner keyframes injected once */}
            <style>{`
                @keyframes ai-hint-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AIHint;

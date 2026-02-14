import { useRef, useEffect, useState } from 'react';
import { emitDraw, onReceiveDraw, offReceiveDraw, onClearCanvas, offClearCanvas } from '../socket/socketService';

const CanvasBoard = ({ selectedTool, selectedColor, selectedSize, onClearBoard, roomId, isDrawer = true }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        setContext(ctx);

        // Set canvas size
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Redraw all strokes after resize
            redrawCanvas(ctx);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Redraw canvas when strokes change
    useEffect(() => {
        if (context) {
            redrawCanvas(context);
        }
    }, [strokes, context]);

    // Handle clear board
    useEffect(() => {
        if (onClearBoard) {
            // This effect will be triggered by parent component
        }
    }, [onClearBoard]);

    // Redraw all strokes on canvas
    const redrawCanvas = (ctx) => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw all strokes
        strokes.forEach((stroke) => {
            if (stroke.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
            ctx.lineWidth = stroke.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }

            ctx.stroke();
        });
    };

    // Draw remote stroke (from other users)
    const drawRemoteStroke = (strokeData) => {
        console.log('📥 Received remote stroke:', strokeData);

        if (!context || !strokeData || strokeData.points.length < 2) {
            console.warn('⚠️ Cannot draw remote stroke:', { context: !!context, strokeData, pointsLength: strokeData?.points?.length });
            return;
        }

        console.log('✏️ Drawing remote stroke with', strokeData.points.length, 'points');

        context.beginPath();
        context.strokeStyle = strokeData.tool === 'eraser' ? '#FFFFFF' : strokeData.color;
        context.lineWidth = strokeData.brushSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        context.moveTo(strokeData.points[0].x, strokeData.points[0].y);

        for (let i = 1; i < strokeData.points.length; i++) {
            context.lineTo(strokeData.points[i].x, strokeData.points[i].y);
        }

        context.stroke();

        // Add to strokes array for persistence
        setStrokes((prev) => [...prev, strokeData]);
        console.log('✅ Remote stroke drawn successfully');
    };

    // Setup socket listeners for remote drawings (after drawRemoteStroke is defined)
    useEffect(() => {
        console.log('🔌 Setting up socket listener for room:', roomId);

        // Listen for remote draw events
        onReceiveDraw((data) => {
            console.log('📨 Socket event received:', data);
            drawRemoteStroke(data.strokeData);
        });

        // Listen for canvas clear events
        onClearCanvas(() => {
            console.log('🧹 clear_canvas event received - clearing canvas');
            // Clear canvas
            if (context) {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            // Clear all strokes
            setStrokes([]);
        });

        // Cleanup listener on unmount
        return () => {
            console.log('🔌 Cleaning up socket listeners');
            offReceiveDraw();
            offClearCanvas();
        };
    }, [context, roomId]);

    // Get mouse position relative to canvas
    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Start drawing
    const startDrawing = (e) => {
        if (!context) return;

        setIsDrawing(true);
        const pos = getMousePos(e);

        const newStroke = {
            points: [pos],
            color: selectedColor,
            brushSize: selectedSize,
            tool: selectedTool,
        };

        setCurrentStroke(newStroke);

        // Start path
        context.beginPath();
        context.strokeStyle = selectedTool === 'eraser' ? '#FFFFFF' : selectedColor;
        context.lineWidth = selectedSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.moveTo(pos.x, pos.y);
    };

    // Continue drawing
    const draw = (e) => {
        if (!isDrawing || !context || !currentStroke) return;

        const pos = getMousePos(e);

        // Add point to current stroke
        setCurrentStroke((prev) => ({
            ...prev,
            points: [...prev.points, pos],
        }));

        // Draw line
        context.lineTo(pos.x, pos.y);
        context.stroke();
    };

    // Stop drawing
    const stopDrawing = () => {
        if (!isDrawing) return;

        setIsDrawing(false);

        // Save stroke to strokes array and emit to other users
        if (currentStroke && currentStroke.points.length > 1) {
            setStrokes((prev) => [...prev, currentStroke]);

            // Emit draw event to other users in room
            if (roomId) {
                console.log('📤 Emitting draw event to room:', roomId, 'with', currentStroke.points.length, 'points');
                emitDraw(roomId, currentStroke);
            } else {
                console.warn('⚠️ No roomId available, cannot emit draw event');
            }
        }

        setCurrentStroke(null);
    };

    // Clear board function
    const clearBoard = () => {
        if (!context) return;

        const canvas = canvasRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        setStrokes([]);
        setCurrentStroke(null);
    };

    // Expose clear board function to parent
    useEffect(() => {
        if (onClearBoard) {
            window.clearCanvasBoard = clearBoard;
        }
    }, [onClearBoard]);

    return (
        <div className="w-full h-full bg-white rounded-lg shadow-md overflow-hidden relative">
            <canvas
                ref={canvasRef}
                onMouseDown={isDrawer ? startDrawing : undefined}
                onMouseMove={isDrawer ? draw : undefined}
                onMouseUp={isDrawer ? stopDrawing : undefined}
                onMouseLeave={isDrawer ? stopDrawing : undefined}
                className={isDrawer ? "cursor-crosshair" : "cursor-not-allowed"}
                style={{ display: 'block', width: '100%', height: '100%' }}
            />
            {!isDrawer && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-lg">
                        <span className="text-sm font-semibold">👀 View Only - Guess the word!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CanvasBoard;

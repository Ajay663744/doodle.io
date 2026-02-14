import ColorPicker from './ColorPicker';
import BrushSelector from './BrushSelector';

const Toolbar = ({
    selectedTool,
    onToolChange,
    selectedColor,
    onColorChange,
    selectedSize,
    onSizeChange,
    onClearBoard,
}) => {
    const tools = [
        { name: 'Pen', value: 'pen', icon: '🖊️' },
        { name: 'Pencil', value: 'pencil', icon: '✏️' },
        { name: 'Brush', value: 'brush', icon: '🖌️' },
        { name: 'Eraser', value: 'eraser', icon: '🧹' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Tool Selection */}
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Tool</label>
                <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                        <button
                            key={tool.value}
                            onClick={() => onToolChange(tool.value)}
                            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${selectedTool === tool.value
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-xl">{tool.icon}</span>
                            <span className="font-medium text-sm">{tool.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Picker - Show for all tools except eraser */}
            {selectedTool !== 'eraser' && (
                <ColorPicker selectedColor={selectedColor} onColorChange={onColorChange} />
            )}

            {/* Brush Size Selector */}
            <BrushSelector selectedSize={selectedSize} onSizeChange={onSizeChange} />

            {/* Clear Board Button */}
            <div className="pt-4 border-t border-gray-200">
                <button
                    onClick={onClearBoard}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                    <span className="text-xl">🗑️</span>
                    <span>Clear Board</span>
                </button>
            </div>
        </div>
    );
};

export default Toolbar;

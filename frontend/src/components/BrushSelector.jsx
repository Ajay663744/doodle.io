const BrushSelector = ({ selectedSize, onSizeChange }) => {
    const sizes = [
        { name: 'Extra Small', value: 2 },
        { name: 'Small', value: 5 },
        { name: 'Medium', value: 10 },
        { name: 'Large', value: 15 },
        { name: 'Extra Large', value: 20 },
    ];

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Brush Size</label>
            <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                    <button
                        key={size.value}
                        onClick={() => onSizeChange(size.value)}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all hover:bg-gray-50 ${selectedSize === size.value
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-300'
                            }`}
                        title={size.name}
                    >
                        <div
                            className="rounded-full bg-gray-800"
                            style={{
                                width: `${size.value}px`,
                                height: `${size.value}px`,
                            }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BrushSelector;

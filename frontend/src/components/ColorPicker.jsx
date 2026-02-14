import { useState } from 'react';

const ColorPicker = ({ selectedColor, onColorChange }) => {
    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Green', value: '#10B981' },
        { name: 'Yellow', value: '#F59E0B' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Pink', value: '#EC4899' },
    ];

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onColorChange(color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color.value
                                ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                                : 'border-gray-300'
                            }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
};

export default ColorPicker;

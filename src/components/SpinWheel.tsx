import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

export interface SpinWheelRef {
    spin: () => void;
}

interface SpinWheelProps {
    items: { label: string; color?: string; id?: any }[];
    onSpinEnd: (result: any) => void;
    title: string;
    isActive?: boolean;
    isSpinningAll?: boolean;
}

const SpinWheel = forwardRef<SpinWheelRef, SpinWheelProps>(({ items, onSpinEnd, title, isActive = false, isSpinningAll = false }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Default colors if not provided
    const defaultColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
    ];

    const spin = () => {
        if (isSpinning || items.length === 0) return;

        setIsSpinning(true);
        setSelectedItem(null);

        // Calculate random rotation: at least 5 full spins (1800 deg) + random segment
        const segmentAngle = 360 / items.length;
        const randomSegment = Math.floor(Math.random() * items.length);
        const extraRotation = (360 * 5) + (randomSegment * segmentAngle) + (segmentAngle / 2); // Center of segment

        // Add some randomness within the segment
        const jitter = (Math.random() - 0.5) * (segmentAngle * 0.5);

        const newRotation = rotation + extraRotation + jitter;
        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);

            // Calculate result
            const normalizedRotation = newRotation % 360;
            const effectiveAngle = (360 - normalizedRotation) % 360;
            const winningIndex = Math.floor(effectiveAngle / segmentAngle);

            const result = items[winningIndex];
            setSelectedItem(result.label);
            onSpinEnd(result);
        }, 3000); // 3 seconds duration matches CSS transition
    };

    useImperativeHandle(ref, () => ({
        spin
    }));

    const getSegmentPath = (index: number, total: number, radius: number) => {
        const startAngle = (index * 360) / total;
        const endAngle = ((index + 1) * 360) / total;

        // Convert to radians, subtracting 90deg to start from top (12 o'clock)
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = radius + radius * Math.cos(startRad);
        const y1 = radius + radius * Math.sin(startRad);
        const x2 = radius + radius * Math.cos(endRad);
        const y2 = radius + radius * Math.sin(endRad);

        return `M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${x2},${y2} Z`;
    };

    return (
        <div className={cn(
            "flex flex-col items-center transition-all duration-500",
            isSpinningAll ? "scale-100 opacity-100" :
                isActive ? "scale-[1.6] z-20" : "scale-50 opacity-60 hover:opacity-80 hover:scale-60"
        )}>
            <h3 className="text-xl font-bold mb-8 text-white uppercase tracking-wider shadow-sm">{title}</h3>

            <div className="relative group cursor-pointer" onClick={spin}>
                {/* Pointer */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-white drop-shadow-lg" />

                {/* Wheel Container */}
                <div
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white shadow-2xl overflow-hidden relative bg-white"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
                    }}
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                        {items.map((item, index) => (
                            <path
                                key={index}
                                d={getSegmentPath(index, items.length, 100)}
                                fill={item.color || defaultColors[index % defaultColors.length]}
                                stroke="white"
                                strokeWidth="1"
                            />
                        ))}
                    </svg>

                    {/* Text Labels - Radial Alignment */}
                    <div className="absolute inset-0 w-full h-full">
                        {items.map((item, index) => {
                            const angle = (index * 360) / items.length + (360 / items.length) / 2;
                            return (
                                <div
                                    key={index}
                                    className="absolute top-1/2 left-1/2 w-1/2 h-0 origin-left flex items-center justify-end pr-2"
                                    style={{
                                        transform: `rotate(${angle - 90}deg)`,
                                    }}
                                >
                                    <span
                                        className="text-xs md:text-sm font-bold text-white drop-shadow-md truncate w-full text-right block px-4"
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-gray-200">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                </div>
            </div>

            {/* Result Display */}
            <div className="h-12 mt-6 flex items-center justify-center">
                {selectedItem && (
                    <div
                        className="bg-white px-6 py-2 rounded-full shadow-lg animate-bounce z-30"
                        style={{ animationIterationCount: 3 }}
                    >
                        <p className="text-lg font-bold text-black">{selectedItem}</p>
                    </div>
                )}
            </div>
        </div>
    );
});
SpinWheel.displayName = 'SpinWheel';

export default SpinWheel;

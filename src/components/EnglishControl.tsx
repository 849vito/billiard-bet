
import { useState, useRef, useEffect } from 'react';

interface EnglishControlProps {
  onChange: (english: { x: number, y: number }) => void;
}

const EnglishControl = ({ onChange }: EnglishControlProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const controlRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset position on mount
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, []);
  
  // Handle mouse/touch down event
  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    updatePosition(clientX, clientY);
  };
  
  // Update the position of the control
  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate center of the control area
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate position relative to center
    let x = (clientX - rect.left - centerX) / centerX;
    let y = (clientY - rect.top - centerY) / centerY;
    
    // Limit values to -1 to 1 (within the circle)
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 1) {
      x /= distance;
      y /= distance;
    }
    
    // Invert Y axis so positive is up
    y = -y;
    
    setPosition({ x, y });
    onChange({ x, y });
  };
  
  // Handle mouse/touch move events
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    updatePosition(clientX, clientY);
  };
  
  // Handle mouse/touch up event
  const handleEnd = () => {
    setIsDragging(false);
  };
  
  // Add mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      handleEnd();
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Add touch event handlers
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    const handleTouchEnd = () => {
      handleEnd();
    };
    
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);
  
  // Calculate control dot position
  const controlPosition = {
    left: `${(position.x * 50) + 50}%`,
    top: `${(-position.y * 50) + 50}%`
  };
  
  return (
    <div 
      className="relative glass p-2 rounded-lg" 
      ref={containerRef} 
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches && e.touches[0]) {
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
    >
      <div className="text-xs text-center mb-1">English (Spin)</div>
      <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center relative">
        {/* Crosshairs */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20"></div>
        
        {/* Control dot */}
        <div 
          ref={controlRef}
          className="absolute w-4 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-move"
          style={controlPosition}
        ></div>
        
        {/* Labels */}
        <span className="absolute text-[10px] text-white/50 left-1 top-1">Top-Left</span>
        <span className="absolute text-[10px] text-white/50 right-1 top-1">Top-Right</span>
        <span className="absolute text-[10px] text-white/50 left-1 bottom-1">Bottom-Left</span>
        <span className="absolute text-[10px] text-white/50 right-1 bottom-1">Bottom-Right</span>
      </div>
      <div className="text-[10px] text-center mt-1 text-gray-400">
        X: {position.x.toFixed(2)}, Y: {position.y.toFixed(2)}
      </div>
    </div>
  );
};

export default EnglishControl;

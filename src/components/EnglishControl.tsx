
import { useState } from 'react';

interface EnglishControlProps {
  onChange: (english: { x: number, y: number }) => void;
}

const EnglishControl = ({ onChange }: EnglishControlProps) => {
  const [english, setEnglish] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Handle click on the english control
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    
    // Clamp values to ensure they're within a circle
    const length = Math.sqrt(x * x + y * y);
    const normalizedX = length > 1 ? x / length : x;
    const normalizedY = length > 1 ? y / length : y;
    
    setEnglish({ x: normalizedX, y: normalizedY });
    onChange({ x: normalizedX, y: normalizedY });
  };

  // Reset english to center
  const resetEnglish = () => {
    setEnglish({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  };

  return (
    <div className="english-control glass p-2 rounded-lg">
      <div className="text-xs mb-1 text-center">English Control</div>
      <div 
        className="w-20 h-20 bg-gray-900 rounded-full relative cursor-pointer"
        onClick={handleClick}
      >
        {/* Grid lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600"></div>
        <div className="absolute bottom-0 top-0 left-1/2 w-px bg-gray-600"></div>
        
        {/* Dot indicator */}
        <div 
          className="w-4 h-4 bg-white rounded-full absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${(english.x + 1) * 50}%`, 
            top: `${(english.y + 1) * 50}%`
          }}
        ></div>
        
        {/* Center dot */}
        <div className="w-2 h-2 bg-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <button 
        className="w-full mt-1 text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded"
        onClick={resetEnglish}
      >
        Reset
      </button>
    </div>
  );
};

export default EnglishControl;

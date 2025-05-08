
import { useState } from 'react';

interface EnglishControlProps {
  onChange: (english: { x: number, y: number }) => void;
}

const EnglishControl = ({ onChange }: EnglishControlProps) => {
  const [english, setEnglish] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Handle click or drag on the english control
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
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
  
  // Track mouse movement for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleInteraction(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = e.currentTarget as HTMLDivElement;
      const boundingRect = rect.getBoundingClientRect();
      const x = ((e.clientX - boundingRect.left) / boundingRect.width) * 2 - 1;
      const y = ((e.clientY - boundingRect.top) / boundingRect.height) * 2 - 1;
      
      // Clamp values to ensure they're within a circle
      const length = Math.sqrt(x * x + y * y);
      const normalizedX = length > 1 ? x / length : x;
      const normalizedY = length > 1 ? y / length : y;
      
      setEnglish({ x: normalizedX, y: normalizedY });
      onChange({ x: normalizedX, y: normalizedY });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // English terminology explanations for better user understanding
  const getEnglishDescription = () => {
    if (Math.abs(english.x) < 0.2 && Math.abs(english.y) < 0.2) {
      return "Center";
    }
    
    let description = "";
    
    if (english.y < -0.3) description += "Draw";
    else if (english.y > 0.3) description += "Follow";
    
    if (english.x < -0.3) description += description ? " Left" : "Left";
    else if (english.x > 0.3) description += description ? " Right" : "Right";
    
    return description || "Slight English";
  };

  return (
    <div className="english-control glass p-2 rounded-lg">
      <div className="text-xs mb-1 text-center">English Control</div>
      <div 
        className="w-20 h-20 bg-gray-900 rounded-full relative cursor-pointer"
        onClick={handleInteraction}
        onMouseDown={handleMouseDown}
      >
        {/* Guide circles */}
        <div className="absolute top-1/2 left-1/2 w-3/4 h-3/4 rounded-full border border-gray-600 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-2/4 h-2/4 rounded-full border border-gray-600 transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Grid lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600"></div>
        <div className="absolute bottom-0 top-0 left-1/2 w-px bg-gray-600"></div>
        
        {/* Dot indicator */}
        <div 
          className="w-4 h-4 bg-white rounded-full absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ 
            left: `${(english.x + 1) * 50}%`, 
            top: `${(english.y + 1) * 50}%`,
            boxShadow: "0 0 6px rgba(255,255,255,0.5)"
          }}
        >
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        </div>
        
        {/* Center dot */}
        <div className="w-2 h-2 bg-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="text-xs text-center mt-1 h-4 text-gray-300">
        {getEnglishDescription()}
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

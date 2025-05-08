
import { useEffect, useState } from "react";
import { TABLE_WIDTH, TABLE_HEIGHT } from "@/utils/GamePhysics";

interface CueStickProps {
  aimAngle: number;
  power: number;
  position: { x: number, y: number };
  isPoweringUp: boolean;
  english: { x: number, y: number };
}

const CueStick = ({ aimAngle, power, position, isPoweringUp, english }: CueStickProps) => {
  const [cueColor, setCueColor] = useState("#B86125"); // Default wood color
  
  // Render an effect to show English being applied
  const renderEnglishIndicator = () => {
    if (!english.x && !english.y) return null;
    
    return (
      <div 
        className="absolute w-4 h-4 rounded-full bg-white border border-gray-500 shadow-md"
        style={{
          top: `${position.y / TABLE_HEIGHT * 100}%`,
          left: `${position.x / TABLE_WIDTH * 100}%`,
          transform: `translate(-50%, -50%) translate(${english.x * 10}px, ${english.y * 10}px)`,
          opacity: 0.7,
          zIndex: 25
        }}
      ></div>
    );
  };
  
  // Change cue color based on power for visual feedback
  useEffect(() => {
    if (power < 30) {
      setCueColor("#B86125"); // Light wood for low power
    } else if (power < 70) {
      setCueColor("#8B4513"); // Medium wood for medium power
    } else {
      setCueColor("#654321"); // Dark wood for high power
    }
  }, [power]);
  
  if (!isPoweringUp || !position) return null;
  
  return (
    <>
      {/* Cue stick base */}
      <div 
        className="absolute h-1.5 rounded-full transform origin-right"
        style={{
          backgroundImage: `linear-gradient(90deg, ${cueColor} 50%, #8B4513 98%)`,
          top: `${position.y / TABLE_HEIGHT * 100}%`,
          left: `${position.x / TABLE_WIDTH * 100}%`,
          width: `${30 + power * 0.5}%`,
          transform: `translateY(-50%) rotate(${aimAngle}rad)`,
          zIndex: 20,
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
        }}
      >
        {/* Cue decoration rings */}
        <div className="absolute right-1/4 w-1 h-full bg-white/30"></div>
        <div className="absolute right-1/3 w-1 h-full bg-white/30"></div>
        <div className="absolute right-1/2 w-1 h-full bg-white/30"></div>
      </div>
      
      {/* Cue tip */}
      <div 
        className="absolute h-2.5 w-3 bg-blue-300 rounded-sm transform origin-left"
        style={{
          top: `${position.y / TABLE_HEIGHT * 100}%`,
          left: `${position.x / TABLE_WIDTH * 100}%`,
          transform: `translateY(-50%) rotate(${aimAngle}rad)`,
          zIndex: 21
        }}
      ></div>
      
      {renderEnglishIndicator()}
    </>
  );
};

export default CueStick;

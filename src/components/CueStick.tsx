import React, { useEffect, useState } from "react";
import { TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS } from "@/utils/GamePhysics";

interface CueStickProps {
  aimAngle: number;
  power: number;
  position: { x: number, y: number };
  isPoweringUp: boolean;
  english: { x: number, y: number };
  isBreakShot?: boolean;
}

const CueStick = ({ 
  aimAngle, 
  power, 
  position, 
  isPoweringUp, 
  english,
  isBreakShot = false
}: CueStickProps) => {
  const [cueColor, setCueColor] = useState("#B86125"); // Default wood color
  
  // Calculate ball diameter in pixels for proper offsetting
  const ballDiameter = BALL_RADIUS * 2;
  
  // Adjust offset to position cue stick more accurately - keep it at a distance from the ball
  // We'll dynamically adjust the offset based on power for a better visual effect
  const offset = ballDiameter + 20 + (power * 0.7); // Distance from cue ball center
  
  // Render an effect to show English being applied
  const renderEnglishIndicator = () => {
    if (!english.x && !english.y) return null;
    
    // Show a guide for where the english will be applied
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
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
        </div>
      </div>
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
  
  // Only render the cue stick when actually powering up
  if (!isPoweringUp || !position) return null;
  
  // Calculate cue stick position with proper offset from ball
  // Position the cue AWAY from where user is aiming (opposite direction)
  const stickX = position.x - Math.cos(aimAngle) * offset;
  const stickY = position.y - Math.sin(aimAngle) * offset;
  
  // Calculate cue stick length based on power for visual feedback
  const cueLength = 35 + power * 0.2; // Percentage of table width
  
  return (
    <>
      {/* Cue stick base */}
      <div 
        className="absolute h-3 rounded-full transform origin-left"
        style={{
          backgroundImage: `linear-gradient(90deg, ${cueColor} 50%, #8B4513 98%)`,
          top: `${stickY / TABLE_HEIGHT * 100}%`,
          left: `${stickX / TABLE_WIDTH * 100}%`,
          width: `${cueLength}%`,
          // Set rotation to match aim angle
          transform: `translate(0, -50%) rotate(${aimAngle}rad)`,
          zIndex: 20,
          boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
        }}
      >
        {/* Cue decoration rings */}
        <div className="absolute left-1/4 w-2 h-full bg-white/30 rounded-full"></div>
        <div className="absolute left-1/3 w-2 h-full bg-white/30 rounded-full"></div>
        <div className="absolute left-1/2 w-2 h-full bg-white/30 rounded-full"></div>
      </div>
      
      {/* Cue tip */}
      <div 
        className="absolute h-3 w-4 bg-blue-300 rounded-sm transform origin-left"
        style={{
          top: `${stickY / TABLE_HEIGHT * 100}%`,
          left: `${stickX / TABLE_WIDTH * 100}%`,
          transform: `translate(0, -50%) rotate(${aimAngle}rad)`,
          zIndex: 21
        }}
      ></div>
      
      {/* Power indicator */}
      <div 
        className="absolute h-1.5 transform origin-left"
        style={{
          background: `linear-gradient(90deg, rgba(255,255,255,0.7), transparent)`,
          top: `${stickY / TABLE_HEIGHT * 100}%`,
          left: `${stickX / TABLE_WIDTH * 100}%`,
          width: `${power * 0.6}px`,
          transform: `translate(0, -50%) rotate(${aimAngle}rad)`,
          zIndex: 19,
          opacity: 0.7
        }}
      ></div>
      
      {renderEnglishIndicator()}
      
      {/* Only show Break Shot Indicator during the break shot */}
      {isBreakShot && (
        <div
          className="absolute flex items-center justify-center bg-blue-800 px-4 py-1.5 rounded-full text-white text-sm"
          style={{
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30
          }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Break Shot
        </div>
      )}
    </>
  );
};

export default CueStick;

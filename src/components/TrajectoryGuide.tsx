import { useMemo } from "react";
import { TABLE_WIDTH, TABLE_HEIGHT } from "@/utils/GamePhysics";

interface TrajectoryPoint {
  x: number;
  y: number;
}

interface TrajectoryGuideProps {
  points: TrajectoryPoint[];
  showGuide: boolean;
}

const TrajectoryGuide = ({ points, showGuide }: TrajectoryGuideProps) => {
  const normalizedPoints = useMemo(() => {
    return points.map(p => ({
      x: (p.x / TABLE_WIDTH) * 100,
      y: (p.y / TABLE_HEIGHT) * 100
    }));
  }, [points]);
  
  if (!showGuide || normalizedPoints.length < 2) return null;
  
  // Render a ball at the collision point if we have more than 2 points
  const renderCollisionPoint = () => {
    if (normalizedPoints.length <= 2) return null;
    
    const collisionPoint = normalizedPoints[1];
    
    return (
      <div 
        className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{
          top: `${collisionPoint.y}%`,
          left: `${collisionPoint.x}%`,
          opacity: 0.7,
          zIndex: 15,
          boxShadow: '0 0 4px 2px rgba(255,255,255,0.4)'
        }}
      />
    );
  };
  
  // Calculate offset to prevent overlap with cue stick
  const calculateOffsets = (index: number) => {
    // First segment (from cue ball toward first collision)
    if (index === 0) {
      // Start a bit away from the cue ball center to avoid overlapping the cue
      const startOffset = 3; // Percentage offset from ball center
      
      // Calculate direction vector
      const dx = normalizedPoints[1].x - normalizedPoints[0].x;
      const dy = normalizedPoints[1].y - normalizedPoints[0].y;
      
      // Normalize vector
      const length = Math.sqrt(dx * dx + dy * dy);
      const ndx = dx / length;
      const ndy = dy / length;
      
      // Apply offset to starting point
      const x1 = normalizedPoints[0].x + ndx * startOffset;
      const y1 = normalizedPoints[0].y + ndy * startOffset;
      
      return { x1: `${x1}%`, y1: `${y1}%`, x2: `${normalizedPoints[1].x}%`, y2: `${normalizedPoints[1].y}%` };
    }
    
    // Other segments
    return {
      x1: `${normalizedPoints[index].x}%`, 
      y1: `${normalizedPoints[index].y}%`, 
      x2: `${normalizedPoints[index+1].x}%`, 
      y2: `${normalizedPoints[index+1].y}%`
    };
  };
  
  // Create a dashed gradient line for better visibility on different felt colors
  const createDashedLine = (index: number) => {
    const { x1, y1, x2, y2 } = calculateOffsets(index);
    
    return (
      <line
        key={`line-${index}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={index === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.6)"}
        strokeWidth={index === 0 ? "2" : "1.5"}
        strokeDasharray={index === 0 ? "5,3" : "4,2"}
      />
    );
  };
  
  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* First line segment - from cue ball to first collision */}
        {createDashedLine(0)}
        
        {/* If there are more points, draw the post-collision trajectory */}
        {normalizedPoints.length > 2 && createDashedLine(1)}
      </svg>
      
      {renderCollisionPoint()}
    </>
  );
};

export default TrajectoryGuide;


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
  
  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* First line segment - from cue ball to first collision */}
        <line
          x1={`${normalizedPoints[0].x}%`}
          y1={`${normalizedPoints[0].y}%`}
          x2={`${normalizedPoints[1].x}%`}
          y2={`${normalizedPoints[1].y}%`}
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeDasharray="5,3"
        />
        
        {/* If there are more points, draw the post-collision trajectory */}
        {normalizedPoints.length > 2 && (
          <line
            x1={`${normalizedPoints[1].x}%`}
            y1={`${normalizedPoints[1].y}%`}
            x2={`${normalizedPoints[2].x}%`}
            y2={`${normalizedPoints[2].y}%`}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />
        )}
      </svg>
      
      {renderCollisionPoint()}
    </>
  );
};

export default TrajectoryGuide;

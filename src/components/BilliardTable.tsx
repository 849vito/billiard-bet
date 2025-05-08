import { useCallback, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { useBilliardPhysics } from '@/hooks/useBilliardPhysics';
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from '@/hooks/use-mobile';
import { TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS } from '@/utils/GamePhysics';

interface BilliardTableProps {
  isPracticeMode?: boolean;
}

const BilliardTable = ({ isPracticeMode = false }: BilliardTableProps) => {
  const { currentMatch } = useGame();
  const isMobile = useIsMobile();
  
  const {
    balls,
    power,
    isPoweringUp,
    gameState,
    message,
    aimAngle,
    trajectoryPoints,
    containerRef,
    startPoweringUp,
    takeShot,
    handleMouseMove
  } = useBilliardPhysics();
  
  const [aimDirection, setAimDirection] = useState(0);
  
  // Handle mouse/touch interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const powerInterval = startPoweringUp(x, y);
    
    // Attach event listeners to handle shot
    const handleMouseUp = () => {
      clearInterval(powerInterval);
      takeShot();
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMoveListener);
    };
    
    const handleMouseMoveListener = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMouseMove(x, y);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMoveListener);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const powerInterval = startPoweringUp(x, y);
    
    // Attach event listeners to handle shot
    const handleTouchEnd = () => {
      clearInterval(powerInterval);
      takeShot();
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMoveListener);
    };
    
    const handleTouchMoveListener = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handleMouseMove(x, y);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMoveListener);
  };
  
  // Manual aim controls
  const adjustAim = (direction: 'left' | 'right') => {
    const adjustment = direction === 'left' ? -10 : 10;
    setAimDirection(prev => prev + adjustment);
  };

  // Normalize the position values for rendering
  const normalizePosition = useCallback((x: number, y: number) => {
    return {
      x: (x / TABLE_WIDTH) * 100,
      y: (y / TABLE_HEIGHT) * 100
    };
  }, []);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game header */}
      {!isPracticeMode ? (
        <div className="flex items-center justify-between glass p-3 rounded-t-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-pool-blue flex items-center justify-center text-white font-bold border-2 border-pool-gold">
              Y
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">{currentMatch?.player1Username || "You"}</div>
              <div className="text-xs text-gray-400">Solids</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">Match #{currentMatch?.id?.slice(-4) || "0000"}</div>
            <div className="text-xs text-pool-gold">${currentMatch?.betAmount?.toFixed(2) || "0.00"}</div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-2 text-right">
              <div className="text-sm font-medium">{currentMatch?.player2Username || "Opponent"}</div>
              <div className="text-xs text-gray-400">Stripes</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-pool-blue flex items-center justify-center text-white font-bold border-2 border-white/50">
              O
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center glass p-3 rounded-t-lg">
          <div className="text-center">
            <div className="text-sm font-medium">Practice Mode</div>
            <div className="text-xs text-pool-gold">No Stakes</div>
          </div>
        </div>
      )}
      
      {/* Billiard Table */}
      <div 
        ref={containerRef}
        className="table-cloth relative aspect-video rounded-b-lg border-8 border-pool-wood overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Pockets */}
        <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-black"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-black"></div>
        <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-black"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-black"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-black"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black"></div>
        
        {/* Trajectory guide */}
        {trajectoryPoints.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points={trajectoryPoints.map(p => {
                const normalized = normalizePosition(p.x, p.y);
                return `${normalized.x}% ${normalized.y}%`;
              }).join(' ')}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
              strokeDasharray="5,5"
              fill="none"
            />
          </svg>
        )}
        
        {/* Balls */}
        {balls.map((ball) => (
          !ball.pocketed && (
            <div 
              key={ball.number}
              className="absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-white/20 shadow-md"
              style={{
                top: `${(ball.position.y / TABLE_HEIGHT) * 100}%`,
                left: `${(ball.position.x / TABLE_WIDTH) * 100}%`,
                backgroundColor: ball.color,
                zIndex: ball.number === 0 ? 10 : 5
              }}
            >
              {ball.number > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {ball.number}
                </span>
              )}
            </div>
          )
        ))}
        
        {/* Cue stick when powering up */}
        {isPoweringUp && balls.find(b => b.number === 0 && !b.pocketed) && (
          <div 
            className="absolute h-1 bg-amber-500 rounded-full transform origin-left"
            style={{
              top: `${(balls.find(b => b.number === 0)?.position.y || 0) / TABLE_HEIGHT * 100}%`,
              left: `${(balls.find(b => b.number === 0)?.position.x || 0) / TABLE_WIDTH * 100}%`,
              width: `${20 + power * 0.5}%`,
              transform: `translateY(-50%) rotate(${aimAngle + aimDirection / 100}rad) translateX(-95%)`,
              zIndex: 20
            }}
          ></div>
        )}
        
        {/* Message overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-full text-sm">
          {message}
        </div>
        
        {/* Power meter */}
        <div className="absolute bottom-4 right-4 glass p-2 rounded-lg">
          <div className="text-xs mb-1 text-center">Power</div>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: `${power}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Game controls */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Button variant="ghost" className="glass" onClick={() => adjustAim('left')}>
          Aim Left
        </Button>
        <Button variant="ghost" className="glass">
          Change View
        </Button>
        <Button variant="ghost" className="glass" onClick={() => adjustAim('right')}>
          Aim Right
        </Button>
      </div>
      
      <div className="mt-2 glass p-3 rounded-lg">
        <div className="text-sm mb-2">Game Controls:</div>
        <div className="text-xs text-gray-300 space-y-1">
          <p>• Click and hold to power up your shot</p>
          <p>• Release to take the shot</p>
          <p>• Use the buttons to adjust aim</p>
        </div>
      </div>
    </div>
  );
};

export default BilliardTable;

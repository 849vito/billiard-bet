import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { useBilliardPhysics } from '@/hooks/useBilliardPhysics';
import { useIsMobile } from '@/hooks/use-mobile';
import { TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS, BallType } from '@/utils/GamePhysics';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import CueStick from './CueStick';
import TrajectoryGuide from './TrajectoryGuide';
import GameStatus from './GameStatus';
import EnglishControl from './EnglishControl';

interface BilliardTableProps {
  isPracticeMode?: boolean;
  debugMode?: boolean;
  onShotTaken?: () => void;
  onBallPocketed?: (ballNumber: number) => void;
}

const BilliardTable = ({ 
  isPracticeMode = false, 
  debugMode = false,
  onShotTaken,
  onBallPocketed
}: BilliardTableProps) => {
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
    handleMouseMove,
    playerTurn,
    playerType,
    isBreakShot,
    eightBallPocketable
  } = useBilliardPhysics(isPracticeMode, { onShotTaken, onBallPocketed });
  
  const [aimDirection, setAimDirection] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [english, setEnglish] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [fineControl, setFineControl] = useState(false);
  const [lastShotInfo, setLastShotInfo] = useState<{angle: number, power: number} | null>(null);
  
  // Handle mouse/touch interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameState !== 'waiting') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const powerInterval = startPoweringUp(x, y, english);
    
    // Attach event listeners to handle shot
    const handleMouseUp = () => {
      clearInterval(powerInterval);
      setLastShotInfo({angle: aimAngle, power: power});
      takeShot(english);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMoveListener);
    };
    
    const handleMouseMoveListener = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleMouseMove(x, y, fineControl);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMoveListener);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0 || gameState !== 'waiting') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const powerInterval = startPoweringUp(x, y, english);
    
    // Attach event listeners to handle shot
    const handleTouchEnd = () => {
      clearInterval(powerInterval);
      setLastShotInfo({angle: aimAngle, power: power});
      takeShot(english);
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
      handleMouseMove(x, y, fineControl);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMoveListener);
  };
  
  // Manual aim controls
  const adjustAim = (direction: 'left' | 'right') => {
    const adjustment = direction === 'left' ? -10 : 10;
    setAimDirection(prev => prev + adjustment);
  };
  
  // Fine aim control
  const toggleFineControl = () => {
    setFineControl(!fineControl);
    toast.info(fineControl ? "Standard aiming enabled" : "Fine aiming control enabled");
  };

  // Normalize the position values for rendering
  const normalizePosition = useCallback((x: number, y: number) => {
    return {
      x: (x / TABLE_WIDTH) * 100,
      y: (y / TABLE_HEIGHT) * 100
    };
  }, []);

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };
  
  // Toggle trajectory guide
  const toggleTrajectory = () => {
    setShowTrajectory(!showTrajectory);
  };
  
  // Handle English control change
  const handleEnglishChange = (newEnglish: { x: number, y: number }) => {
    setEnglish(newEnglish);
  };
  
  // Get cue ball for rendering
  const cueBall = balls.find(ball => ball.number === 0 && !ball.pocketed);
  const cueBallPosition = cueBall?.position;
  
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
              <div className="text-xs text-gray-400">{playerType === BallType.SOLID ? "Solids" : playerType === BallType.STRIPE ? "Stripes" : "Not assigned"}</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">Match #{currentMatch?.id?.slice(-4) || "0000"}</div>
            <div className="text-xs text-pool-gold">${currentMatch?.betAmount?.toFixed(2) || "0.00"}</div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-2 text-right">
              <div className="text-sm font-medium">{currentMatch?.player2Username || "Opponent"}</div>
              <div className="text-xs text-gray-400">{playerType === BallType.SOLID ? "Stripes" : playerType === BallType.STRIPE ? "Solids" : "Not assigned"}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-pool-blue flex items-center justify-center text-white font-bold border-2 border-white/50">
              O
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between glass p-3 rounded-t-lg">
          <div className="text-center">
            <div className="text-sm font-medium">Practice Mode</div>
            <div className="text-xs text-pool-gold">No Stakes</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="trajectory-guide" className="text-sm text-gray-300">
                Trajectory
              </Label>
              <Switch 
                id="trajectory-guide" 
                checked={showTrajectory}
                onCheckedChange={toggleTrajectory}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="focus-mode" className="text-sm text-gray-300">
                Focus Mode
              </Label>
              <Switch 
                id="focus-mode" 
                checked={focusMode}
                onCheckedChange={toggleFocusMode}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Billiard Table */}
      <div 
        ref={containerRef}
        className={`table-cloth relative aspect-video rounded-b-lg border-8 border-pool-wood overflow-hidden ${focusMode ? 'bg-table-felt' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={!focusMode ? { 
          backgroundImage: 'radial-gradient(circle at center, #0691d9 0%, #054663 100%)',
        } : {}}
      >
        {/* Table markings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white/10"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10"></div>
          <div className="absolute right-1/4 top-0 bottom-0 w-[1px] bg-white/10"></div>
          
          {/* Head spot */}
          <div className="absolute left-1/4 top-1/2 w-1.5 h-1.5 bg-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Foot spot */}
          <div className="absolute right-1/4 top-1/2 w-1.5 h-1.5 bg-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Center spot */}
          <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-white/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Pockets */}
        <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-black shadow-inner transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 left-1/2 w-8 h-8 rounded-full bg-black shadow-inner transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-black shadow-inner transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-black shadow-inner transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-8 h-8 rounded-full bg-black shadow-inner transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-black shadow-inner transform translate-x-1/2 translate-y-1/2"></div>
        
        {/* Trajectory guide */}
        <TrajectoryGuide 
          points={trajectoryPoints} 
          showGuide={showTrajectory && isPoweringUp}
        />
        
        {/* Balls */}
        {balls.map((ball) => (
          !ball.pocketed && (
            <div 
              key={ball.number}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 ball-shadow"
              style={{
                top: `${(ball.position.y / TABLE_HEIGHT) * 100}%`,
                left: `${(ball.position.x / TABLE_WIDTH) * 100}%`,
                width: `${(BALL_RADIUS * 2) / TABLE_WIDTH * 100}%`,
                height: `${(BALL_RADIUS * 2) / TABLE_HEIGHT * 100}%`,
                borderRadius: '50%',
                backgroundColor: ball.color,
                zIndex: ball.number === 0 ? 10 : 5,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {ball.number > 0 && (
                <div 
                  className={`absolute inset-0 flex items-center justify-center rounded-full 
                    ${ball.number > 8 ? 'striped-ball' : ''} 
                    ${ball.number === 8 ? 'black-ball' : ''}`}
                  style={{
                    overflow: 'hidden'
                  }}
                >
                  {ball.number > 8 && (
                    <div className="absolute inset-x-0 top-0 h-[50%] bg-white"></div>
                  )}
                  
                  <span className={`text-xs font-bold z-10 ${ball.number > 8 ? 'text-black' : 'text-white'}`}>
                    {ball.number}
                  </span>
                </div>
              )}
            </div>
          )
        ))}
        
        {/* Cue stick when powering up */}
        {isPoweringUp && cueBallPosition && (
          <CueStick 
            aimAngle={aimAngle + (aimDirection / 100)} 
            power={power}
            position={cueBallPosition}
            isPoweringUp={isPoweringUp}
            english={english}
          />
        )}
        
        {/* Game status components */}
        <GameStatus 
          playerType={playerType}
          playerTurn={playerTurn}
          message={message}
          eightBallPocketable={eightBallPocketable}
          isBreakShot={isBreakShot}
        />
        
        {/* Power meter */}
        <div className="absolute bottom-4 right-4 glass p-2 rounded-lg">
          <div className="text-xs mb-1 text-center">Power</div>
          <div className="w-32 h-4 bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
              style={{ width: `${power}%` }}
            ></div>
          </div>
        </div>
        
        {/* English control */}
        <div className="absolute bottom-4 left-4">
          <EnglishControl onChange={handleEnglishChange} />
        </div>
        
        {/* Debug information if debug mode is enabled */}
        {debugMode && (
          <div className="absolute top-4 left-4 glass p-2 rounded-lg text-xs">
            <div>Game State: {gameState}</div>
            <div>Aim Angle: {aimAngle.toFixed(2)}</div>
            <div>Power: {power}</div>
            <div>English: x={english.x.toFixed(2)}, y={english.y.toFixed(2)}</div>
            {lastShotInfo && (
              <>
                <div>Last Shot Angle: {lastShotInfo.angle.toFixed(2)}</div>
                <div>Last Shot Power: {lastShotInfo.power}</div>
              </>
            )}
          </div>
        )}
        
        {/* Instructions overlay for focus mode */}
        {focusMode && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-white text-xl font-bold opacity-30 pointer-events-none">
            <div>
              Press button, drag mouse, and release
              <div className="text-base mt-4">to apply power to the cue</div>
            </div>
          </div>
        )}
        
        {/* Pocket preview */}
        <div className="absolute top-10 right-4 glass p-2 rounded-lg">
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={`solid-${i+1}`} 
                className={`w-4 h-4 rounded-full ${playerType === BallType.SOLID ? 'ring-1 ring-offset-1 ring-white/30' : ''}`}
                style={{ 
                  backgroundColor: balls.find(b => b.number === i+1)?.pocketed ? 'transparent' : balls.find(b => b.number === i+1)?.color,
                  opacity: balls.find(b => b.number === i+1)?.pocketed ? 0.3 : 1,
                  border: balls.find(b => b.number === i+1)?.pocketed ? '1px solid white' : 'none'
                }}
              >
                {!balls.find(b => b.number === i+1)?.pocketed && (
                  <span className="text-[8px] flex items-center justify-center h-full text-white">{i+1}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={`stripe-${i+8}`} 
                className={`w-4 h-4 rounded-full overflow-hidden ${playerType === BallType.STRIPE ? 'ring-1 ring-offset-1 ring-white/30' : ''}`}
                style={{ 
                  backgroundColor: balls.find(b => b.number === i+8)?.pocketed ? 'transparent' : balls.find(b => b.number === i+8)?.color,
                  opacity: balls.find(b => b.number === i+8)?.pocketed ? 0.3 : 1,
                  border: balls.find(b => b.number === i+8)?.pocketed ? '1px solid white' : 'none'
                }}
              >
                {!balls.find(b => b.number === i+8)?.pocketed && (
                  <>
                    <div className="bg-white h-[50%] w-full"></div>
                    <span className="text-[8px] absolute inset-0 flex items-center justify-center text-black">{i+8}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Game controls */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Button variant="ghost" className="glass" onClick={() => adjustAim('left')}>
          Aim Left
        </Button>
        <Button variant="ghost" className="glass" onClick={toggleFineControl}>
          {fineControl ? "Standard Aim" : "Fine Control"}
        </Button>
        <Button variant="ghost" className="glass" onClick={() => adjustAim('right')}>
          Aim Right
        </Button>
      </div>
      
      <div className="mt-2 glass p-3 rounded-lg">
        <div className="text-sm mb-2">Game Controls:</div>
        <div className="text-xs text-gray-300 space-y-1">
          <p>• Click and hold on the cue ball to aim</p>
          <p>• Drag away from the cue ball to increase power</p>
          <p>• Release to take the shot</p>
          <p>• Use the English control in the bottom left to add spin</p>
          <p>• Use "Fine Control" for precise aiming</p>
        </div>
      </div>
    </div>
  );
};

export default BilliardTable;

// Add styles for striped balls
const styles = `
  .striped-ball::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background-color: white;
    border-top-left-radius: 100%;
    border-top-right-radius: 100%;
  }
  
  .ball-shadow {
    box-shadow: 0 3px 6px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 3px rgba(255,255,255,0.3);
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

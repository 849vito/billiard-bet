
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

type Ball = {
  number: number;
  position: { x: number, y: number };
  pocketed: boolean;
  color: string;
};

const BilliardTable = () => {
  const { currentMatch } = useGame();
  const [power, setPower] = useState(0);
  const [isPoweringUp, setIsPoweringUp] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [message, setMessage] = useState("");

  // Initialize balls
  useEffect(() => {
    const initialBalls: Ball[] = [
      { number: 0, position: { x: 25, y: 50 }, pocketed: false, color: 'white' }, // Cue ball
      { number: 1, position: { x: 75, y: 45 }, pocketed: false, color: 'yellow' },
      { number: 2, position: { x: 75, y: 47 }, pocketed: false, color: 'blue' },
      { number: 3, position: { x: 75, y: 50 }, pocketed: false, color: 'red' },
      { number: 4, position: { x: 75, y: 53 }, pocketed: false, color: 'purple' },
      { number: 5, position: { x: 75, y: 55 }, pocketed: false, color: 'orange' },
      { number: 6, position: { x: 78, y: 46 }, pocketed: false, color: 'green' },
      { number: 7, position: { x: 78, y: 48 }, pocketed: false, color: 'brown' },
      { number: 8, position: { x: 78, y: 50 }, pocketed: false, color: 'black' },
      { number: 9, position: { x: 78, y: 52 }, pocketed: false, color: 'yellow' },
      { number: 10, position: { x: 78, y: 54 }, pocketed: false, color: 'blue' },
      { number: 11, position: { x: 81, y: 47 }, pocketed: false, color: 'red' },
      { number: 12, position: { x: 81, y: 49 }, pocketed: false, color: 'purple' },
      { number: 13, position: { x: 81, y: 51 }, pocketed: false, color: 'orange' },
      { number: 14, position: { x: 81, y: 53 }, pocketed: false, color: 'green' },
      { number: 15, position: { x: 84, y: 48 }, pocketed: false, color: 'brown' }
    ];
    
    setBalls(initialBalls);
    setMessage("Your turn! Click and hold to power up the shot.");
  }, [currentMatch]);

  const startPoweringUp = () => {
    setIsPoweringUp(true);
    const powerInterval = setInterval(() => {
      setPower(prev => {
        if (prev >= 100) {
          clearInterval(powerInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Store the interval ID for cleanup
    return powerInterval;
  };

  const takeShot = () => {
    setIsPoweringUp(false);
    setMessage(`Shot taken with ${power}% power!`);
    
    // In a real implementation, this would trigger ball physics
    // For now, we'll just reset the power
    setTimeout(() => {
      setPower(0);
      setMessage("Your opponent's turn...");
      
      // After a delay, switch back to player's turn
      setTimeout(() => {
        setMessage("Your turn again! Click and hold to power up the shot.");
      }, 3000);
    }, 1000);
  };

  const handleMouseDown = () => {
    const powerInterval = startPoweringUp();
    
    // Attach event listeners to handle shot
    const handleMouseUp = () => {
      clearInterval(powerInterval);
      takeShot();
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = () => {
    const powerInterval = startPoweringUp();
    
    // Attach event listeners to handle shot
    const handleTouchEnd = () => {
      clearInterval(powerInterval);
      takeShot();
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game header */}
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
      
      {/* Billiard Table */}
      <div 
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
        
        {/* Balls */}
        {balls.map((ball) => (
          !ball.pocketed && (
            <div 
              key={ball.number}
              className="absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-white/20 shadow-md"
              style={{
                top: `${ball.position.y}%`,
                left: `${ball.position.x}%`,
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
        {isPoweringUp && (
          <div 
            className="absolute h-1 bg-amber-500 rounded-full transform origin-left"
            style={{
              top: `${balls[0]?.position.y}%`,
              left: `${balls[0]?.position.x}%`,
              width: `${20 + power * 0.5}%`,
              transform: 'translateY(-50%) rotate(-30deg) translateX(-95%)',
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
        <Button variant="ghost" className="glass">
          Aim Left
        </Button>
        <Button variant="ghost" className="glass">
          Change View
        </Button>
        <Button variant="ghost" className="glass">
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

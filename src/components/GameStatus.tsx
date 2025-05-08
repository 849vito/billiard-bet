
import { BallType } from "@/utils/GamePhysics";
import { Badge } from "@/components/ui/badge";

interface GameStatusProps {
  playerType: BallType | null;
  playerTurn: 'player' | 'opponent';
  message: string;
  eightBallPocketable: boolean;
  isBreakShot: boolean;
}

const GameStatus = ({ 
  playerType, 
  playerTurn, 
  message, 
  eightBallPocketable,
  isBreakShot
}: GameStatusProps) => {
  return (
    <>
      {/* Player status */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">
        <div className={`w-3 h-3 rounded-full ${playerTurn === 'player' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span>
          {isBreakShot ? 'Break Shot' : playerTurn === 'player' ? 'Your Turn' : 'Opponent Turn'}
        </span>
        {playerType && (
          <Badge variant="outline" className={playerType === BallType.SOLID ? 'bg-yellow-800/30 text-yellow-300' : 'bg-blue-800/30 text-blue-300'}>
            {playerType === BallType.SOLID ? 'Solids' : 'Stripes'}
          </Badge>
        )}
        {eightBallPocketable && (
          <Badge variant="outline" className="bg-green-800/30 text-green-300 animate-pulse">
            8-Ball Ready
          </Badge>
        )}
      </div>
      
      {/* Game message */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-full text-sm">
        {message}
      </div>
    </>
  );
};

export default GameStatus;

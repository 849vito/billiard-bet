
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

type GameMode = 'casual' | 'ranked' | 'tournament';

type GameMatch = {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Username: string;
  player2Username: string;
  player1Avatar: string;
  player2Avatar: string;
  betAmount: number;
  status: 'waiting' | 'in-progress' | 'completed';
  winner?: string;
  createdAt: Date;
};

type GameContextType = {
  availableMatches: GameMatch[];
  currentMatch: GameMatch | null;
  loading: boolean;
  findMatch: (mode: GameMode, betAmount: number) => Promise<void>;
  joinMatch: (matchId: string) => Promise<void>;
  leaveMatch: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const [availableMatches, setAvailableMatches] = useState<GameMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<GameMatch | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock matches for demo
  const generateMockMatch = (betAmount: number): GameMatch => {
    const opponentId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    return {
      id: 'match_' + Math.random().toString(36).substr(2, 9),
      player1Id: user?.id || '',
      player2Id: opponentId,
      player1Username: user?.username || 'Anonymous',
      player2Username: `Player_${Math.floor(Math.random() * 1000)}`,
      player1Avatar: user?.avatar || '/avatars/default.png',
      player2Avatar: `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
      betAmount,
      status: 'waiting',
      createdAt: new Date()
    };
  };

  const findMatch = async (mode: GameMode, betAmount: number) => {
    if (!user) {
      toast.error("Please login to find a match");
      return;
    }

    if (betAmount > balance) {
      toast.error("Insufficient funds in wallet");
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, this would make an API call to matchmaking service
      // For demo, we'll just create a new mock match after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMatch = generateMockMatch(betAmount);
      
      // Add to available matches
      setAvailableMatches(prev => [newMatch, ...prev]);
      setCurrentMatch(newMatch);
      
      toast.success("Match found! Waiting for opponent...");
    } catch (error) {
      console.error("Finding match failed:", error);
      toast.error("Failed to find match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinMatch = async (matchId: string) => {
    if (!user) {
      toast.error("Please login to join a match");
      return;
    }
    
    try {
      setLoading(true);
      
      const match = availableMatches.find(m => m.id === matchId);
      
      if (!match) {
        toast.error("Match not found");
        return;
      }
      
      if (match.betAmount > balance) {
        toast.error("Insufficient funds in wallet");
        return;
      }
      
      // In a real app, this would make an API call to join the match
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update match status
      const updatedMatch = { ...match, status: 'in-progress' as const };
      setCurrentMatch(updatedMatch);
      
      // Remove from available matches
      setAvailableMatches(prev => prev.filter(m => m.id !== matchId));
      
      toast.success("Joined match successfully!");
    } catch (error) {
      console.error("Joining match failed:", error);
      toast.error("Failed to join match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const leaveMatch = () => {
    if (currentMatch) {
      setCurrentMatch(null);
      toast.info("Left the match");
    }
  };

  return (
    <GameContext.Provider value={{
      availableMatches,
      currentMatch,
      loading,
      findMatch,
      joinMatch,
      leaveMatch
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

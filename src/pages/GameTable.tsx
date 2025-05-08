
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopNavigation from "@/components/TopNavigation";
import BilliardTable from "@/components/BilliardTable";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { toast } from "sonner";

const GameTable = () => {
  const { id } = useParams();
  const { currentMatch, leaveMatch, availableMatches, joinMatch } = useGame();
  const navigate = useNavigate();
  
  // If no current match is set but we have an ID, try to join that match
  useEffect(() => {
    // If we already have the match loaded, don't do anything
    if (currentMatch && currentMatch.id === id) {
      return;
    }
    
    // If we don't have a current match but have an ID, try to find and join that match
    if (id && !currentMatch) {
      const match = availableMatches.find(m => m.id === id);
      if (match) {
        // Join the match from the URL
        joinMatch(id);
      } else {
        // Match not found in available matches
        toast.error("Match not found");
        navigate("/dashboard");
      }
    }
  }, [id, currentMatch, availableMatches, joinMatch, navigate]);

  // Redirect to dashboard if no active match and no ID
  useEffect(() => {
    if (!currentMatch && !id) {
      navigate("/dashboard");
    }
  }, [currentMatch, id, navigate]);

  const handleLeaveMatch = () => {
    leaveMatch();
    navigate("/dashboard");
  };

  if (!currentMatch) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNavigation />
        <main className="flex-1 pt-20 pb-10 px-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-medium">Loading match...</h2>
            <p className="text-gray-400 mt-2">Please wait while we prepare your game</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Game Table</h1>
              <p className="text-gray-400">Match #{currentMatch.id.slice(-4)} • ${currentMatch.betAmount.toFixed(2)} Bet</p>
            </div>
            <Button variant="outline" className="border-white/20" onClick={handleLeaveMatch}>
              Leave Match
            </Button>
          </div>
          
          <BilliardTable />
        </div>
      </main>
    </div>
  );
};

export default GameTable;

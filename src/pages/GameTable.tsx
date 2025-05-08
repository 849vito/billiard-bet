
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavigation from "@/components/TopNavigation";
import BilliardTable from "@/components/BilliardTable";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";

const GameTable = () => {
  const { currentMatch, leaveMatch } = useGame();
  const navigate = useNavigate();

  // Redirect to dashboard if no active match
  useEffect(() => {
    if (!currentMatch) {
      navigate("/dashboard");
    }
  }, [currentMatch, navigate]);

  const handleLeaveMatch = () => {
    leaveMatch();
    navigate("/dashboard");
  };

  if (!currentMatch) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4">
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

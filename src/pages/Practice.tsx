
import { useState, useEffect } from "react";
import TopNavigation from "@/components/TopNavigation";
import BilliardTable from "@/components/BilliardTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import TutorialModal from "@/components/TutorialModal";

const Practice = () => {
  const [resetKey, setResetKey] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check local storage for tutorial preference
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("pool_tutorial_seen");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleResetTable = () => {
    setResetKey(prev => prev + 1);
  };

  const handleCloseTutorial = (dontShowAgain: boolean) => {
    setShowTutorial(false);
    if (dontShowAgain) {
      localStorage.setItem("pool_tutorial_seen", "true");
    }
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Practice Mode</h1>
              <p className="text-gray-400">Improve your skills without pressure</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-white/20"
                onClick={handleShowTutorial}
              >
                How to Play
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 flex items-center gap-2"
                onClick={handleResetTable}
              >
                <RefreshCw className="w-4 h-4" /> Reset Table
              </Button>
            </div>
          </div>
          
          <BilliardTable key={resetKey} isPracticeMode={true} />
          
          <div className="mt-6 glass p-4 rounded-lg max-w-lg mx-auto">
            <h2 className="text-lg font-medium mb-3">8-Ball Rules</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Break the rack and try to pocket a ball</li>
              <li>• Your ball type (solids or stripes) is determined by the first ball you pocket</li>
              <li>• Pocket all your balls and then the 8-ball to win</li>
              <li>• Pocketing the 8-ball early or scratching on the 8-ball results in a loss</li>
            </ul>
          </div>
        </div>
      </main>

      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
    </div>
  );
};

export default Practice;

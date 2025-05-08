
import { useState } from "react";
import TopNavigation from "@/components/TopNavigation";
import BilliardTable from "@/components/BilliardTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Practice = () => {
  const [resetKey, setResetKey] = useState(0);

  const handleResetTable = () => {
    setResetKey(prev => prev + 1);
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
            <Button 
              variant="outline" 
              className="border-white/20 flex items-center gap-2"
              onClick={handleResetTable}
            >
              <RefreshCw className="w-4 h-4" /> Reset Table
            </Button>
          </div>
          
          <BilliardTable key={resetKey} isPracticeMode={true} />
          
          <div className="mt-6 glass p-4 rounded-lg max-w-lg mx-auto">
            <h2 className="text-lg font-medium mb-3">Practice Tips</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Use practice mode to perfect your shots without affecting your stats</li>
              <li>• Try different angles and power levels to understand ball physics</li>
              <li>• Practice bank shots by bouncing the cue ball off cushions</li>
              <li>• Reset the table anytime to start fresh</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Practice;

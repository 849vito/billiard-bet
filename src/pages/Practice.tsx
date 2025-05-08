
import { useState, useEffect } from "react";
import TopNavigation from "@/components/TopNavigation";
import BilliardTable from "@/components/BilliardTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, HelpCircle, Save, Timer } from "lucide-react";
import TutorialModal from "@/components/TutorialModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Practice = () => {
  const [resetKey, setResetKey] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [ballsPocketed, setBallsPocketed] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Check local storage for tutorial preference
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("pool_tutorial_seen");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Start a practice session when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      startNewSession();
    }
  }, [isAuthenticated, user]);

  // Update session duration every second
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const durationInSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      setSessionDuration(durationInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Save session when unmounting component
  useEffect(() => {
    return () => {
      if (sessionId && isAuthenticated) {
        saveSession();
      }
    };
  }, [sessionId, isAuthenticated, shotsTaken, ballsPocketed]);

  const startNewSession = async () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to track practice sessions");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          shots_taken: 0,
          balls_pocketed: 0
        })
        .select('id')
        .single();

      if (error) {
        console.error("Error starting practice session:", error);
        toast.error("Failed to start practice session");
        return;
      }

      setSessionId(data.id);
      setSessionStartTime(new Date());
      setShotsTaken(0);
      setBallsPocketed(0);
      toast.success("Practice session started");
    } catch (err) {
      console.error("Error in practice session setup:", err);
    }
  };

  const saveSession = async () => {
    if (!sessionId || !isAuthenticated || !user) return;

    try {
      const { error } = await supabase
        .from('practice_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration: sessionDuration,
          shots_taken: shotsTaken,
          balls_pocketed: ballsPocketed
        })
        .eq('id', sessionId);

      if (error) {
        console.error("Error saving practice session:", error);
        return;
      }

      toast.success("Practice session saved");
    } catch (err) {
      console.error("Error in saving practice session:", err);
    }
  };

  const handleResetTable = () => {
    setResetKey(prev => prev + 1);
    toast.info("Table reset! All balls have been repositioned.");
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

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    toast.info(debugMode ? "Debug mode disabled" : "Debug mode enabled");
  };

  const handleShotTaken = () => {
    setShotsTaken(prev => prev + 1);
  };

  const handleBallPocketed = () => {
    setBallsPocketed(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = () => {
    if (isAuthenticated) {
      saveSession();
      toast.success("Practice session saved");
    } else {
      toast.error("You must be logged in to save sessions");
    }
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
              {isAuthenticated && (
                <div className="flex items-center gap-2 mr-2 bg-black/30 px-3 py-1 rounded-md">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">{formatTime(sessionDuration)}</span>
                  <span className="mx-1">|</span>
                  <span className="text-sm">Shots: {shotsTaken}</span>
                  <span className="mx-1">|</span>
                  <span className="text-sm">Pocketed: {ballsPocketed}</span>
                </div>
              )}
              <Button 
                variant="outline" 
                className="border-white/20 flex items-center gap-2"
                onClick={handleShowTutorial}
              >
                <HelpCircle className="w-4 h-4" /> How to Play
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 flex items-center gap-2"
                onClick={handleResetTable}
              >
                <RefreshCw className="w-4 h-4" /> Reset Table
              </Button>
              <Button
                variant="outline"
                className={`border-white/20 ${debugMode ? 'bg-red-500/20' : ''}`}
                onClick={toggleDebugMode}
              >
                {debugMode ? 'Disable Debug' : 'Enable Debug'}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  className="border-white/20 flex items-center gap-2"
                  onClick={handleSaveSession}
                >
                  <Save className="w-4 h-4" /> Save Session
                </Button>
              )}
            </div>
          </div>
          
          <BilliardTable 
            key={resetKey} 
            isPracticeMode={true} 
            debugMode={debugMode}
            onShotTaken={handleShotTaken}
            onBallPocketed={handleBallPocketed} 
          />
          
          <div className="mt-6 glass p-4 rounded-lg max-w-lg mx-auto">
            <h2 className="text-lg font-medium mb-3">8-Ball Rules</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Break the rack and try to pocket a ball</li>
              <li>• Your ball type (solids or stripes) is determined by the first ball you pocket</li>
              <li>• Pocket all your balls and then the 8-ball to win</li>
              <li>• Pocketing the 8-ball early or scratching on the 8-ball results in a loss</li>
              <li>• Apply english (spin) by using the control in the bottom left corner</li>
            </ul>
          </div>
        </div>
      </main>

      {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
    </div>
  );
};

export default Practice;

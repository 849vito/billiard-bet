
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, BarChart } from 'lucide-react';

type PracticeStats = {
  totalSessions: number;
  totalShots: number;
  totalBallsPocketed: number;
  highestPotsPerSession: number;
  totalSessionDuration: number;
};

const PracticeTracker = () => {
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      loadStats();
    }
  }, [isAuthenticated, user]);
  
  const loadStats = async () => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    
    try {
      // Get total sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('practice_sessions')
        .select('id, duration, shots_taken, balls_pocketed')
        .eq('user_id', user.id);
        
      if (sessionsError) {
        throw sessionsError;
      }
      
      if (sessionsData && sessionsData.length > 0) {
        const totalSessions = sessionsData.length;
        const totalShots = sessionsData.reduce((sum, session) => sum + (session.shots_taken || 0), 0);
        const totalBallsPocketed = sessionsData.reduce((sum, session) => sum + (session.balls_pocketed || 0), 0);
        const highestPotsPerSession = Math.max(...sessionsData.map(session => session.balls_pocketed || 0));
        const totalSessionDuration = sessionsData.reduce((sum, session) => sum + (session.duration || 0), 0);
        
        setStats({
          totalSessions,
          totalShots,
          totalBallsPocketed,
          highestPotsPerSession,
          totalSessionDuration
        });
      } else {
        setStats({
          totalSessions: 0,
          totalShots: 0,
          totalBallsPocketed: 0,
          highestPotsPerSession: 0,
          totalSessionDuration: 0
        });
      }
    } catch (error) {
      console.error("Error loading practice stats:", error);
      toast.error("Failed to load practice statistics");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };
  
  if (!isAuthenticated || !user) {
    return (
      <div className="mt-4 glass p-4 rounded-lg">
        <p className="text-center text-sm text-gray-300">
          <Button variant="outline" className="border-white/20" size="sm" onClick={() => window.location.href = '/login'}>
            Login to track your practice statistics
          </Button>
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-4 glass p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium flex items-center gap-2">
          <BarChart className="w-4 h-4" /> Practice Statistics
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs"
          onClick={loadStats}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <p className="text-center text-sm text-gray-400">Loading statistics...</p>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Total Sessions</p>
            <p className="text-lg font-bold">{stats.totalSessions}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Shots</p>
            <p className="text-lg font-bold">{stats.totalShots}</p>
          </div>
          <div>
            <p className="text-gray-400">Balls Pocketed</p>
            <p className="text-lg font-bold">{stats.totalBallsPocketed}</p>
          </div>
          <div>
            <p className="text-gray-400">Potting Accuracy</p>
            <p className="text-lg font-bold">
              {stats.totalShots > 0 ? `${Math.round((stats.totalBallsPocketed / stats.totalShots) * 100)}%` : '0%'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400">Total Practice Time</p>
            <p className="text-lg font-bold">{formatTime(stats.totalSessionDuration)}</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400">No practice data yet. Keep playing!</p>
      )}
    </div>
  );
};

export default PracticeTracker;

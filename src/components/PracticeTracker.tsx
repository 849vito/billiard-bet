
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

type PracticeStats = {
  totalShots: number;
  totalBallsPocketed: number;
  accuracy: number;
  sessionsCompleted: number;
  totalPracticeTime: number;
  lastWeekStats: {
    date: string;
    shots: number;
    pocketed: number;
  }[];
};

const PracticeTracker = () => {
  const [stats, setStats] = useState<PracticeStats>({
    totalShots: 0,
    totalBallsPocketed: 0,
    accuracy: 0,
    sessionsCompleted: 0,
    totalPracticeTime: 0,
    lastWeekStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.id) {
      loadStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Check if user.id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user?.id || '')) {
        console.log("User ID is not a valid UUID format. Using sample statistics.");
        // Set sample stats for display
        setStats({
          totalShots: 256,
          totalBallsPocketed: 127,
          accuracy: 49.6,
          sessionsCompleted: 15,
          totalPracticeTime: 7845, // in seconds
          lastWeekStats: [
            { date: 'Mon', shots: 42, pocketed: 18 },
            { date: 'Tue', shots: 36, pocketed: 15 },
            { date: 'Wed', shots: 58, pocketed: 32 },
            { date: 'Thu', shots: 0, pocketed: 0 },
            { date: 'Fri', shots: 48, pocketed: 27 },
            { date: 'Sat', shots: 72, pocketed: 35 },
            { date: 'Sun', shots: 0, pocketed: 0 },
          ]
        });
        setIsLoading(false);
        return;
      }

      // Load practice sessions
      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });
        
      if (error) {
        console.error("Error loading practice stats:", error);
        setIsLoading(false);
        return;
      }
      
      // Calculate stats
      const totalShots = sessions?.reduce((sum, session) => sum + (session.shots_taken || 0), 0) || 0;
      const totalBallsPocketed = sessions?.reduce((sum, session) => sum + (session.balls_pocketed || 0), 0) || 0;
      const accuracy = totalShots > 0 ? (totalBallsPocketed / totalShots) * 100 : 0;
      const sessionsCompleted = sessions?.length || 0;
      const totalPracticeTime = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      
      // Get stats for the last week
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Group sessions by day for the last week
      const weekStats: Record<string, { shots: number, pocketed: number }> = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize all days with 0
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        weekStats[dayName] = { shots: 0, pocketed: 0 };
      }
      
      // Fill in data from sessions
      sessions?.forEach(session => {
        if (session.start_time) {
          const sessionDate = new Date(session.start_time);
          if (sessionDate > lastWeek) {
            const dayName = days[sessionDate.getDay()];
            weekStats[dayName].shots += (session.shots_taken || 0);
            weekStats[dayName].pocketed += (session.balls_pocketed || 0);
          }
        }
      });
      
      // Convert to array for chart
      const lastWeekStats = Object.keys(weekStats).map(date => ({
        date,
        shots: weekStats[date].shots,
        pocketed: weekStats[date].pocketed
      }));
      
      // Update state with calculated stats
      setStats({
        totalShots,
        totalBallsPocketed,
        accuracy: parseFloat(accuracy.toFixed(1)),
        sessionsCompleted,
        totalPracticeTime,
        lastWeekStats
      });
      
    } catch (err) {
      console.error("Error loading practice statistics:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format time from seconds to hours, minutes, seconds
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${remainingSeconds}s`;
  };
  
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Practice Statistics</CardTitle>
          <CardDescription>Loading your practice data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Practice Statistics</CardTitle>
        <CardDescription>Track your progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.totalShots}</div>
            <div className="text-sm text-gray-400">Total Shots</div>
          </div>
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.totalBallsPocketed}</div>
            <div className="text-sm text-gray-400">Balls Pocketed</div>
          </div>
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div className="glass p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{formatTime(stats.totalPracticeTime)}</div>
            <div className="text-sm text-gray-400">Total Practice Time</div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.lastWeekStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid #444',
                  borderRadius: '4px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="shots" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Shots Taken"
              />
              <Line 
                type="monotone" 
                dataKey="pocketed" 
                stroke="#82ca9d" 
                activeDot={{ r: 8 }}
                name="Balls Pocketed" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeTracker;

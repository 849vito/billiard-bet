
import TopNavigation from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trophy, Calendar, Users, DollarSign } from "lucide-react";

const Tournaments = () => {
  const upcomingTournaments = [
    {
      id: "t1",
      name: "Weekend Cash Cup",
      prize: 500,
      entryFee: 10,
      players: 32,
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: "registering"
    },
    {
      id: "t2",
      name: "Pro League Qualifier",
      prize: 1000,
      entryFee: 25,
      players: 64,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: "registering"
    },
    {
      id: "t3",
      name: "High Stakes Champion",
      prize: 5000,
      entryFee: 100,
      players: 32,
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: "registering"
    }
  ];
  
  const liveTournaments = [
    {
      id: "t4",
      name: "Daily Prize Pool",
      prize: 250,
      players: 16,
      currentRound: "Quarter-Finals",
      status: "live"
    }
  ];
  
  const completedTournaments = [
    {
      id: "t5",
      name: "Weekly Cup #42",
      prize: 750,
      players: 32,
      winner: "PoolShark92",
      status: "completed"
    },
    {
      id: "t6",
      name: "Amateurs League",
      prize: 300,
      players: 16,
      winner: "CueMaster",
      status: "completed"
    },
    {
      id: "t7",
      name: "Pro Series Invitational",
      prize: 2500,
      players: 16,
      winner: "BilliardKing",
      status: "completed"
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = (id: string, name: string) => {
    toast.success(`Successfully registered for ${name}`);
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for tournament ${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tournaments</h1>
          
          <div className="space-y-10">
            {/* Live Tournaments */}
            {liveTournaments.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                  Live Tournaments
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {liveTournaments.map((tournament) => (
                    <Card key={tournament.id} className="glass border-white/10 overflow-hidden">
                      <div className="bg-gradient-to-r from-red-500 to-red-700 h-1"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Trophy className="w-5 h-5 mr-2 text-red-500" />
                            {tournament.name}
                          </CardTitle>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
                            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>
                            LIVE
                          </span>
                        </div>
                        <CardDescription>
                          Currently in {tournament.currentRound}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-pool-gold" />
                            <span className="text-pool-gold font-medium">${tournament.prize} Prize</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-gray-400">{tournament.players} Players</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleViewDetails(tournament.id)}
                        >
                          Watch Live
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upcoming Tournaments */}
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Tournaments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTournaments.map((tournament) => (
                  <Card key={tournament.id} className="glass border-white/10 overflow-hidden">
                    <div className="bg-gradient-to-r from-pool-gold to-amber-500 h-1"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{tournament.name}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Starts {formatDate(tournament.startTime)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-pool-gold" />
                          <span className="text-pool-gold font-medium">${tournament.prize} Prize</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-400">{tournament.players} Players</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-400">${tournament.entryFee} Entry</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black"
                          onClick={() => handleRegister(tournament.id, tournament.name)}
                        >
                          Register
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full border-white/20"
                          onClick={() => handleViewDetails(tournament.id)}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Completed Tournaments */}
            <div>
              <h2 className="text-xl font-bold mb-4">Past Tournaments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTournaments.map((tournament) => (
                  <Card key={tournament.id} className="glass border-white/10 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-1"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{tournament.name}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center">
                        <Trophy className="w-4 h-4 mr-1" />
                        Winner: {tournament.winner}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-pool-gold" />
                          <span className="text-pool-gold font-medium">${tournament.prize} Prize</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-400">{tournament.players} Players</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-white/20"
                        onClick={() => handleViewDetails(tournament.id)}
                      >
                        View Results
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Tournament Rules */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Tournament Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• All tournaments follow standard 8-ball pool rules.</p>
                <p>• Players must be present 10 minutes before match start time.</p>
                <p>• Match timeouts are limited to one 2-minute timeout per match.</p>
                <p>• Tournament prizes are transferred to the winner's wallet upon tournament completion.</p>
                <p>• A platform fee of 10% is applied to all tournament prize pools.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tournaments;

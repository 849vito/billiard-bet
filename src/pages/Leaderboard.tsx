
import TopNavigation from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Trophy, DollarSign, Target, Users } from "lucide-react";

const Leaderboard = () => {
  const { user } = useAuth();
  
  const earningsLeaderboard = [
    { rank: 1, username: "PoolShark92", earnings: 12450, avatar: "/avatars/avatar-1.png" },
    { rank: 2, username: "BilliardKing", earnings: 8320, avatar: "/avatars/avatar-2.png" },
    { rank: 3, username: "CueMaster", earnings: 6780, avatar: "/avatars/avatar-3.png" },
    { rank: 4, username: "ShotCaller", earnings: 5430, avatar: "/avatars/avatar-4.png" },
    { rank: 5, username: "PocketAce", earnings: 4290, avatar: "/avatars/avatar-5.png" },
    { rank: 6, username: "NineBall", earnings: 3150, avatar: "/avatars/avatar-1.png" },
    { rank: 7, username: "TableRunner", earnings: 2840, avatar: "/avatars/avatar-2.png" },
    { rank: 8, username: "CueControl", earnings: 2650, avatar: "/avatars/avatar-3.png" },
    { rank: 9, username: "StickMaster", earnings: 2340, avatar: "/avatars/avatar-4.png" },
    { rank: 10, username: "BankShot", earnings: 2120, avatar: "/avatars/avatar-5.png" }
  ];
  
  const winRateLeaderboard = [
    { rank: 1, username: "PocketPro", winRate: 87.5, wins: 70, losses: 10, avatar: "/avatars/avatar-3.png" },
    { rank: 2, username: "ShotCaller", winRate: 82.3, wins: 65, losses: 14, avatar: "/avatars/avatar-4.png" },
    { rank: 3, username: "BilliardKing", winRate: 79.0, wins: 79, losses: 21, avatar: "/avatars/avatar-2.png" },
    { rank: 4, username: "PoolShark92", winRate: 78.4, wins: 91, losses: 25, avatar: "/avatars/avatar-1.png" },
    { rank: 5, username: "CueMaster", winRate: 74.6, wins: 53, losses: 18, avatar: "/avatars/avatar-3.png" },
    { rank: 6, username: "NineBall", winRate: 72.0, wins: 36, losses: 14, avatar: "/avatars/avatar-1.png" },
    { rank: 7, username: "TableRunner", winRate: 70.2, wins: 40, losses: 17, avatar: "/avatars/avatar-2.png" },
    { rank: 8, username: "CueControl", winRate: 68.5, wins: 37, losses: 17, avatar: "/avatars/avatar-3.png" },
    { rank: 9, username: "StickMaster", winRate: 67.9, wins: 36, losses: 17, avatar: "/avatars/avatar-4.png" },
    { rank: 10, username: "BankShot", winRate: 66.7, wins: 34, losses: 17, avatar: "/avatars/avatar-5.png" }
  ];
  
  const tournamentLeaderboard = [
    { rank: 1, username: "CueMaster", tournaments: 5, avatar: "/avatars/avatar-3.png" },
    { rank: 2, username: "PoolShark92", tournaments: 4, avatar: "/avatars/avatar-1.png" },
    { rank: 3, username: "BilliardKing", tournaments: 3, avatar: "/avatars/avatar-2.png" },
    { rank: 4, username: "ShotCaller", tournaments: 2, avatar: "/avatars/avatar-4.png" },
    { rank: 5, username: "TableRunner", tournaments: 2, avatar: "/avatars/avatar-2.png" },
    { rank: 6, username: "PocketAce", tournaments: 1, avatar: "/avatars/avatar-5.png" },
    { rank: 7, username: "NineBall", tournaments: 1, avatar: "/avatars/avatar-1.png" },
    { rank: 8, username: "CueControl", tournaments: 1, avatar: "/avatars/avatar-3.png" },
    { rank: 9, username: "StickMaster", tournaments: 0, avatar: "/avatars/avatar-4.png" },
    { rank: 10, username: "BankShot", tournaments: 0, avatar: "/avatars/avatar-5.png" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Leaderboards</h1>
          
          <Tabs defaultValue="earnings" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="earnings" className="data-[state=active]:bg-pool-gold data-[state=active]:text-black">
                <DollarSign className="w-4 h-4 mr-2" /> Earnings
              </TabsTrigger>
              <TabsTrigger value="winrate" className="data-[state=active]:bg-pool-gold data-[state=active]:text-black">
                <Target className="w-4 h-4 mr-2" /> Win Rate
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="data-[state=active]:bg-pool-gold data-[state=active]:text-black">
                <Trophy className="w-4 h-4 mr-2" /> Tournaments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="earnings">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-pool-gold" /> 
                    Top Earners
                  </CardTitle>
                  <CardDescription>Players with the highest total earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 text-xs uppercase text-gray-400 py-2 border-b border-white/10">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-7">Player</div>
                      <div className="col-span-4 text-right">Total Earnings</div>
                    </div>
                    
                    {earningsLeaderboard.map((player) => {
                      const isCurrentUser = user?.username === player.username;
                      
                      return (
                        <div 
                          key={player.rank}
                          className={`grid grid-cols-12 py-3 items-center ${
                            isCurrentUser ? 'bg-pool-blue bg-opacity-30 rounded-lg' : ''
                          }`}
                        >
                          <div className="col-span-1 text-center">
                            {player.rank <= 3 ? (
                              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                                player.rank === 1 ? 'bg-yellow-500' : 
                                player.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-800'
                              }`}>
                                {player.rank}
                              </div>
                            ) : (
                              <span>{player.rank}</span>
                            )}
                          </div>
                          <div className="col-span-7">
                            <div className="flex items-center">
                              <Avatar className="w-8 h-8 mr-2">
                                <AvatarImage src={player.avatar} />
                                <AvatarFallback>{player.username?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {player.username}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-pool-gold text-black px-2 py-0.5 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-4 text-right font-medium text-pool-gold">
                            ${player.earnings.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="winrate">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-500" /> 
                    Top Win Rates
                  </CardTitle>
                  <CardDescription>Players with the highest win percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 text-xs uppercase text-gray-400 py-2 border-b border-white/10">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-5">Player</div>
                      <div className="col-span-2 text-right">Win %</div>
                      <div className="col-span-2 text-right">Wins</div>
                      <div className="col-span-2 text-right">Losses</div>
                    </div>
                    
                    {winRateLeaderboard.map((player) => {
                      const isCurrentUser = user?.username === player.username;
                      
                      return (
                        <div 
                          key={player.rank}
                          className={`grid grid-cols-12 py-3 items-center ${
                            isCurrentUser ? 'bg-pool-blue bg-opacity-30 rounded-lg' : ''
                          }`}
                        >
                          <div className="col-span-1 text-center">
                            {player.rank <= 3 ? (
                              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                                player.rank === 1 ? 'bg-yellow-500' : 
                                player.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-800'
                              }`}>
                                {player.rank}
                              </div>
                            ) : (
                              <span>{player.rank}</span>
                            )}
                          </div>
                          <div className="col-span-5">
                            <div className="flex items-center">
                              <Avatar className="w-8 h-8 mr-2">
                                <AvatarImage src={player.avatar} />
                                <AvatarFallback>{player.username?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="truncate">
                                <div className="font-medium">
                                  {player.username}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-pool-gold text-black px-2 py-0.5 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-right font-medium text-green-500">
                            {player.winRate.toFixed(1)}%
                          </div>
                          <div className="col-span-2 text-right">
                            {player.wins}
                          </div>
                          <div className="col-span-2 text-right">
                            {player.losses}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tournaments">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-amber-500" /> 
                    Tournament Champions
                  </CardTitle>
                  <CardDescription>Players with the most tournament wins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 text-xs uppercase text-gray-400 py-2 border-b border-white/10">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-7">Player</div>
                      <div className="col-span-4 text-right">Tournaments Won</div>
                    </div>
                    
                    {tournamentLeaderboard.map((player) => {
                      const isCurrentUser = user?.username === player.username;
                      
                      return (
                        <div 
                          key={player.rank}
                          className={`grid grid-cols-12 py-3 items-center ${
                            isCurrentUser ? 'bg-pool-blue bg-opacity-30 rounded-lg' : ''
                          }`}
                        >
                          <div className="col-span-1 text-center">
                            {player.rank <= 3 ? (
                              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                                player.rank === 1 ? 'bg-yellow-500' : 
                                player.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-800'
                              }`}>
                                {player.rank}
                              </div>
                            ) : (
                              <span>{player.rank}</span>
                            )}
                          </div>
                          <div className="col-span-7">
                            <div className="flex items-center">
                              <Avatar className="w-8 h-8 mr-2">
                                <AvatarImage src={player.avatar} />
                                <AvatarFallback>{player.username?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {player.username}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-pool-gold text-black px-2 py-0.5 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-4 text-right font-medium">
                            {player.tournaments}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;

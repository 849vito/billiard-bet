
import { useState } from "react";
import { Link } from "react-router-dom";
import TopNavigation from "@/components/TopNavigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Gamepad, Trophy, Target, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const { availableMatches, findMatch, joinMatch, loading } = useGame();
  const [betAmount, setBetAmount] = useState(5);
  
  const handleFindMatch = (mode: 'casual' | 'ranked' | 'tournament') => {
    if (betAmount <= 0) {
      return;
    }
    findMatch(mode, betAmount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
            <p className="text-gray-400">Your current balance: <span className="text-pool-gold font-medium">${balance.toFixed(2)}</span></p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="play" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="play" className="data-[state=active]:bg-pool-gold data-[state=active]:text-black">
                    <Gamepad className="w-4 h-4 mr-2" /> Play Now
                  </TabsTrigger>
                  <TabsTrigger value="tournaments" className="data-[state=active]:bg-pool-gold data-[state=active]:text-black">
                    <Trophy className="w-4 h-4 mr-2" /> Tournaments
                  </TabsTrigger>
                  <TabsTrigger value="practice" className="data-[state=active]:bg-pool-gold data-[state=active]:text-black">
                    <Target className="w-4 h-4 mr-2" /> Practice
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="play">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Create a Match</CardTitle>
                      <CardDescription>Choose your game mode and bet amount</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full glass hover:bg-white/10 flex items-center gap-2 border border-white/10 h-24">
                              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <Gamepad className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Casual</div>
                                <div className="text-xs opacity-70">Relaxed games with lower stakes</div>
                              </div>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass border-white/10">
                            <DialogHeader>
                              <DialogTitle>Casual Match</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <label className="block text-sm font-medium mb-2">Bet Amount</label>
                              <div className="flex items-center space-x-4">
                                <Button 
                                  onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
                                  disabled={betAmount <= 1}
                                  variant="outline"
                                  className="border-white/20"
                                >-</Button>
                                <Input 
                                  type="number" 
                                  value={betAmount}
                                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 1)}
                                  className="glass border-white/20 text-center"
                                  min="1"
                                />
                                <Button 
                                  onClick={() => setBetAmount(betAmount + 5)}
                                  variant="outline"
                                  className="border-white/20"
                                >+</Button>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                Min bet: $1.00 | Max bet: $100.00 | Your balance: ${balance.toFixed(2)}
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleFindMatch('casual')}
                              className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black"
                              disabled={loading || betAmount > balance}
                            >
                              {loading ? "Finding match..." : "Find Match"}
                            </Button>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full glass hover:bg-white/10 flex items-center gap-2 border border-white/10 h-24">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Ranked</div>
                                <div className="text-xs opacity-70">Competitive games with rating changes</div>
                              </div>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass border-white/10">
                            <DialogHeader>
                              <DialogTitle>Ranked Match</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <label className="block text-sm font-medium mb-2">Bet Amount</label>
                              <div className="flex items-center space-x-4">
                                <Button 
                                  onClick={() => setBetAmount(Math.max(5, betAmount - 5))}
                                  disabled={betAmount <= 5}
                                  variant="outline"
                                  className="border-white/20"
                                >-</Button>
                                <Input 
                                  type="number" 
                                  value={betAmount}
                                  onChange={(e) => setBetAmount(Math.max(5, parseInt(e.target.value) || 5))}
                                  className="glass border-white/20 text-center"
                                  min="5"
                                />
                                <Button 
                                  onClick={() => setBetAmount(betAmount + 5)}
                                  variant="outline"
                                  className="border-white/20"
                                >+</Button>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                Min bet: $5.00 | Max bet: $100.00 | Your balance: ${balance.toFixed(2)}
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleFindMatch('ranked')}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={loading || betAmount > balance}
                            >
                              {loading ? "Finding match..." : "Find Ranked Match"}
                            </Button>
                          </DialogContent>
                        </Dialog>
                        
                        <Link to="/tournaments">
                          <Button className="w-full glass hover:bg-white/10 flex items-center gap-2 border border-white/10 h-24">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">Tournament</div>
                              <div className="text-xs opacity-70">Compete in tournaments for bigger prizes</div>
                            </div>
                          </Button>
                        </Link>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Available Matches</h3>
                        {availableMatches.length === 0 ? (
                          <div className="glass border border-white/10 rounded-lg p-6 text-center">
                            <p className="text-gray-400">No matches available at the moment</p>
                            <p className="text-sm text-gray-500 mt-2">Create a match or check back later</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {availableMatches.map(match => (
                              <div key={match.id} className="glass border border-white/10 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-pool-blue flex items-center justify-center text-white font-bold border-2 border-pool-gold">
                                    {match.player1Username.charAt(0)}
                                  </div>
                                  <div className="ml-3">
                                    <div className="font-medium">{match.player1Username}</div>
                                    <div className="text-xs text-gray-400">Waiting for opponent</div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="mr-4 text-pool-gold font-medium">
                                    ${match.betAmount.toFixed(2)}
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={() => joinMatch(match.id)}
                                    disabled={loading || match.betAmount > balance}
                                    className="bg-pool-gold hover:bg-pool-gold-dark text-black font-medium"
                                  >
                                    Join
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tournaments">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Upcoming Tournaments</CardTitle>
                      <CardDescription>Join tournaments to win big prizes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="glass border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mr-3">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold">Weekend Cash Cup</div>
                                <div className="text-xs text-gray-400">Starts in 2 hours</div>
                              </div>
                            </div>
                            <div className="text-pool-gold font-medium">$500 Prize Pool</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                              <span className="bg-gray-700 px-2 py-1 rounded mr-2">32 Players</span>
                              <span className="bg-gray-700 px-2 py-1 rounded">$10 Entry</span>
                            </div>
                            <Button size="sm" className="bg-pool-gold hover:bg-pool-gold-dark text-black">
                              Register
                            </Button>
                          </div>
                        </div>
                        
                        <div className="glass border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold">Pro League Qualifier</div>
                                <div className="text-xs text-gray-400">Tomorrow, 8:00 PM</div>
                              </div>
                            </div>
                            <div className="text-pool-gold font-medium">$1000 Prize Pool</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                              <span className="bg-gray-700 px-2 py-1 rounded mr-2">64 Players</span>
                              <span className="bg-gray-700 px-2 py-1 rounded">$25 Entry</span>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              Register
                            </Button>
                          </div>
                        </div>
                        
                        <Link to="/tournaments">
                          <Button variant="outline" className="w-full border-white/20">
                            View All Tournaments
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="practice">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Practice Mode</CardTitle>
                      <CardDescription>Improve your skills without betting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Link to="/game/practice">
                            <Button className="w-full glass hover:bg-white/10 flex items-center gap-2 border border-white/10 h-24">
                              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Free Play</div>
                                <div className="text-xs opacity-70">Practice your shots without pressure</div>
                              </div>
                            </Button>
                          </Link>
                          
                          <Link to="/game/challenge">
                            <Button className="w-full glass hover:bg-white/10 flex items-center gap-2 border border-white/10 h-24">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold">Challenges</div>
                                <div className="text-xs opacity-70">Complete challenges to earn XP</div>
                              </div>
                            </Button>
                          </Link>
                        </div>
                        
                        <div className="glass border border-white/10 rounded-lg p-4">
                          <h3 className="font-semibold mb-3">Basic Tutorial</h3>
                          <p className="text-sm text-gray-400 mb-4">Learn the basics of playing billiards in our app</p>
                          <Button variant="outline" className="w-full border-white/20">
                            Start Tutorial
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Wins</span>
                      <span className="font-medium">{user?.winCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Losses</span>
                      <span className="font-medium">{user?.lossCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="font-medium">
                        {user && user.winCount + user.lossCount > 0
                          ? ((user.winCount / (user.winCount + user.lossCount)) * 100).toFixed(1) + '%'
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-gray-400">Level</span>
                      <span className="font-medium">{user?.level || 1}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1 flex justify-between">
                        <span>XP Progress</span>
                        <span>{user?.experience || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-pool-gold h-2 rounded-full" 
                          style={{ width: `${(user?.experience || 0) % 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Link to="/wallet">
                <Card className="glass border-white/10 hover:border-pool-gold transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-pool-gold" />
                      Wallet Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-pool-gold mb-2">${balance.toFixed(2)}</div>
                    <Button className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black">
                      Deposit Funds
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold mr-2">1</div>
                      <div className="flex-1">PoolShark92</div>
                      <div className="text-pool-gold">$12,450</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold mr-2">2</div>
                      <div className="flex-1">BilliardKing</div>
                      <div className="text-pool-gold">$8,320</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold mr-2">3</div>
                      <div className="flex-1">CueMaster</div>
                      <div className="text-pool-gold">$6,780</div>
                    </div>
                  </div>
                  <Link to="/leaderboard">
                    <Button variant="outline" className="w-full mt-4 border-white/20">
                      View Full Leaderboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

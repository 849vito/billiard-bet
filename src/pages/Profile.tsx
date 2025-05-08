
import { useState } from "react";
import TopNavigation from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  
  const achievements = [
    { name: "First Win", description: "Win your first game", completed: true, icon: "🏆" },
    { name: "High Roller", description: "Play in a game with $50+ bet", completed: false, icon: "💰" },
    { name: "Tournament Finalist", description: "Reach the finals of a tournament", completed: false, icon: "🥈" },
    { name: "Perfect Game", description: "Win without letting your opponent shoot", completed: false, icon: "⚡" },
    { name: "Regular Player", description: "Play 10 games", completed: true, icon: "🔄" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20 pb-10 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-pool-gold">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  
                  {editing ? (
                    <div className="w-full space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                        <Input 
                          id="username" 
                          defaultValue={user?.username} 
                          className="glass border-white/20"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          id="email" 
                          defaultValue={user?.email} 
                          className="glass border-white/20"
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          className="flex-1 bg-pool-gold hover:bg-pool-gold-dark text-black"
                          onClick={() => {
                            setEditing(false);
                            toast.success("Profile updated successfully!");
                          }}
                        >
                          Save
                        </Button>
                        <Button 
                          className="flex-1"
                          variant="outline"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mb-1">{user?.username}</h2>
                      <p className="text-gray-400 mb-3">Level {user?.level || 1}</p>
                      
                      <div className="w-full space-y-3 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Email:</span>
                          <span>{user?.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Joined:</span>
                          <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Games Played:</span>
                          <span>{(user?.winCount || 0) + (user?.lossCount || 0)}</span>
                        </div>
                        
                        <Button 
                          className="w-full mt-4"
                          variant="outline"
                          onClick={() => setEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card className="glass border-white/10 mt-6">
                <CardHeader>
                  <CardTitle>Stats Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Wins:</span>
                      <span className="font-medium">{user?.winCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Losses:</span>
                      <span className="font-medium">{user?.lossCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="font-medium">
                        {user && user.winCount + user.lossCount > 0
                          ? ((user.winCount / (user.winCount + user.lossCount)) * 100).toFixed(1) + '%'
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-white/10 pt-3 mt-3">
                      <span className="text-gray-400">Tournaments Won:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Earnings:</span>
                      <span className="font-medium text-pool-gold">$0.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Tabs defaultValue="achievements" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="history">Game History</TabsTrigger>
                  <TabsTrigger value="items">Items & Skins</TabsTrigger>
                </TabsList>
                
                <TabsContent value="achievements">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                      <CardDescription>Track your progress and unlock rewards</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {achievements.map((achievement, index) => (
                          <div 
                            key={index} 
                            className={`glass p-4 rounded-lg border ${
                              achievement.completed ? 'border-pool-gold' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3 ${
                                achievement.completed 
                                  ? 'bg-pool-gold text-black' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold mb-1">
                                  {achievement.name}
                                  {achievement.completed && (
                                    <span className="ml-2 text-xs bg-pool-gold text-black px-2 py-0.5 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">{achievement.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Game History</CardTitle>
                      <CardDescription>View your recent games</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-gray-400">
                        <p>No recent games found</p>
                        <p className="text-sm mt-2">Play some games to see your history</p>
                        <Button variant="outline" className="mt-4 border-white/20">
                          Find a Match
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="items">
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle>Items & Skins</CardTitle>
                      <CardDescription>Customize your in-game appearance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold mb-3">Cue Skins</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="glass p-3 rounded-lg border border-pool-gold">
                          <div className="h-24 flex items-center justify-center mb-2">
                            <div className="w-4 h-24 bg-gradient-to-b from-pool-wood to-pool-wood-dark rounded-full relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">Standard Cue</div>
                            <div className="text-xs text-pool-gold">Equipped</div>
                          </div>
                        </div>
                        
                        <div className="glass p-3 rounded-lg border border-white/10">
                          <div className="h-24 flex items-center justify-center mb-2">
                            <div className="w-4 h-24 bg-gradient-to-b from-blue-600 to-blue-900 rounded-full relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">Royal Blue</div>
                            <div className="text-xs text-gray-400">Locked</div>
                          </div>
                        </div>
                        
                        <div className="glass p-3 rounded-lg border border-white/10">
                          <div className="h-24 flex items-center justify-center mb-2">
                            <div className="w-4 h-24 bg-gradient-to-b from-green-500 to-green-800 rounded-full relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">Emerald</div>
                            <div className="text-xs text-gray-400">Locked</div>
                          </div>
                        </div>
                        
                        <div className="glass p-3 rounded-lg border border-white/10">
                          <div className="h-24 flex items-center justify-center mb-2">
                            <div className="w-4 h-24 bg-gradient-to-b from-amber-400 to-amber-700 rounded-full relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">Gold Rush</div>
                            <div className="text-xs text-gray-400">Locked</div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold mb-3">Avatars</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        <div className="glass p-3 rounded-lg border border-pool-gold">
                          <div className="w-full aspect-square rounded-full overflow-hidden mb-2">
                            <img 
                              src={user?.avatar} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-pool-gold">Current</div>
                          </div>
                        </div>
                        
                        <div className="glass p-3 rounded-lg border border-white/10">
                          <div className="w-full aspect-square rounded-full bg-gray-800 flex items-center justify-center mb-2">
                            <span className="text-2xl">🎱</span>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-400">Locked</div>
                          </div>
                        </div>
                        
                        <div className="glass p-3 rounded-lg border border-white/10">
                          <div className="w-full aspect-square rounded-full bg-gray-800 flex items-center justify-center mb-2">
                            <span className="text-2xl">🏆</span>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-400">Locked</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

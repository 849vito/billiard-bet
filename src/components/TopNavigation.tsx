
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard,
  Wallet,
  Trophy,
  List,
  UserCircle,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

const TopNavigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { balance } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="glass h-full p-2 border-b border-white/10">
        <div className="container h-full mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center mr-6">
              <img 
                src="/lovable-uploads/871f3c97-c81b-4133-a70a-7132bf9c0136.png" 
                alt="BilliardBet Logo" 
                className="w-8 h-8 mr-2" 
              />
              <span className="text-xl font-bold bg-gradient-to-r from-pool-gold to-white text-transparent bg-clip-text">
                BilliardBet
              </span>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Lobby
                  </Button>
                </Link>
                <Link to="/tournaments">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" /> Tournaments
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <List className="w-4 h-4 mr-1" /> Leaderboard
                  </Button>
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <Link to="/wallet" className="mr-4">
                  <Button variant="ghost" size="sm" className="bg-pool-blue bg-opacity-80 hover:bg-opacity-100">
                    <Wallet className="w-4 h-4 mr-1" />
                    <span className="text-pool-gold font-medium">${balance.toFixed(2)}</span>
                  </Button>
                </Link>
                
                <div className="flex items-center mr-2">
                  <Link to="/profile" className="flex items-center">
                    <Avatar className="w-8 h-8 mr-2 ring-1 ring-pool-gold">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.username}
                    </span>
                  </Link>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    logout();
                    toast.success("Logged out successfully");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;

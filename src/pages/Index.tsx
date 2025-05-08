
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-pool-gold to-white text-transparent bg-clip-text">
                Play Billiards. Win Real Money.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Compete in 1v1 matches and tournaments. Show off your skills and earn cash prizes.
              </p>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-pool-gold hover:bg-pool-gold-dark text-black font-bold">
                    Enter the Lobby
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-pool-gold hover:bg-pool-gold-dark text-black font-bold px-8">
                      Join Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-pool-gold text-pool-gold hover:bg-pool-gold/10">
                      Log In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative balls */}
          <div className="hidden md:block absolute top-20 left-10 w-16 h-16 rounded-full bg-red-600 opacity-50 blur-md"></div>
          <div className="hidden md:block absolute bottom-20 right-10 w-12 h-12 rounded-full bg-blue-600 opacity-50 blur-md"></div>
          <div className="hidden md:block absolute top-40 right-20 w-10 h-10 rounded-full bg-yellow-400 opacity-50 blur-md"></div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-20 bg-pool-blue-dark bg-opacity-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-pool-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Deposit Funds</h3>
                <p className="text-gray-300">Add money to your wallet securely via Stripe, PayPal, or other payment methods.</p>
              </div>
              
              <div className="glass p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-pool-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Play Matches</h3>
                <p className="text-gray-300">Join 1v1 games or tournaments with players around the world. Bet on your skills.</p>
              </div>
              
              <div className="glass p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-pool-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Win & Withdraw</h3>
                <p className="text-gray-300">Win games, earn real money, and withdraw your earnings anytime.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players competing for real money prizes. Put your billiards skills to the test today!
            </p>
            
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" className="bg-pool-gold hover:bg-pool-gold-dark text-black font-bold px-8">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
      
      <footer className="glass border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} BilliardBet. All rights reserved.</p>
          <p className="mt-2">This is a demo application. No real money is involved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

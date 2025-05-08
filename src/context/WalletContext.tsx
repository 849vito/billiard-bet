
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

type Transaction = {
  id: string;
  type: 'deposit' | 'withdraw' | 'win' | 'loss' | 'fee';
  amount: number;
  timestamp: Date;
  description: string;
  status: 'pending' | 'completed' | 'failed';
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  loading: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wallet data when user changes
  useEffect(() => {
    if (user) {
      const storedWallet = localStorage.getItem(`billiardbet_wallet_${user.id}`);
      if (storedWallet) {
        try {
          const walletData = JSON.parse(storedWallet);
          setBalance(walletData.balance || 0);
          setTransactions(walletData.transactions || []);
        } catch (error) {
          console.error("Failed to parse stored wallet:", error);
          // Initialize with defaults
          setBalance(0);
          setTransactions([]);
          localStorage.removeItem(`billiardbet_wallet_${user.id}`);
        }
      } else {
        // New user, give them a welcome bonus
        const welcomeTransaction: Transaction = {
          id: 'txn_' + Math.random().toString(36).substr(2, 9),
          type: 'deposit',
          amount: 50,
          timestamp: new Date(),
          description: 'Welcome bonus',
          status: 'completed'
        };
        
        setBalance(50);
        setTransactions([welcomeTransaction]);
        
        // Save to localStorage
        localStorage.setItem(`billiardbet_wallet_${user.id}`, JSON.stringify({
          balance: 50,
          transactions: [welcomeTransaction]
        }));
      }
    } else {
      // Reset when logged out
      setBalance(0);
      setTransactions([]);
    }
  }, [user]);

  const saveWalletData = () => {
    if (user) {
      localStorage.setItem(`billiardbet_wallet_${user.id}`, JSON.stringify({
        balance,
        transactions
      }));
    }
  };

  const deposit = async (amount: number) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    
    try {
      setLoading(true);
      
      // Calculate platform fee (10%)
      const fee = amount * 0.1;
      const actualAmount = amount - fee;
      
      // Create transaction records
      const depositTransaction: Transaction = {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        type: 'deposit',
        amount: actualAmount,
        timestamp: new Date(),
        description: `Deposit of $${amount.toFixed(2)}`,
        status: 'completed'
      };
      
      const feeTransaction: Transaction = {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        type: 'fee',
        amount: fee,
        timestamp: new Date(),
        description: `Platform fee (10%) for $${amount.toFixed(2)} deposit`,
        status: 'completed'
      };
      
      // Update state
      setBalance(prevBalance => prevBalance + actualAmount);
      setTransactions(prev => [depositTransaction, feeTransaction, ...prev]);
      
      // Save changes
      setTimeout(() => {
        saveWalletData();
        toast.success(`Successfully deposited $${actualAmount.toFixed(2)} to your wallet`);
      }, 500);
    } catch (error) {
      console.error("Deposit failed:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: number) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    
    if (amount > balance) {
      toast.error("Insufficient funds");
      return;
    }
    
    try {
      setLoading(true);
      
      // Create transaction record
      const withdrawTransaction: Transaction = {
        id: 'txn_' + Math.random().toString(36).substr(2, 9),
        type: 'withdraw',
        amount: amount,
        timestamp: new Date(),
        description: `Withdrawal of $${amount.toFixed(2)}`,
        status: 'completed'
      };
      
      // Update state
      setBalance(prevBalance => prevBalance - amount);
      setTransactions(prev => [withdrawTransaction, ...prev]);
      
      // Save changes
      setTimeout(() => {
        saveWalletData();
        toast.success(`Successfully withdrew $${amount.toFixed(2)} from your wallet`);
      }, 500);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{
      balance,
      transactions,
      deposit,
      withdraw,
      loading
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

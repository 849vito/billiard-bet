
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  experience: number;
  winCount: number;
  lossCount: number;
  createdAt: Date;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user data in localStorage on initial load
    const storedUser = localStorage.getItem('billiardbet_user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('billiardbet_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo purposes - in real app, this would make an API call
      // This is a mock login that works with any credentials
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        username: email.split('@')[0],
        email,
        avatar: `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
        level: 1,
        experience: 0,
        winCount: 0,
        lossCount: 0,
        createdAt: new Date()
      };
      
      // Save to localStorage
      localStorage.setItem('billiardbet_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Login successful!");

    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo purposes - in real app, this would make an API call
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        username,
        email,
        avatar: `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
        level: 1,
        experience: 0,
        winCount: 0,
        lossCount: 0,
        createdAt: new Date()
      };
      
      // Save to localStorage
      localStorage.setItem('billiardbet_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success("Registration successful!");

    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('billiardbet_user');
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

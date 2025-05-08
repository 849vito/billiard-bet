
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center mb-8">
        <img 
          src="/lovable-uploads/871f3c97-c81b-4133-a70a-7132bf9c0136.png" 
          alt="BilliardBet Logo" 
          className="w-10 h-10 mr-2" 
        />
        <span className="text-2xl font-bold bg-gradient-to-r from-pool-gold to-white text-transparent bg-clip-text">
          BilliardBet
        </span>
      </Link>
      
      <div className="w-full max-w-md glass p-6 rounded-lg border border-white/10">
        <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required", 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className="glass border-white/20 focus:border-pool-gold"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              className="glass border-white/20 focus:border-pool-gold"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div className="text-right">
            <a href="#" className="text-sm text-pool-gold hover:underline">Forgot password?</a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black font-bold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-pool-gold hover:underline">
              Register now
            </Link>
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400 text-center mb-4">Or continue with</p>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="border-white/20 hover:bg-white/5">
              Google
            </Button>
            <Button variant="outline" className="border-white/20 hover:bg-white/5">
              Apple
            </Button>
            <Button variant="outline" className="border-white/20 hover:bg-white/5">
              Facebook
            </Button>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-400">
        This is a demo app. Any email/password combination will work.
      </p>
    </div>
  );
};

export default Login;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      await registerUser(data.email, data.username, data.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <Input
              id="username"
              {...register("username", { 
                required: "Username is required", 
                minLength: { value: 3, message: "Username must be at least 3 characters" }
              })}
              className="glass border-white/20 focus:border-pool-gold"
              placeholder="CueMaster"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>
          
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
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              className="glass border-white/20 focus:border-pool-gold"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
              className="glass border-white/20 focus:border-pool-gold"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-pool-gold hover:bg-pool-gold-dark text-black font-bold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-pool-gold hover:underline">
              Log in
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
      
      <p className="mt-8 text-sm text-gray-400 max-w-md text-center">
        By registering, you agree to our Terms of Service and confirm that you are at least 18 years old.
        This is a demo app. No real money is involved.
      </p>
    </div>
  );
};

export default Register;

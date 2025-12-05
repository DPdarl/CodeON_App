// app/routes/login.tsx
import { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
// 1. IMPORT THE TOGGLE
import { ThemeToggle } from "~/components/ThemeToggle";
import { Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  // ... existing state and logic ...
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const isNewUser = await signInWithGoogle();
      if (isNewUser) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to sign in with Google");
    }
  };

  return (
    // 2. ADD 'relative' CLASS HERE so the absolute button positions correctly
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900 relative transition-colors duration-300">
      {/* 3. PLACE THE BUTTON HERE */}
      <ThemeToggle />

      {/* --- Left Side: Visuals --- */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-12">
        {/* ... existing left side content ... */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], rotate: [0, -60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
              <CodeOnLogo className="h-24 w-24" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold text-white tracking-tight"
          >
            Welcome Back
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300"
          >
            Your coding journey continues. Jump back in to keep your streak
            alive and master new skills.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4 pt-8"
          >
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
              <CheckCircle2 className="text-green-400" />
              <span>Daily Challenges</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
              <CheckCircle2 className="text-green-400" />
              <span>Global Leaderboard</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        {/* ... existing form content ... */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign in to CodeON
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your details below to access your account
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="coder@example.com"
                    required
                    className="pl-12 h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="pl-12 h-12 text-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={handleGoogleLogin}
            >
              <svg
                className="mr-3 h-5 w-5"
                aria-hidden="true"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Google
            </Button>

            <p className="text-center text-base text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

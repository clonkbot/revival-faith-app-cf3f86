import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { Church, Mail, Lock, User, Sparkles } from "lucide-react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymous = async () => {
    setIsSubmitting(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue as guest");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative overflow-hidden">
      {/* Stained glass effect background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-300 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Gothic arch pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='80' viewBox='0 0 60 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 Q30 40 0 80 M30 0 Q30 40 60 80' stroke='%23fff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 80px',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.3)",
                "0 0 40px rgba(251, 191, 36, 0.5)",
                "0 0 20px rgba(251, 191, 36, 0.3)",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 md:mb-6"
          >
            <Church className="w-10 h-10 md:w-12 md:h-12 text-amber-950" strokeWidth={1.5} />
          </motion.div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-amber-100 mb-2 md:mb-3 tracking-tight">
            Revival
          </h1>
          <p className="text-amber-200/60 text-base md:text-lg font-light tracking-widest uppercase">
            Return to Faith
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-amber-500/20 shadow-2xl shadow-amber-900/20">
            <h2 className="font-serif text-2xl md:text-3xl text-amber-100 text-center mb-2">
              {flow === "signIn" ? "Welcome Back" : "Begin Your Journey"}
            </h2>
            <p className="text-amber-200/50 text-center mb-6 md:mb-8 text-sm md:text-base">
              {flow === "signIn"
                ? "Enter your credentials to continue"
                : "Create an account to track your spiritual growth"}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 md:p-4 mb-4 md:mb-6"
              >
                <p className="text-rose-300 text-sm text-center">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {flow === "signUp" && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all text-base"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all text-base"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/50" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all text-base"
                />
              </div>

              <input name="flow" type="hidden" value={flow} />

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isSubmitting ? "Please wait..." : flow === "signIn" ? "Sign In" : "Create Account"}
              </motion.button>
            </form>

            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-500/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-stone-900/80 text-amber-200/40">or</span>
              </div>
            </div>

            <motion.button
              onClick={handleAnonymous}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 md:py-4 bg-stone-800/50 border border-amber-500/20 text-amber-200 font-medium rounded-xl hover:bg-stone-800/80 hover:border-amber-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              <Sparkles className="w-5 h-5" />
              Continue as Guest
            </motion.button>

            <p className="text-center mt-6 md:mt-8 text-amber-200/50 text-sm">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="ml-2 text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 md:mt-12 text-center"
        >
          <p className="text-amber-200/30 text-xs">
            Requested by @stringer_kade · Built by @clonkbot
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-amber-400/30 border-t-amber-400 rounded-full"
          />
          <p className="text-amber-200/70 font-serif text-lg tracking-wide">
            Preparing your sanctuary...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Dashboard />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AuthScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

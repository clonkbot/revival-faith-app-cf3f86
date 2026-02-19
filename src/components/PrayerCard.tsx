import { motion } from "framer-motion";
import { Check, Trash2, Heart, Sparkles, Users, Globe, HelpCircle, Leaf } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Prayer {
  _id: Id<"prayerIntentions">;
  intention: string;
  category: string;
  isAnswered: boolean;
  createdAt: number;
}

interface PrayerCardProps {
  prayer: Prayer;
  index: number;
  onMarkAnswered: () => void;
  onDelete: () => void;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  healing: { icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  gratitude: { icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/20" },
  guidance: { icon: Heart, color: "text-blue-400", bg: "bg-blue-500/20" },
  family: { icon: Users, color: "text-rose-400", bg: "bg-rose-500/20" },
  world: { icon: Globe, color: "text-violet-400", bg: "bg-violet-500/20" },
  other: { icon: HelpCircle, color: "text-stone-400", bg: "bg-stone-500/20" },
};

export function PrayerCard({ prayer, index, onMarkAnswered, onDelete }: PrayerCardProps) {
  const config = categoryConfig[prayer.category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border transition-all group ${
        prayer.isAnswered
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/20"
      }`}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 md:gap-4 mb-2">
            <p className={`text-base md:text-lg ${prayer.isAnswered ? "text-amber-100/70" : "text-amber-100"}`}>
              {prayer.intention}
            </p>

            <div className="flex items-center gap-1 shrink-0">
              {!prayer.isAnswered && (
                <motion.button
                  onClick={onMarkAnswered}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 md:p-2 rounded-lg text-amber-200/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Mark as answered"
                >
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              )}
              <motion.button
                onClick={onDelete}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 md:p-2 rounded-lg text-amber-200/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                title="Delete prayer"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </motion.button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className={`px-2 md:px-3 py-1 ${config.bg} ${config.color} text-xs rounded-full capitalize`}>
              {prayer.category}
            </span>

            {prayer.isAnswered && (
              <span className="px-2 md:px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Answered
              </span>
            )}

            <span className="text-amber-200/30 text-xs">
              {new Date(prayer.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

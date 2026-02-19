import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Church, Bell, LogOut, Plus, Heart, Calendar,
  BookOpen, Sparkles, Check, Trash2, X, ExternalLink,
  Timer, Loader2
} from "lucide-react";
import { PrayerCard } from "./PrayerCard";
import { NotificationPanel } from "./NotificationPanel";

type Tab = "prayers" | "visits" | "resources";

interface Prayer {
  _id: Id<"prayerIntentions">;
  intention: string;
  category: string;
  isAnswered: boolean;
  createdAt: number;
}

interface Visit {
  _id: Id<"churchVisits">;
  churchName: string;
  visitDate: number;
  notes?: string;
  createdAt: number;
}

interface Resource {
  _id: Id<"faithResources">;
  title: string;
  url: string;
  description: string;
  source: string;
  category: string;
  scrapedAt: number;
}

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("prayers");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddPrayer, setShowAddPrayer] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [scrapeApiKey, setScrapeApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [scrapeCountdown, setScrapeCountdown] = useState(20 * 60 + 59);

  const prayers = useQuery(api.prayers.list);
  const prayerStats = useQuery(api.prayers.getStats);
  const visits = useQuery(api.churchVisits.list);
  const visitStats = useQuery(api.churchVisits.getStats);
  const resources = useQuery(api.resources.list, {});
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const scrapeJob = useQuery(api.resources.getLatestScrapeJob);

  const createPrayer = useMutation(api.prayers.create);
  const markAnswered = useMutation(api.prayers.markAnswered);
  const deletePrayer = useMutation(api.prayers.remove);
  const createVisit = useMutation(api.churchVisits.create);
  const deleteVisit = useMutation(api.churchVisits.remove);
  const scrapeResources = useAction(api.resources.scrapeResources);
  const addManualResource = useMutation(api.resources.addManualResource);

  // Countdown timer for scraping
  useEffect(() => {
    const interval = setInterval(() => {
      setScrapeCountdown((prev) => (prev > 0 ? prev - 1 : 20 * 60 + 59));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleScrape = async () => {
    if (!scrapeApiKey.trim()) {
      setShowApiKeyModal(true);
      return;
    }
    try {
      await scrapeResources({ apiKey: scrapeApiKey });
      setScrapeCountdown(20 * 60 + 59);
    } catch (error) {
      console.error("Scrape failed:", error);
    }
  };

  const handleAddDemoResources = async () => {
    const demoResources = [
      {
        title: "The Power of Daily Prayer",
        url: "https://example.com/daily-prayer",
        description: "Discover how establishing a daily prayer routine can transform your spiritual life and bring you closer to God.",
        source: "Faith Today",
        category: "inspiration",
      },
      {
        title: "Finding Community in Modern Church",
        url: "https://example.com/modern-church",
        description: "Explore how churches are adapting to meet the needs of contemporary believers while staying true to tradition.",
        source: "Church Life",
        category: "news",
      },
      {
        title: "Testimonies of Answered Prayers",
        url: "https://example.com/testimonies",
        description: "Real stories from believers who experienced God's faithfulness through answered prayers.",
        source: "Revival Stories",
        category: "testimonies",
      },
    ];

    for (const resource of demoResources) {
      await addManualResource(resource);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Church className="w-5 h-5 md:w-6 md:h-6 text-amber-950" strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-xl md:text-2xl text-amber-100">Revival</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 md:p-2.5 rounded-full bg-stone-800/50 border border-amber-500/20 text-amber-200 hover:bg-stone-800 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
            <motion.button
              onClick={() => signOut()}
              whileTap={{ scale: 0.95 }}
              className="p-2 md:p-2.5 rounded-full bg-stone-800/50 border border-amber-500/20 text-amber-200 hover:bg-stone-800 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Notifications panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-4 md:py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20"
          >
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              </div>
              <span className="text-amber-200/60 text-xs md:text-sm">Prayers</span>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-amber-100">{prayerStats?.total ?? 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20"
          >
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              </div>
              <span className="text-amber-200/60 text-xs md:text-sm">Answered</span>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-amber-100">{prayerStats?.answered ?? 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20"
          >
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Church className="w-4 h-4 md:w-5 md:h-5 text-rose-400" />
              </div>
              <span className="text-amber-200/60 text-xs md:text-sm">Visits</span>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-amber-100">{visitStats?.total ?? 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20"
          >
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Timer className="w-4 h-4 md:w-5 md:h-5 text-violet-400" />
              </div>
              <span className="text-amber-200/60 text-xs md:text-sm">Next Scrape</span>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-amber-100 font-mono">{formatCountdown(scrapeCountdown)}</p>
          </motion.div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 md:gap-2 mb-6 md:mb-8 bg-stone-900/40 p-1.5 rounded-2xl border border-amber-500/10 overflow-x-auto">
          {[
            { id: "prayers" as Tab, label: "Prayers", icon: Heart },
            { id: "visits" as Tab, label: "Church Visits", icon: Calendar },
            { id: "resources" as Tab, label: "Resources", icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
                activeTab === tab.id
                  ? "bg-amber-500/20 text-amber-100"
                  : "text-amber-200/50 hover:text-amber-200/70"
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === "visits" ? "Visits" : tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "prayers" && (
            <motion.div
              key="prayers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <h2 className="font-serif text-xl md:text-2xl text-amber-100">Your Prayer Intentions</h2>
                <motion.button
                  onClick={() => setShowAddPrayer(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  Add Prayer
                </motion.button>
              </div>

              {prayers === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : prayers.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <Heart className="w-12 h-12 md:w-16 md:h-16 text-amber-500/30 mx-auto mb-4" />
                  <p className="text-amber-200/50 text-base md:text-lg">No prayers yet. Start your journey.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4">
                  {prayers.map((prayer: Prayer, index: number) => (
                    <PrayerCard
                      key={prayer._id}
                      prayer={prayer}
                      index={index}
                      onMarkAnswered={() => markAnswered({ id: prayer._id })}
                      onDelete={() => deletePrayer({ id: prayer._id })}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "visits" && (
            <motion.div
              key="visits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <h2 className="font-serif text-xl md:text-2xl text-amber-100">Church Visits</h2>
                <motion.button
                  onClick={() => setShowAddVisit(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  Log Visit
                </motion.button>
              </div>

              {visits === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <Church className="w-12 h-12 md:w-16 md:h-16 text-amber-500/30 mx-auto mb-4" />
                  <p className="text-amber-200/50 text-base md:text-lg">No visits logged yet. Time to go to church!</p>
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4">
                  {visits.map((visit: Visit, index: number) => (
                    <motion.div
                      key={visit._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                            <Church className="w-5 h-5 md:w-6 md:h-6 text-rose-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif text-lg md:text-xl text-amber-100 mb-1 truncate">{visit.churchName}</h3>
                            <p className="text-amber-200/50 text-sm">
                              {new Date(visit.visitDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            {visit.notes && (
                              <p className="text-amber-200/70 text-sm mt-2 line-clamp-2">{visit.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteVisit({ id: visit._id })}
                          className="p-2 rounded-lg text-amber-200/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "resources" && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-amber-100">Faith Resources</h2>
                  <p className="text-amber-200/50 text-xs md:text-sm mt-1">
                    {scrapeJob?.status === "running"
                      ? "Scraping resources..."
                      : `${resources?.length ?? 0} resources available`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleAddDemoResources}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-stone-800/50 border border-amber-500/20 text-amber-200 font-medium rounded-xl hover:bg-stone-800 transition-all text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Add Demo</span>
                  </motion.button>
                  <motion.button
                    onClick={handleScrape}
                    disabled={scrapeJob?.status === "running"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50 text-sm md:text-base"
                  >
                    {scrapeJob?.status === "running" ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Scrape with Firecrawl</span>
                        <span className="sm:hidden">Scrape</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {resources === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-amber-500/30 mx-auto mb-4" />
                  <p className="text-amber-200/50 text-base md:text-lg mb-4">No resources yet. Scrape some faith content!</p>
                  <p className="text-amber-200/30 text-xs md:text-sm max-w-md mx-auto px-4">
                    Click "Add Demo" for sample resources, or use Firecrawl API to scrape real content.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {resources.map((resource: Resource, index: number) => (
                    <motion.a
                      key={resource._id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-stone-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-amber-500/20 hover:border-amber-400/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2 md:px-3 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full capitalize">
                          {resource.category}
                        </span>
                        <ExternalLink className="w-4 h-4 text-amber-200/30 group-hover:text-amber-400 transition-colors shrink-0" />
                      </div>
                      <h3 className="font-serif text-base md:text-lg text-amber-100 mb-2 group-hover:text-amber-200 transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-amber-200/50 text-xs md:text-sm line-clamp-3 mb-3">
                        {resource.description}
                      </p>
                      <p className="text-amber-200/30 text-xs truncate">{resource.source}</p>
                    </motion.a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Prayer Modal */}
      <AnimatePresence>
        {showAddPrayer && (
          <AddPrayerModal
            onClose={() => setShowAddPrayer(false)}
            onAdd={async (intention, category) => {
              await createPrayer({ intention, category });
              setShowAddPrayer(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Visit Modal */}
      <AnimatePresence>
        {showAddVisit && (
          <AddVisitModal
            onClose={() => setShowAddVisit(false)}
            onAdd={async (churchName, visitDate, notes) => {
              await createVisit({ churchName, visitDate, notes });
              setShowAddVisit(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <ApiKeyModal
            onClose={() => setShowApiKeyModal(false)}
            onSave={(key) => {
              setScrapeApiKey(key);
              setShowApiKeyModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 py-6 md:py-8 text-center border-t border-amber-500/10 mt-8 md:mt-12">
        <p className="text-amber-200/30 text-xs">
          Requested by @stringer_kade · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

function AddPrayerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (intention: string, category: string) => Promise<void> }) {
  const [intention, setIntention] = useState("");
  const [category, setCategory] = useState("guidance");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention.trim()) return;
    setIsSubmitting(true);
    await onAdd(intention, category);
    setIsSubmitting(false);
  };

  const categories = [
    { id: "healing", label: "Healing", color: "bg-emerald-500/20 text-emerald-300" },
    { id: "gratitude", label: "Gratitude", color: "bg-amber-500/20 text-amber-300" },
    { id: "guidance", label: "Guidance", color: "bg-blue-500/20 text-blue-300" },
    { id: "family", label: "Family", color: "bg-rose-500/20 text-rose-300" },
    { id: "world", label: "World", color: "bg-violet-500/20 text-violet-300" },
    { id: "other", label: "Other", color: "bg-stone-500/20 text-stone-300" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="w-full max-w-md bg-stone-900 rounded-t-3xl sm:rounded-3xl p-6 md:p-8 border border-amber-500/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl md:text-2xl text-amber-100">New Prayer Intention</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-amber-200/50 hover:text-amber-200 hover:bg-stone-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div>
            <label className="block text-amber-200/70 text-sm mb-2">Your prayer intention</label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="What would you like to pray for?"
              rows={4}
              className="w-full px-4 py-3 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none text-base"
            />
          </div>

          <div>
            <label className="block text-amber-200/70 text-sm mb-3">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                    category === cat.id
                      ? `${cat.color} ring-2 ring-amber-400/50`
                      : "bg-stone-800/50 text-amber-200/50 hover:text-amber-200/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!intention.trim() || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isSubmitting ? "Adding..." : "Add Prayer"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AddVisitModal({ onClose, onAdd }: { onClose: () => void; onAdd: (churchName: string, visitDate: number, notes?: string) => Promise<void> }) {
  const [churchName, setChurchName] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) return;
    setIsSubmitting(true);
    await onAdd(churchName, new Date(visitDate).getTime(), notes || undefined);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="w-full max-w-md bg-stone-900 rounded-t-3xl sm:rounded-3xl p-6 md:p-8 border border-amber-500/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl md:text-2xl text-amber-100">Log Church Visit</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-amber-200/50 hover:text-amber-200 hover:bg-stone-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-amber-200/70 text-sm mb-2">Church name</label>
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="St. Mary's Cathedral"
              className="w-full px-4 py-3.5 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-amber-200/70 text-sm mb-2">Visit date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all text-base"
            />
          </div>

          <div>
            <label className="block text-amber-200/70 text-sm mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reflections from your visit..."
              rows={3}
              className="w-full px-4 py-3 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none text-base"
            />
          </div>

          <motion.button
            type="submit"
            disabled={!churchName.trim() || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isSubmitting ? "Logging..." : "Log Visit"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ApiKeyModal({ onClose, onSave }: { onClose: () => void; onSave: (key: string) => void }) {
  const [apiKey, setApiKey] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="w-full max-w-md bg-stone-900 rounded-t-3xl sm:rounded-3xl p-6 md:p-8 border border-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl md:text-2xl text-amber-100">Firecrawl API Key</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-amber-200/50 hover:text-amber-200 hover:bg-stone-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-amber-200/50 text-sm mb-4">
          Enter your Firecrawl API key to scrape faith resources from the web.
        </p>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="fc-xxxxx..."
          className="w-full px-4 py-3.5 bg-stone-800/50 border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all mb-4 text-base"
        />

        <motion.button
          onClick={() => onSave(apiKey)}
          disabled={!apiKey.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          Save & Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

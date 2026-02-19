import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Send prayer reminders every minute
crons.interval(
  "prayer-reminders",
  { minutes: 1 },
  internal.notifications.createPrayerReminders
);

export default crons;

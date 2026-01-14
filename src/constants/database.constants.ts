// Database and collection names
export const DB_NAME = "toulmin_lab";
export const COLLECTIONS = {
  ARGUMENTS: "toulminArguments",
  USERS: "users",
  SUBSCRIBERS: "subscribers",
  // Coach feature collections
  COACH_SESSIONS: "coachSessions",
  COACH_MESSAGES: "coachMessages",
  ARGUMENT_DRAFTS: "argumentDrafts",
  COACH_USAGE: "coachUsage",
  // Analytics collections
  AI_REQUEST_EVENTS: "aiRequestEvents",
  APP_SERVER_EVENTS: "appServerEvents",
};

// TTL for coach data retention (30 days in seconds)
export const COACH_DATA_TTL_SECONDS = 30 * 24 * 60 * 60; // 2,592,000 seconds

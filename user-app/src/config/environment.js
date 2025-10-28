// Environment configuration for TourMate app
export const Environment = {
  // Development settings
  IS_DEVELOPMENT: __DEV__,
  
  // Logging settings
  ENABLE_LOGS: __DEV__ || process.env.NODE_ENV === 'development',
  
  // API settings
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://huzmuglxzkaztzxjerym.supabase.co',
  
  // Supabase settings
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://huzmuglxzkaztzxjerym.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1em11Z2x4emthenR6eGplcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTAwOTUsImV4cCI6MjA3MjYyNjA5NX0.Z4kYsI4OIOvMo1o8uKg6ckBpu2LDAA7q6iKReJUftHw',
  
  // Feature flags
  FEATURES: {
    REAL_TIME_UPDATES: true,
    IMAGE_UPLOAD: true,
    VISIT_TRACKING: true,
    NOTIFICATIONS: true,
    CACHING: true
  },
  
  // Cache settings
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 50, // Maximum number of cached items
    CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutes
  },
  
  // Error reporting
  ERROR_REPORTING: {
    ENABLED: !__DEV__,
    SAMPLE_RATE: 0.1 // 10% of errors in production
  }
};

export default Environment;

export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    host: process.env.APP_HOST ?? 'localhost',
    name: process.env.APP_NAME ?? 'fido2-auth-api',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    logLevel: process.env.LOG_LEVEL ?? 'debug',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'fido2_auth',
    logging: process.env.DB_LOGGING === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-this-secret-min-32-chars!!',
    expiresIn: parseInt(process.env.JWT_EXPIRATION ?? '900', 10),
    refreshExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION ?? '604800', 10),
  },
  fido2: {
    rpId: process.env.RP_ID ?? 'localhost',
    rpName: process.env.RP_NAME ?? 'FIDO2 Auth Service',
    origin: process.env.ORIGIN ?? 'http://localhost:3000',
  },
  android: {
    packageName: process.env.ANDROID_PACKAGE_NAME ?? 'com.niksxu.mobile',
    sha256Fingerprints: (process.env.ANDROID_SHA256_FINGERPRINTS ?? '')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '3600000', 10),
    maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS ?? '10', 10),
    accountLockDurationMs: parseInt(process.env.ACCOUNT_LOCK_DURATION_MS ?? '900000', 10),
    accountLockThreshold: parseInt(process.env.ACCOUNT_LOCK_THRESHOLD ?? '5', 10),
  },
});

// Dynamic Expo config — wraps static app.json and injects runtime env vars.
// For local dev: EXPO_PUBLIC_API_URL is written by `npm run setup:network` → mobile/.env.local
// For production: set EXPO_PUBLIC_API_URL via EAS Build environment variables.
// When absent, apiBaseUrl is undefined and client.ts falls back to its built-in default.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || undefined,
  },
});

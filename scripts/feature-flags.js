/**
 * UDML Feature Flag Configuration
 * 
 * This file configures the Unleash client for feature flag management.
 * It allows for controlled feature rollouts and A/B testing.
 */

const { initialize } = require('unleash-client');

// Initialize the client
const unleash = initialize({
  url: process.env.UNLEASH_URL || 'https://unleash.example.com/api',
  appName: 'udml',
  instanceId: process.env.UNLEASH_INSTANCE_ID || 'development',
  // For development environments:
  disableMetrics: process.env.NODE_ENV !== 'production',
  // When UNLEASH_URL is not configured, use a local fallback
  customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN },
});

// Define all available feature flags with fallback values for local development
const FEATURES = {
  ENABLE_COMPONENT_DIFF: 'enable-component-diff', // For component-instance diff analysis
  ENABLE_AUTO_SLOTS: 'enable-auto-slots', // For automatic slot detection
  ENABLE_ADVANCED_PATTERNS: 'enable-advanced-patterns', // For advanced pattern recognition
  ENABLE_AI_SUGGESTIONS: 'enable-ai-suggestions', // For AI-powered suggestions
};

// Helper to check if a feature is enabled with a default fallback
function isFeatureEnabled(featureName, fallback = false) {
  // During development, if Unleash is not properly configured, use fallbacks
  if (!process.env.UNLEASH_URL) {
    // Development fallbacks - enable everything in dev by default
    const devDefaults = {
      [FEATURES.ENABLE_COMPONENT_DIFF]: true,
      [FEATURES.ENABLE_AUTO_SLOTS]: true,
      [FEATURES.ENABLE_ADVANCED_PATTERNS]: true,
      [FEATURES.ENABLE_AI_SUGGESTIONS]: false, // Disabled by default even in dev
    };
    return devDefaults[featureName] ?? fallback;
  }
  
  return unleash.isEnabled(featureName, {}, fallback);
}

module.exports = {
  isFeatureEnabled,
  FEATURES,
  unleash,
}; 
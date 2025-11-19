// BankEase React 19 Configuration and Feature Flags

export const BANKEASE_CONFIG = {
  // Concurrent Features
  concurrent: {
    enableStartTransition: true,
    enableUseDeferredValue: true,
    enableSuspense: true,
    batchUpdates: true,
  },

  // New Hooks Configuration
  hooks: {
    enableUseHook: true,
    enableUseOptimistic: true,
    enableUseActionState: true,
    enableUseFormStatus: true,
  },

  // Performance Optimizations
  performance: {
    enableMemoization: true,
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableTreeShaking: true,
  },

  // Security Enhancements
  security: {
    enableXSSProtection: true,
    enableCSRFProtection: true,
    sanitizeInputs: true,
    validateUrls: true,
  },

  // Development Features
  development: {
    enableStrictMode: import.meta.env.DEV,
    enableDevTools: import.meta.env.DEV,
    enableHotReload: import.meta.env.DEV,
  },

  // Error Handling
  errorHandling: {
    enableErrorBoundaries: true,
    enableErrorReporting: true,
    enableFallbackUI: true,
  },
} as const

// BankEase Feature Detection
export const isBankEaseFeature = (feature: keyof typeof BANKEASE_CONFIG) => {
  return BANKEASE_CONFIG[feature] !== undefined
}

// BankEase Performance Metrics - Optimized thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Time to Interactive (TTI)
  tti: 5000, // 5 seconds (more realistic for banking app)
  
  // First Contentful Paint (FCP)
  fcp: 2000, // 2 seconds
  
  // Largest Contentful Paint (LCP)
  lcp: 4000, // 4 seconds (banking apps load more data)
  
  // Cumulative Layout Shift (CLS)
  cls: 0.15,
  
  // First Input Delay (FID)
  fid: 150, // 150ms
} as const

export default BANKEASE_CONFIG

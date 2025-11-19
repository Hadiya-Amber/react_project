// Browser Extension Error Suppression Utility

const EXTENSION_ERROR_PATTERNS = [
  'Could not establish connection',
  'Receiving end does not exist',
  'message channel closed',
  'Extension context invalidated',
  'whatsapp-express-fte',
  'chatgpt-express-fte',
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://',
  'A listener indicated an asynchronous response',
  'Failed to fetch bank stats',
  'CanceledError',
  'AxiosError',
  'The play() request was interrupted',
  'AbortError'
]

const EXTENSION_SCRIPT_PATTERNS = [
  'whatsapp-express-fte.js',
  'chatgpt-express-fte.js',
  'chrome-extension',
  'moz-extension',
  'safari-web-extension'
]

// Check if error is from browser extension
export const isExtensionError = (error: string | Error): boolean => {
  const message = typeof error === 'string' ? error : error.message || ''
  return EXTENSION_ERROR_PATTERNS.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  )
}

// Check if script is from browser extension
export const isExtensionScript = (source?: string): boolean => {
  if (!source) return false
  return EXTENSION_SCRIPT_PATTERNS.some(pattern => 
    source.toLowerCase().includes(pattern.toLowerCase())
  )
}

// Enhanced error suppression for React 19
export const suppressExtensionErrors = (): void => {
  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    if (isExtensionError(reason) || 
        (reason?.name === 'CanceledError') ||
        (reason?.code === 'ERR_CANCELED') ||
        (reason?.message?.includes('bank stats'))) {
      event.preventDefault()
      // Only log in development and not for common cancellation errors
      if (import.meta.env.DEV && 
          !reason?.message?.includes('bank stats') &&
          reason?.name !== 'CanceledError') {
        console.debug('🔇 Suppressed extension error:', reason?.message)
      }
    }
  })

  // Suppress script errors from extensions
  window.addEventListener('error', (event) => {
    if (
      isExtensionError(event.message) || 
      isExtensionScript(event.filename)
    ) {
      event.preventDefault()
      if (import.meta.env.DEV) {
        console.debug('🔇 Suppressed extension script error:', event.message)
      }
      return false
    }
  })

  // Suppress console errors from extensions (optional)
  if (import.meta.env.PROD) {
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      if (!isExtensionError(message)) {
        originalConsoleError.apply(console, args)
      }
    }
  }
}

// Initialize extension error suppression
export const initExtensionErrorSuppression = (): void => {
  if (typeof window !== 'undefined') {
    suppressExtensionErrors()
  }
}

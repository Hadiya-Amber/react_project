import { createRoot } from 'react-dom/client'
import { startTransition } from 'react'
import App from './App.tsx'
import './utils/errorHandler'
import { initExtensionErrorSuppression } from './utils/extensionErrorSuppression'
import './utils/extensionBlocker'

// Initialize browser extension error suppression
initExtensionErrorSuppression()

// React 19 enhanced error handling for browser extensions and media
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || ''
  const name = event.reason?.name || ''
  if (
    message.includes('message channel closed') ||
    message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist') ||
    message.includes('Extension context invalidated') ||
    message.includes('bank stats') ||
    message.includes('play() request was interrupted') ||
    name === 'CanceledError' ||
    name === 'AbortError' ||
    event.reason?.code === 'ERR_CANCELED'
  ) {
    event.preventDefault()
    return
  }
})

window.addEventListener('error', (event) => {
  const message = event.message || ''
  if (
    message.includes('whatsapp-express-fte') ||
    message.includes('chatgpt-express-fte') ||
    message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist')
  ) {
    event.preventDefault()
    return false
  }
})

// React 19 performance observer for page load (suppress in production)
if ('PerformanceObserver' in window && import.meta.env.DEV) {
  setTimeout(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const loadTime = Math.round(entry.duration)
        }
      })
    })
    observer.observe({ entryTypes: ['navigation'] })
  }, 1000)
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// React 19 concurrent rendering with startTransition
startTransition(() => {
  try {
    createRoot(rootElement).render(<App />)
  } catch (error) {
    rootElement.innerHTML = '<div style="padding: 20px; color: red; font-family: Inter, sans-serif;">🏦 BankEase failed to load. Please refresh the page.</div>'
  }
})

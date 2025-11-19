import React, { startTransition } from 'react'
import { PERFORMANCE_THRESHOLDS } from '@/config/bankease.config'

// BankEase Performance Monitoring
export class BankEasePerformanceMonitor {
  private static instance: BankEasePerformanceMonitor
  private metrics: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []
  private isInitialized = false

  static getInstance(): BankEasePerformanceMonitor {
    if (!BankEasePerformanceMonitor.instance) {
      BankEasePerformanceMonitor.instance = new BankEasePerformanceMonitor()
    }
    return BankEasePerformanceMonitor.instance
  }

  // Initialize performance monitoring
  init() {
    if (typeof window === 'undefined' || this.isInitialized) return
    this.isInitialized = true

    // Delay initialization to avoid blocking main thread
    setTimeout(() => {
      this.observeWebVitals()
      this.observeNavigationTiming()
      this.observeResourceTiming()
    }, 100)
  }

  // Observe Core Web Vitals
  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
      this.recordMetric('lcp', lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(lcpObserver)

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.recordMetric('fid', entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.push(fidObserver)

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric('cls', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(clsObserver)
  }

  // Observe Navigation Timing
  private observeNavigationTiming() {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.recordMetric('ttfb', entry.responseStart - entry.requestStart)
        this.recordMetric('domContentLoaded', entry.domContentLoadedEventEnd - entry.navigationStart)
        this.recordMetric('loadComplete', entry.loadEventEnd - entry.navigationStart)
      })
    })
    navigationObserver.observe({ entryTypes: ['navigation'] })
    this.observers.push(navigationObserver)
  }

  // Observe Resource Timing
  private observeResourceTiming() {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.recordMetric(`resource_${entry.name}`, entry.duration)
        }
      })
    })
    resourceObserver.observe({ entryTypes: ['resource'] })
    this.observers.push(resourceObserver)
  }

  // Record performance metric
  recordMetric(name: string, value: number) {
    this.metrics.set(name, value)
    
    // Check against thresholds
    this.checkThreshold(name, value)
  }

  // Check performance thresholds
  private checkThreshold(name: string, value: number) {
    const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS]
    if (threshold && value > threshold && import.meta.env.DEV) {
      console.warn(`⚠️ Performance threshold exceeded for ${name}: ${Math.round(value)}ms (threshold: ${threshold}ms)`)
    }
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Get specific metric
  getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// BankEase Concurrent Rendering Performance
export const measureConcurrentPerformance = (
  name: string,
  fn: () => void | Promise<void>
) => {
  const start = performance.now()
  
  startTransition(async () => {
    try {
      await fn()
    } finally {
      const duration = performance.now() - start
      BankEasePerformanceMonitor.getInstance().recordMetric(`concurrent_${name}`, duration)
    }
  })
}

// BankEase Component Performance Wrapper
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const start = performance.now()
    
    React.useEffect(() => {
      const duration = performance.now() - start
      BankEasePerformanceMonitor.getInstance().recordMetric(`component_${componentName}`, duration)
    })

    return React.createElement(Component, props)
  }
}

// Initialize BankEase performance monitoring
export const initBankEasePerformance = () => {
  if (typeof window !== 'undefined') {
    BankEasePerformanceMonitor.getInstance().init()
  }
}

// Export BankEase performance monitor singleton
export const bankeasePerformanceMonitor = BankEasePerformanceMonitor.getInstance()

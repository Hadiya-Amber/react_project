import { useState, useEffect, useReducer, useCallback, useMemo, startTransition } from 'react'

// React 19 enhanced reducer for complex state logic
interface CounterState {
  count: number
  step: number
}

type CounterAction = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; payload: number }

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'reset':
      return { ...state, count: 0 }
    case 'setStep':
      return { ...state, step: Math.max(0, action.payload) } // Prevent negative steps
    default:
      return state
  }
}

// React 19 enhanced counter with concurrent features
export const useCounter = (initialCount = 0, initialStep = 1) => {
  const [state, dispatch] = useReducer(counterReducer, {
    count: initialCount,
    step: initialStep,
  })

  const increment = useCallback(() => {
    startTransition(() => {
      dispatch({ type: 'increment' })
    })
  }, [])
  
  const decrement = useCallback(() => {
    startTransition(() => {
      dispatch({ type: 'decrement' })
    })
  }, [])
  
  const reset = useCallback(() => {
    startTransition(() => {
      dispatch({ type: 'reset' })
    })
  }, [])
  
  const setStep = useCallback((step: number) => {
    startTransition(() => {
      dispatch({ type: 'setStep', payload: step })
    })
  }, [])

  return { ...state, increment, decrement, reset, setStep }
}

// React 19 enhanced WebSocket hook with security improvements
export const useWebSocket = (url: string, allowedOrigins: string[] = []) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closed'>('Connecting')

  // Enhanced URL validation to prevent SSRF attacks
  const isValidWsUrl = useMemo(() => {
    try {
      const parsedUrl = new URL(url)
      
      // Check protocol
      if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') {
        return false
      }
      
      // Check if origin is allowed (security enhancement)
      if (allowedOrigins.length > 0) {
        const origin = `${parsedUrl.protocol}//${parsedUrl.host}`
        return allowedOrigins.includes(origin)
      }
      
      // Prevent connections to private/local networks
      const hostname = parsedUrl.hostname
      const privateNetworks = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^192\.168\./,
        /^localhost$/i,
        /^0\.0\.0\.0$/
      ]
      
      return !privateNetworks.some(pattern => pattern.test(hostname))
    } catch {
      return false
    }
  }, [url, allowedOrigins])

  useEffect(() => {
    if (!isValidWsUrl) {
      setConnectionStatus('Closed')
      return
    }

    const ws = new WebSocket(url)
    setSocket(ws)

    ws.onopen = () => {
      startTransition(() => {
        setConnectionStatus('Open')
      })
    }
    
    ws.onclose = () => {
      startTransition(() => {
        setConnectionStatus('Closed')
      })
    }
    
    ws.onmessage = (event) => {
      startTransition(() => {
        // Sanitize message data
        const sanitizedData = typeof event.data === 'string' 
          ? event.data.replace(/<script[^>]*>.*?<\/script>/gi, '') 
          : event.data
        setLastMessage(sanitizedData)
      })
    }

    ws.onerror = () => {
      startTransition(() => {
        setConnectionStatus('Closed')
      })
    }

    return () => {
      ws.close()
    }
  }, [url, isValidWsUrl])

  const sendMessage = useCallback((message: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      // Sanitize outgoing messages
      const sanitizedMessage = message.replace(/<script[^>]*>.*?<\/script>/gi, '')
      socket.send(sanitizedMessage)
    }
  }, [socket])

  return { lastMessage, connectionStatus, sendMessage, isConnected: connectionStatus === 'Open' }
}

// React 19 enhanced debounce hook with concurrent features
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        setDebouncedValue(value)
      })
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// React 19 enhanced throttle hook
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const [lastRan, setLastRan] = useState<number>(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        startTransition(() => {
          setThrottledValue(value)
          setLastRan(Date.now())
        })
      }
    }, limit - (Date.now() - lastRan))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit, lastRan])

  return throttledValue
}

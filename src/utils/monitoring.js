const isBrowser = typeof window !== 'undefined'
const endpoint = import.meta.env.VITE_MONITORING_ENDPOINT
const parsedSampleRate = Number.parseFloat(import.meta.env.VITE_MONITORING_SAMPLE_RATE ?? '1')
const sampleRate = Number.isFinite(parsedSampleRate) ? Math.min(Math.max(parsedSampleRate, 0), 1) : 1

const shouldSend = () => Boolean(endpoint) && Math.random() < sampleRate

const sendPayload = payload => {
  if (!isBrowser || !endpoint || !shouldSend()) return

  const body = {
    ...payload,
    url: window.location.href,
    userAgent: window.navigator?.userAgent,
    timestamp: new Date().toISOString()
  }

  try {
    const serialized = JSON.stringify(body)
    if (navigator.sendBeacon) {
      const blob = new Blob([serialized], { type: 'application/json' })
      navigator.sendBeacon(endpoint, blob)
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
        keepalive: true
      }).catch(() => {})
    }
  } catch (error) {
    console.error('Monitoring send failed', error)
  }
}

export const reportError = (error, context = {}) => {
  const message = error?.message ?? String(error)
  sendPayload({
    type: 'error',
    message,
    stack: error?.stack,
    context
  })
}

export const reportEvent = (name, context = {}) => {
  sendPayload({
    type: 'event',
    name,
    context
  })
}

export const setupGlobalErrorHandlers = () => {
  if (!isBrowser) return () => {}

  const handleError = event => {
    const error = event?.error ?? event?.reason ?? event
    reportError(error, { source: 'global' })
  }

  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleError)

  return () => {
    window.removeEventListener('error', handleError)
    window.removeEventListener('unhandledrejection', handleError)
  }
}

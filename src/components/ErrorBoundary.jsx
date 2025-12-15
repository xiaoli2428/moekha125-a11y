import React from 'react'
import { reportError } from '../utils/monitoring'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    reportError(error, { source: 'react-boundary', componentStack: info?.componentStack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <p className="font-semibold">Something went wrong.</p>
          <p className="text-sm text-red-800">Please refresh the page or try again later.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

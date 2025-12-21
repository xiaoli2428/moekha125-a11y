import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './entry-optimised';
import './index.css';

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,      // 1 minute
            gcTime: 5 * 60_000,     // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
});

// Register service worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
            registration => console.log('SW registered:', registration.scope),
            err => console.log('SW registration failed:', err)
        );
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);

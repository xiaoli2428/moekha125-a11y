/**
 * Heavy chart component - lazy loaded
 * Only downloads/renders when user scrolls to it
 */
export default function LazyChart() {
    return (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Trading Chart</h3>
            <div className="h-96 flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>Chart Component Loaded</p>
                    <p className="text-sm mt-2">This was lazy-loaded to improve initial page load</p>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TIMEZONES } from '../timezones.js';
import './MultiTimezoneClock.css';

/**
 * Default localStorage keys
 */
const DEFAULT_ZONES_KEY = 'multiClock:zones';
const DEFAULT_HOUR12_KEY = 'multiClock:hour12';

/**
 * Normalize a stored payload to the new format with timestamps and tombstones.
 * Handles legacy array format and migrates to the normalized payload.
 * @param {any} data - Raw data from localStorage
 * @returns {{items: Array<{tz: string, ts: number, deleted?: boolean}>, hour12: {value: boolean, ts: number}, ts: number}}
 */
function normalizePayload(data) {
  const now = Date.now();
  
  // If data is null/undefined, return empty state
  if (data == null) {
    return { items: [], hour12: { value: true, ts: now }, ts: now };
  }
  
  // Legacy format: plain array of zone strings
  if (Array.isArray(data)) {
    return {
      items: data.map((tz, idx) => ({
        tz,
        ts: now - (data.length - idx), // Preserve order by staggering timestamps
        deleted: false
      })),
      hour12: { value: true, ts: now },
      ts: now
    };
  }
  
  // Already normalized format (check for items array)
  if (typeof data === 'object' && Array.isArray(data.items)) {
    return {
      items: data.items.map(item => ({
        tz: item.tz || item.zone || item,
        ts: item.ts || item.addedAt || now,
        deleted: item.deleted || item.removed || false
      })),
      hour12: data.hour12 && typeof data.hour12 === 'object' 
        ? data.hour12 
        : { value: data.hour12 !== undefined ? Boolean(data.hour12) : true, ts: now },
      ts: data.ts || data.updatedAt || now
    };
  }
  
  // Legacy object format with zones array
  if (typeof data === 'object' && Array.isArray(data.zones)) {
    return {
      items: data.zones.map(item => ({
        tz: typeof item === 'string' ? item : (item.zone || item.tz),
        ts: item.addedAt || item.ts || now,
        deleted: item.removed || item.deleted || false
      })),
      hour12: { value: data.hour12 !== undefined ? Boolean(data.hour12) : true, ts: now },
      ts: data.updatedAt || data.ts || now
    };
  }
  
  // Unknown format, return empty
  return { items: [], hour12: { value: true, ts: now }, ts: now };
}

/**
 * Load state from localStorage
 * @param {string} zonesKey
 * @param {string} hour12Key
 * @returns {{items: Array, hour12: {value: boolean, ts: number}, ts: number}}
 */
function loadFromStorage(zonesKey, hour12Key) {
  try {
    const zonesData = localStorage.getItem(zonesKey);
    const hour12Data = localStorage.getItem(hour12Key);
    
    let parsed = null;
    if (zonesData) {
      parsed = JSON.parse(zonesData);
    }
    
    const normalized = normalizePayload(parsed);
    
    // Override hour12 if separately stored (legacy support)
    if (hour12Data !== null) {
      normalized.hour12 = { value: hour12Data === 'true', ts: Date.now() };
    }
    
    return normalized;
  } catch {
    return { items: [], hour12: { value: true, ts: Date.now() }, ts: Date.now() };
  }
}

/**
 * Save state to localStorage
 * @param {string} zonesKey
 * @param {string} hour12Key
 * @param {{items: Array, hour12: {value: boolean, ts: number}, ts: number}} state
 */
function saveToStorage(zonesKey, hour12Key, state) {
  try {
    localStorage.setItem(zonesKey, JSON.stringify(state));
    localStorage.setItem(hour12Key, String(state.hour12.value));
  } catch {
    // Storage quota exceeded or not available
  }
}

/**
 * Conflict resolution strategies
 */
const resolveConflict = {
  /**
   * Replace local with remote entirely
   */
  replace: (local, remote) => remote,
  
  /**
   * Merge zones from both, keeping all unique zones
   */
  merge: (local, remote) => {
    const allItems = new Map();
    
    // Add local items
    for (const item of local.items) {
      allItems.set(item.tz, { ...item });
    }
    
    // Add remote items (overwrite if newer)
    for (const item of remote.items) {
      const existing = allItems.get(item.tz);
      if (!existing || item.ts > existing.ts) {
        allItems.set(item.tz, { ...item });
      }
    }
    
    // Sort by ts descending (recent first), filter out deleted
    const items = Array.from(allItems.values())
      .filter(z => !z.deleted)
      .sort((a, b) => b.ts - a.ts);
    
    return {
      items,
      hour12: remote.hour12.ts > local.hour12.ts ? remote.hour12 : local.hour12,
      ts: Math.max(local.ts, remote.ts)
    };
  },
  
  /**
   * Last-write-wins: use the payload with the more recent ts
   */
  lww: (local, remote) => {
    return remote.ts > local.ts ? remote : local;
  },
  
  /**
   * Per-item: resolve each zone individually by its ts
   */
  'per-item': (local, remote) => {
    const allItems = new Map();
    
    // Add all local items
    for (const item of local.items) {
      allItems.set(item.tz, { ...item });
    }
    
    // Merge remote items per-item
    for (const item of remote.items) {
      const existing = allItems.get(item.tz);
      if (!existing) {
        allItems.set(item.tz, { ...item });
      } else {
        // Per-item: use the one with later ts, respect tombstones
        if (item.ts > existing.ts) {
          allItems.set(item.tz, { ...item });
        } else if (item.ts === existing.ts && item.deleted && !existing.deleted) {
          // Same timestamp but remote has tombstone
          allItems.set(item.tz, { ...item });
        }
      }
    }
    
    // Filter out deleted, sort recent-first
    const items = Array.from(allItems.values())
      .filter(z => !z.deleted)
      .sort((a, b) => b.ts - a.ts);
    
    return {
      items,
      hour12: remote.hour12.ts > local.hour12.ts ? remote.hour12 : local.hour12,
      ts: Math.max(local.ts, remote.ts)
    };
  }
};

/**
 * MultiTimezoneClock - A React component for displaying multiple timezone clocks
 * 
 * @param {Object} props
 * @param {string} [props.locale] - Locale for formatting (e.g., 'en-US', 'de-DE')
 * @param {Object} [props.timeOptions] - Intl.DateTimeFormat options for time display
 * @param {Object} [props.dateOptions] - Intl.DateTimeFormat options for date display
 * @param {string} [props.storageKeyPrefix] - Prefix for localStorage keys
 * @param {'replace'|'merge'|'lww'|'per-item'} [props.syncStrategy='per-item'] - Cross-tab sync conflict resolution strategy
 * @param {string[]} [props.availableTimezones] - Custom list of available timezones
 */
export default function MultiTimezoneClock({
  locale,
  timeOptions,
  dateOptions,
  storageKeyPrefix = 'multiClock',
  syncStrategy = 'per-item',
  availableTimezones = TIMEZONES
}) {
  const zonesKey = `${storageKeyPrefix}:zones`;
  const hour12Key = `${storageKeyPrefix}:hour12`;
  
  // State
  const [state, setState] = useState(() => loadFromStorage(zonesKey, hour12Key));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importText, setImportText] = useState('');
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Filtered timezones for dropdown
  const filteredTimezones = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return availableTimezones.filter(tz => 
      tz.toLowerCase().includes(query) &&
      !state.items.some(z => z.tz === tz && !z.deleted)
    );
  }, [searchQuery, availableTimezones, state.items]);
  
  // Active (non-deleted) items
  const activeItems = useMemo(() => {
    return state.items.filter(z => !z.deleted);
  }, [state.items]);
  
  // Show toast notification
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);
  
  // Save to storage when state changes
  useEffect(() => {
    saveToStorage(zonesKey, hour12Key, state);
  }, [state, zonesKey, hour12Key]);
  
  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Cross-tab sync via storage event
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === zonesKey && event.newValue) {
        try {
          const remoteData = JSON.parse(event.newValue);
          const remote = normalizePayload(remoteData);
          
          setState(currentState => {
            const resolver = resolveConflict[syncStrategy] || resolveConflict['per-item'];
            const resolved = resolver(currentState, remote);
            
            // Show toast if items changed
            const localTzSet = new Set(currentState.items.filter(z => !z.deleted).map(z => z.tz));
            const resolvedTzSet = new Set(resolved.items.map(z => z.tz));
            
            if (localTzSet.size !== resolvedTzSet.size || 
                ![...localTzSet].every(z => resolvedTzSet.has(z))) {
              showToast('Synced from another tab');
            }
            
            return resolved;
          });
        } catch {
          // Invalid JSON, ignore
        }
      }
      
      if (event.key === hour12Key && event.newValue !== null) {
        const newHour12 = event.newValue === 'true';
        setState(prev => {
          if (prev.hour12.value !== newHour12) {
            showToast('Synced from another tab');
            return { ...prev, hour12: { value: newHour12, ts: Date.now() }, ts: Date.now() };
          }
          return prev;
        });
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [zonesKey, hour12Key, syncStrategy, showToast]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Add a timezone
  const addTimezone = useCallback((tz) => {
    const now = Date.now();
    setState(prev => {
      // Check if already exists
      const existingIdx = prev.items.findIndex(z => z.tz === tz);
      
      if (existingIdx >= 0) {
        // Re-add if it was deleted
        if (prev.items[existingIdx].deleted) {
          const newItems = [...prev.items];
          newItems[existingIdx] = { tz, ts: now, deleted: false };
          // Sort recent-first
          newItems.sort((a, b) => b.ts - a.ts);
          return { ...prev, items: newItems, ts: now };
        }
        return prev; // Already exists and not deleted
      }
      
      // Add new item at the beginning (recent-first)
      const newItems = [{ tz, ts: now, deleted: false }, ...prev.items];
      return { ...prev, items: newItems, ts: now };
    });
    
    setSearchQuery('');
    setIsDropdownOpen(false);
  }, []);
  
  // Remove a timezone (soft delete with tombstone)
  const removeTimezone = useCallback((tz) => {
    const now = Date.now();
    setState(prev => {
      const newItems = prev.items.map(z => 
        z.tz === tz ? { ...z, deleted: true, ts: now } : z
      );
      return { ...prev, items: newItems, ts: now };
    });
  }, []);
  
  // Toggle 12/24 hour format
  const toggleHour12 = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      hour12: { value: !prev.hour12.value, ts: now },
      ts: now
    }));
  }, []);
  
  // Export configuration
  const exportConfig = useCallback(() => {
    const exportData = {
      zones: activeItems.map(z => z.tz),
      hour12: state.hour12.value
    };
    return JSON.stringify(exportData, null, 2);
  }, [activeItems, state.hour12.value]);
  
  // Import configuration
  const importConfig = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      const now = Date.now();
      
      let items = [];
      if (Array.isArray(data)) {
        // Plain array of zones
        items = data.map((tz, idx) => ({
          tz,
          ts: now - (data.length - idx),
          deleted: false
        }));
      } else if (data.zones && Array.isArray(data.zones)) {
        // Object with zones array
        items = data.zones.map((tz, idx) => ({
          tz: typeof tz === 'string' ? tz : tz.tz,
          ts: now - (data.zones.length - idx),
          deleted: false
        }));
      }
      
      // Validate timezones
      items = items.filter(z => {
        try {
          new Intl.DateTimeFormat(locale, { timeZone: z.tz });
          return true;
        } catch {
          return false;
        }
      });
      
      if (items.length === 0) {
        showToast('No valid timezones found');
        return;
      }
      
      setState({
        items,
        hour12: { value: data.hour12 !== undefined ? data.hour12 : true, ts: now },
        ts: now
      });
      
      showToast(`Imported ${items.length} timezone(s)`);
      setImportText('');
      setShowImportExport(false);
    } catch {
      showToast('Invalid JSON format');
    }
  }, [locale, showToast]);
  
  // Format time for a timezone
  const formatTime = useCallback((date, timeZone) => {
    const options = {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: state.hour12.value,
      ...timeOptions
    };
    
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return '--:--:--';
    }
  }, [locale, state.hour12.value, timeOptions]);
  
  // Format date for a timezone
  const formatDate = useCallback((date, timeZone) => {
    const options = {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      ...dateOptions
    };
    
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return '---';
    }
  }, [locale, dateOptions]);
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };
  
  // Handle keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    } else if (e.key === 'Enter' && filteredTimezones.length > 0) {
      addTimezone(filteredTimezones[0]);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      setIsDropdownOpen(true);
    }
  };
  
  return (
    <div className="multi-clock" role="region" aria-label="Multi-timezone clock">
      {/* Toast */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span className="dot"></span>
          {toast}
        </div>
      )}
      
      {/* Toolbar */}
      <div className="toolbar">
        <div ref={dropdownRef} style={{ position: 'relative', flex: '1 1 200px' }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search timezone..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            aria-label="Search timezones"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-controls="timezone-listbox"
          />
          
          {isDropdownOpen && filteredTimezones.length > 0 && (
            <ul
              id="timezone-listbox"
              role="listbox"
              aria-label="Available timezones"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--card)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '8px',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                zIndex: 100
              }}
            >
              {filteredTimezones.slice(0, 20).map(tz => (
                <li
                  key={tz}
                  role="option"
                  aria-selected={false}
                  onClick={() => addTimezone(tz)}
                  onKeyDown={(e) => e.key === 'Enter' && addTimezone(tz)}
                  tabIndex={0}
                  style={{
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--muted)'
                  }}
                >
                  {tz}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button onClick={toggleHour12} aria-pressed={state.hour12.value}>
          {state.hour12.value ? '12h' : '24h'}
        </button>
        
        <button onClick={() => setShowImportExport(!showImportExport)} aria-expanded={showImportExport}>
          {showImportExport ? 'Close' : 'Import/Export'}
        </button>
      </div>
      
      {/* Import/Export Panel */}
      {showImportExport && (
        <div style={{ marginBottom: '12px' }}>
          <textarea
            placeholder="Paste JSON to import or copy export below"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              color: 'var(--muted)',
              padding: '8px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              resize: 'vertical'
            }}
            aria-label="Import/Export JSON"
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="primary" onClick={() => importConfig(importText)} disabled={!importText.trim()}>
              Import
            </button>
            <button onClick={async () => {
              try {
                if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(exportConfig());
                  showToast('Copied to clipboard');
                }
              } catch {
                showToast('Failed to copy');
              }
            }}>
              Copy Export
            </button>
          </div>
        </div>
      )}
      
      {/* Clock Grid */}
      {activeItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }} role="status">
          No clocks added. Search for a timezone above.
        </div>
      ) : (
        <div className="zones" role="list" aria-label="Timezone clocks">
          {activeItems.map(({ tz, ts }) => (
            <div
              key={`${tz}-${ts}`}
              className="zone"
              role="listitem"
              aria-label={`Clock for ${tz}`}
            >
              <div className="tz">
                <span className="name">{tz}</span>
                <button
                  onClick={() => removeTimezone(tz)}
                  aria-label={`Remove ${tz}`}
                  title="Remove"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
              <div className="time" aria-live="polite" aria-atomic="true">
                {formatTime(currentTime, tz)}
              </div>
              <div className="date">
                {formatDate(currentTime, tz)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

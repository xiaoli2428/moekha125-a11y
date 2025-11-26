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
 * @returns {{zones: Array<{zone: string, addedAt: number, removed?: boolean}>, hour12: boolean, updatedAt: number}}
 */
function normalizePayload(data) {
  const now = Date.now();
  
  // If data is null/undefined, return empty state
  if (data == null) {
    return { zones: [], hour12: true, updatedAt: now };
  }
  
  // Legacy format: plain array of zone strings
  if (Array.isArray(data)) {
    return {
      zones: data.map((zone, idx) => ({
        zone,
        addedAt: now - (data.length - idx), // Preserve order by staggering timestamps
        removed: false
      })),
      hour12: true,
      updatedAt: now
    };
  }
  
  // Already normalized format
  if (typeof data === 'object' && Array.isArray(data.zones)) {
    return {
      zones: data.zones.map(item => ({
        zone: item.zone || item,
        addedAt: item.addedAt || now,
        removed: item.removed || false
      })),
      hour12: data.hour12 !== undefined ? data.hour12 : true,
      updatedAt: data.updatedAt || now
    };
  }
  
  // Unknown format, return empty
  return { zones: [], hour12: true, updatedAt: now };
}

/**
 * Load state from localStorage
 * @param {string} zonesKey
 * @param {string} hour12Key
 * @returns {{zones: Array, hour12: boolean, updatedAt: number}}
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
      normalized.hour12 = hour12Data === 'true';
    }
    
    return normalized;
  } catch {
    return { zones: [], hour12: true, updatedAt: Date.now() };
  }
}

/**
 * Save state to localStorage
 * @param {string} zonesKey
 * @param {string} hour12Key
 * @param {{zones: Array, hour12: boolean, updatedAt: number}} state
 */
function saveToStorage(zonesKey, hour12Key, state) {
  try {
    localStorage.setItem(zonesKey, JSON.stringify(state));
    localStorage.setItem(hour12Key, String(state.hour12));
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
    const allZones = new Map();
    
    // Add local zones
    for (const item of local.zones) {
      allZones.set(item.zone, { ...item });
    }
    
    // Add remote zones (overwrite if exists)
    for (const item of remote.zones) {
      const existing = allZones.get(item.zone);
      if (!existing || item.addedAt > existing.addedAt) {
        allZones.set(item.zone, { ...item });
      }
    }
    
    // Sort by addedAt descending (recent first)
    const zones = Array.from(allZones.values())
      .filter(z => !z.removed)
      .sort((a, b) => b.addedAt - a.addedAt);
    
    return {
      zones,
      hour12: remote.hour12,
      updatedAt: Math.max(local.updatedAt, remote.updatedAt)
    };
  },
  
  /**
   * Last-write-wins: use the payload with the more recent updatedAt
   */
  lww: (local, remote) => {
    return remote.updatedAt > local.updatedAt ? remote : local;
  },
  
  /**
   * Per-item: resolve each zone individually by its addedAt timestamp
   */
  'per-item': (local, remote) => {
    const allZones = new Map();
    
    // Add all local zones
    for (const item of local.zones) {
      allZones.set(item.zone, { ...item });
    }
    
    // Merge remote zones per-item
    for (const item of remote.zones) {
      const existing = allZones.get(item.zone);
      if (!existing) {
        allZones.set(item.zone, { ...item });
      } else {
        // Per-item: use the one with later addedAt, respect tombstones
        if (item.addedAt > existing.addedAt) {
          allZones.set(item.zone, { ...item });
        } else if (item.addedAt === existing.addedAt && item.removed && !existing.removed) {
          // Same timestamp but remote has tombstone
          allZones.set(item.zone, { ...item });
        }
      }
    }
    
    // Filter out removed, sort recent-first
    const zones = Array.from(allZones.values())
      .filter(z => !z.removed)
      .sort((a, b) => b.addedAt - a.addedAt);
    
    return {
      zones,
      hour12: remote.updatedAt > local.updatedAt ? remote.hour12 : local.hour12,
      updatedAt: Math.max(local.updatedAt, remote.updatedAt)
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
  const [toasts, setToasts] = useState([]);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importText, setImportText] = useState('');
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Filtered timezones for dropdown
  const filteredTimezones = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return availableTimezones.filter(tz => 
      tz.toLowerCase().includes(query) &&
      !state.zones.some(z => z.zone === tz && !z.removed)
    );
  }, [searchQuery, availableTimezones, state.zones]);
  
  // Active (non-removed) zones
  const activeZones = useMemo(() => {
    return state.zones.filter(z => !z.removed);
  }, [state.zones]);
  
  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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
            
            // Show toast if zones changed
            const localZoneSet = new Set(currentState.zones.filter(z => !z.removed).map(z => z.zone));
            const resolvedZoneSet = new Set(resolved.zones.map(z => z.zone));
            
            if (localZoneSet.size !== resolvedZoneSet.size || 
                ![...localZoneSet].every(z => resolvedZoneSet.has(z))) {
              showToast('Clocks synced from another tab', 'info');
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
          if (prev.hour12 !== newHour12) {
            showToast('Time format synced from another tab', 'info');
            return { ...prev, hour12: newHour12, updatedAt: Date.now() };
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
  const addTimezone = useCallback((zone) => {
    const now = Date.now();
    setState(prev => {
      // Check if already exists
      const existingIdx = prev.zones.findIndex(z => z.zone === zone);
      
      if (existingIdx >= 0) {
        // Re-add if it was removed
        if (prev.zones[existingIdx].removed) {
          const newZones = [...prev.zones];
          newZones[existingIdx] = { zone, addedAt: now, removed: false };
          // Sort recent-first
          newZones.sort((a, b) => b.addedAt - a.addedAt);
          return { ...prev, zones: newZones, updatedAt: now };
        }
        return prev; // Already exists and not removed
      }
      
      // Add new zone at the beginning (recent-first)
      const newZones = [{ zone, addedAt: now, removed: false }, ...prev.zones];
      return { ...prev, zones: newZones, updatedAt: now };
    });
    
    setSearchQuery('');
    setIsDropdownOpen(false);
  }, []);
  
  // Remove a timezone (soft delete with tombstone)
  const removeTimezone = useCallback((zone) => {
    const now = Date.now();
    setState(prev => {
      const newZones = prev.zones.map(z => 
        z.zone === zone ? { ...z, removed: true, addedAt: now } : z
      );
      return { ...prev, zones: newZones, updatedAt: now };
    });
  }, []);
  
  // Toggle 12/24 hour format
  const toggleHour12 = useCallback(() => {
    setState(prev => ({
      ...prev,
      hour12: !prev.hour12,
      updatedAt: Date.now()
    }));
  }, []);
  
  // Export configuration
  const exportConfig = useCallback(() => {
    const exportData = {
      zones: activeZones.map(z => z.zone),
      hour12: state.hour12
    };
    return JSON.stringify(exportData, null, 2);
  }, [activeZones, state.hour12]);
  
  // Import configuration
  const importConfig = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      const now = Date.now();
      
      let zones = [];
      if (Array.isArray(data)) {
        // Plain array of zones
        zones = data.map((zone, idx) => ({
          zone,
          addedAt: now - (data.length - idx),
          removed: false
        }));
      } else if (data.zones && Array.isArray(data.zones)) {
        // Object with zones array
        zones = data.zones.map((zone, idx) => ({
          zone: typeof zone === 'string' ? zone : zone.zone,
          addedAt: now - (data.zones.length - idx),
          removed: false
        }));
      }
      
      // Validate timezones
      zones = zones.filter(z => {
        try {
          new Intl.DateTimeFormat(locale, { timeZone: z.zone });
          return true;
        } catch {
          return false;
        }
      });
      
      if (zones.length === 0) {
        showToast('No valid timezones found in import', 'error');
        return;
      }
      
      setState({
        zones,
        hour12: data.hour12 !== undefined ? data.hour12 : true,
        updatedAt: now
      });
      
      showToast(`Imported ${zones.length} timezone(s)`, 'success');
      setImportText('');
      setShowImportExport(false);
    } catch {
      showToast('Invalid JSON format', 'error');
    }
  }, [locale, showToast]);
  
  // Format time for a timezone
  const formatTime = useCallback((date, timeZone) => {
    const options = {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: state.hour12,
      ...timeOptions
    };
    
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return '--:--:--';
    }
  }, [locale, state.hour12, timeOptions]);
  
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
    <div className="multi-timezone-clock" role="region" aria-label="Multi-timezone clock">
      {/* Search and Add */}
      <div className="multi-timezone-clock__header">
        <div className="multi-timezone-clock__dropdown" ref={dropdownRef}>
          <input
            ref={searchInputRef}
            type="text"
            className="multi-timezone-clock__search"
            placeholder="Search and add timezone..."
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
              className="multi-timezone-clock__dropdown-list"
              role="listbox"
              aria-label="Available timezones"
            >
              {filteredTimezones.slice(0, 20).map(tz => (
                <li
                  key={tz}
                  className="multi-timezone-clock__dropdown-item"
                  role="option"
                  aria-selected={false}
                  onClick={() => addTimezone(tz)}
                  onKeyDown={(e) => e.key === 'Enter' && addTimezone(tz)}
                  tabIndex={0}
                >
                  {tz}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="multi-timezone-clock__controls">
        <label className="multi-timezone-clock__toggle">
          <input
            type="checkbox"
            checked={state.hour12}
            onChange={toggleHour12}
            aria-describedby="hour12-desc"
          />
          <span id="hour12-desc">12-hour format</span>
        </label>
        
        <button
          type="button"
          className="multi-timezone-clock__btn"
          onClick={() => setShowImportExport(!showImportExport)}
          aria-expanded={showImportExport}
        >
          Import/Export
        </button>
      </div>
      
      {/* Import/Export Panel */}
      {showImportExport && (
        <div className="multi-timezone-clock__import-export" role="region" aria-label="Import and export settings">
          <h3>Export</h3>
          <textarea
            className="multi-timezone-clock__textarea"
            readOnly
            value={exportConfig()}
            aria-label="Export configuration JSON"
          />
          <button
            type="button"
            className="multi-timezone-clock__btn multi-timezone-clock__btn--small"
            onClick={() => {
              navigator.clipboard?.writeText(exportConfig());
              showToast('Copied to clipboard', 'success');
            }}
          >
            Copy to Clipboard
          </button>
          
          <h3 style={{ marginTop: '1rem' }}>Import</h3>
          <textarea
            className="multi-timezone-clock__textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste JSON here, e.g.: ["America/New_York", "Europe/London"]'
            aria-label="Import configuration JSON"
          />
          <button
            type="button"
            className="multi-timezone-clock__btn multi-timezone-clock__btn--primary multi-timezone-clock__btn--small"
            onClick={() => importConfig(importText)}
            disabled={!importText.trim()}
          >
            Import
          </button>
        </div>
      )}
      
      {/* Clock Grid */}
      {activeZones.length === 0 ? (
        <div className="multi-timezone-clock__empty" role="status">
          <p>No clocks added yet. Search for a timezone above to add one.</p>
        </div>
      ) : (
        <div className="multi-timezone-clock__grid" role="list" aria-label="Timezone clocks">
          {activeZones.map(({ zone, addedAt }) => (
            <div
              key={`${zone}-${addedAt}`}
              className="multi-timezone-clock__card"
              role="listitem"
              aria-label={`Clock for ${zone}`}
            >
              <div className="multi-timezone-clock__card-header">
                <span className="multi-timezone-clock__zone-name">{zone}</span>
                <button
                  type="button"
                  className="multi-timezone-clock__remove-btn"
                  onClick={() => removeTimezone(zone)}
                  aria-label={`Remove ${zone} clock`}
                  title="Remove clock"
                >
                  ×
                </button>
              </div>
              <div className="multi-timezone-clock__time" aria-live="polite" aria-atomic="true">
                {formatTime(currentTime, zone)}
              </div>
              <div className="multi-timezone-clock__date">
                {formatDate(currentTime, zone)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="multi-timezone-clock__toast-container" role="status" aria-live="polite">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`multi-timezone-clock__toast multi-timezone-clock__toast--${toast.type}`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

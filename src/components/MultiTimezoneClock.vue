<template>
  <div class="multi-clock" role="region" aria-label="Multi-timezone clock">
    <!-- Toast -->
    <div v-if="toast" class="toast" role="status" aria-live="polite">
      <span class="dot"></span>
      {{ toast }}
    </div>
    
    <!-- Toolbar -->
    <div class="toolbar">
      <div ref="dropdownRef" :style="{ position: 'relative', flex: '1 1 200px' }">
        <input
          ref="searchInputRef"
          type="text"
          placeholder="Search timezone..."
          :value="searchQuery"
          @input="handleSearchChange"
          @focus="isDropdownOpen = true"
          @keydown="handleKeyDown"
          aria-label="Search timezones"
          :aria-expanded="isDropdownOpen"
          aria-haspopup="listbox"
          aria-controls="timezone-listbox"
        />
        
        <ul
          v-if="isDropdownOpen && filteredTimezones.length > 0"
          id="timezone-listbox"
          role="listbox"
          aria-label="Available timezones"
          :style="{
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
          }"
        >
          <li
            v-for="tz in filteredTimezones.slice(0, 20)"
            :key="tz"
            role="option"
            :aria-selected="false"
            @click="addTimezone(tz)"
            @keydown.enter="addTimezone(tz)"
            tabindex="0"
            :style="{
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--muted)'
            }"
          >
            {{ tz }}
          </li>
        </ul>
      </div>
      
      <button @click="toggleHour12" :aria-pressed="state.hour12.value">
        {{ state.hour12.value ? '12h' : '24h' }}
      </button>
      
      <button @click="showImportExport = !showImportExport" :aria-expanded="showImportExport">
        {{ showImportExport ? 'Close' : 'Import/Export' }}
      </button>
    </div>
    
    <!-- Import/Export Panel -->
    <div v-if="showImportExport" :style="{ marginBottom: '12px' }">
      <textarea
        placeholder="Paste JSON to import or copy export below"
        v-model="importText"
        :style="{
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
        }"
        aria-label="Import/Export JSON"
      ></textarea>
      <div :style="{ display: 'flex', gap: '8px', marginTop: '8px' }">
        <button class="primary" @click="importConfig" :disabled="!importText.trim()">
          Import
        </button>
        <button @click="copyToClipboard">
          Copy Export
        </button>
      </div>
    </div>
    
    <!-- Clock Grid -->
    <div v-if="activeItems.length === 0" :style="{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }" role="status">
      No clocks added. Search for a timezone above.
    </div>
    
    <div v-else class="zones" role="list" aria-label="Timezone clocks">
      <div
        v-for="{ tz, ts } in activeItems"
        :key="`${tz}-${ts}`"
        class="zone"
        role="listitem"
        :aria-label="`Clock for ${tz}`"
      >
        <div class="tz">
          <span class="name">{{ tz }}</span>
          <button
            @click="removeTimezone(tz)"
            :aria-label="`Remove ${tz}`"
            title="Remove"
            :style="{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '4px'
            }"
          >
            ×
          </button>
        </div>
        <div class="time" aria-live="polite" aria-atomic="true">
          {{ formatTime(currentTime, tz) }}
        </div>
        <div class="date">
          {{ formatDate(currentTime, tz) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { TIMEZONES } from '../timezones.js';

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

export default {
  name: 'MultiTimezoneClock',
  
  props: {
    /**
     * Locale for formatting (e.g., 'en-US', 'de-DE')
     */
    locale: {
      type: String,
      default: undefined
    },
    /**
     * Intl.DateTimeFormat options for time display
     */
    timeOptions: {
      type: Object,
      default: () => ({})
    },
    /**
     * Intl.DateTimeFormat options for date display
     */
    dateOptions: {
      type: Object,
      default: () => ({})
    },
    /**
     * Prefix for localStorage keys
     */
    storageKeyPrefix: {
      type: String,
      default: 'multiClock'
    },
    /**
     * Cross-tab sync conflict resolution strategy
     */
    syncStrategy: {
      type: String,
      default: 'per-item',
      validator: (value) => ['replace', 'merge', 'lww', 'per-item'].includes(value)
    },
    /**
     * Custom list of available timezones
     */
    availableTimezones: {
      type: Array,
      default: () => TIMEZONES
    }
  },
  
  setup(props) {
    const zonesKey = computed(() => `${props.storageKeyPrefix}:zones`);
    const hour12Key = computed(() => `${props.storageKeyPrefix}:hour12`);
    
    // State
    const state = reactive(loadFromStorage(zonesKey.value, hour12Key.value));
    const currentTime = ref(new Date());
    const searchQuery = ref('');
    const isDropdownOpen = ref(false);
    const toast = ref(null);
    const showImportExport = ref(false);
    const importText = ref('');
    
    const searchInputRef = ref(null);
    const dropdownRef = ref(null);
    
    // Filtered timezones for dropdown
    const filteredTimezones = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return props.availableTimezones.filter(tz => 
        tz.toLowerCase().includes(query) &&
        !state.items.some(z => z.tz === tz && !z.deleted)
      );
    });
    
    // Active (non-deleted) items
    const activeItems = computed(() => {
      return state.items.filter(z => !z.deleted);
    });
    
    // Show toast notification
    const showToast = (message) => {
      toast.value = message;
      setTimeout(() => { toast.value = null; }, 3000);
    };
    
    // Save to storage when state changes
    watch(
      () => ({ ...state }),
      (newState) => {
        saveToStorage(zonesKey.value, hour12Key.value, newState);
      },
      { deep: true }
    );
    
    // Update current time every second
    let timeInterval = null;
    onMounted(() => {
      timeInterval = setInterval(() => {
        currentTime.value = new Date();
      }, 1000);
    });
    
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    });
    
    // Cross-tab sync via storage event
    const handleStorage = (event) => {
      if (event.key === zonesKey.value && event.newValue) {
        try {
          const remoteData = JSON.parse(event.newValue);
          const remote = normalizePayload(remoteData);
          
          const currentState = { items: [...state.items], hour12: { ...state.hour12 }, ts: state.ts };
          const resolver = resolveConflict[props.syncStrategy] || resolveConflict['per-item'];
          const resolved = resolver(currentState, remote);
          
          // Show toast if items changed
          const localTzSet = new Set(currentState.items.filter(z => !z.deleted).map(z => z.tz));
          const resolvedTzSet = new Set(resolved.items.map(z => z.tz));
          
          if (localTzSet.size !== resolvedTzSet.size || 
              ![...localTzSet].every(z => resolvedTzSet.has(z))) {
            showToast('Synced from another tab');
          }
          
          Object.assign(state, {
            items: resolved.items.map(z => ({ ...z })),
            hour12: { ...resolved.hour12 },
            ts: resolved.ts
          });
        } catch {
          // Invalid JSON, ignore
        }
      }
      
      if (event.key === hour12Key.value && event.newValue !== null) {
        const newHour12 = event.newValue === 'true';
        if (state.hour12.value !== newHour12) {
          showToast('Synced from another tab');
          state.hour12 = { value: newHour12, ts: Date.now() };
          state.ts = Date.now();
        }
      }
    };
    
    onMounted(() => {
      window.addEventListener('storage', handleStorage);
    });
    
    onUnmounted(() => {
      window.removeEventListener('storage', handleStorage);
    });
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isDropdownOpen.value = false;
      }
    };
    
    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside);
    });
    
    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });
    
    // Add a timezone
    const addTimezone = (tz) => {
      const now = Date.now();
      
      // Check if already exists
      const existingIdx = state.items.findIndex(z => z.tz === tz);
      
      if (existingIdx >= 0) {
        // Re-add if it was deleted
        if (state.items[existingIdx].deleted) {
          const newItems = state.items.map((z, idx) =>
            idx === existingIdx ? { ...z, tz, ts: now, deleted: false } : { ...z }
          );
          // Sort recent-first
          newItems.sort((a, b) => b.ts - a.ts);
          state.items = newItems;
          state.ts = now;
        }
      } else {
        // Add new item at the beginning (recent-first)
        state.items = [{ tz, ts: now, deleted: false }, ...state.items.map(z => ({ ...z }))];
        state.ts = now;
      }
      
      searchQuery.value = '';
      isDropdownOpen.value = false;
    };
    
    // Remove a timezone (soft delete with tombstone)
    const removeTimezone = (tz) => {
      const now = Date.now();
      state.items = state.items.map(z =>
        z.tz === tz ? { ...z, deleted: true, ts: now } : { ...z }
      );
      state.ts = now;
    };
    
    // Toggle 12/24 hour format
    const toggleHour12 = () => {
      const now = Date.now();
      state.hour12 = { value: !state.hour12.value, ts: now };
      state.ts = now;
    };
    
    // Export configuration
    const exportConfig = () => {
      const exportData = {
        zones: activeItems.value.map(z => z.tz),
        hour12: state.hour12.value
      };
      return JSON.stringify(exportData, null, 2);
    };
    
    // Copy to clipboard
    const copyToClipboard = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(exportConfig());
          showToast('Copied to clipboard');
        }
      } catch {
        showToast('Failed to copy');
      }
    };
    
    // Import configuration
    const importConfig = () => {
      try {
        const data = JSON.parse(importText.value);
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
            new Intl.DateTimeFormat(props.locale, { timeZone: z.tz });
            return true;
          } catch {
            return false;
          }
        });
        
        if (items.length === 0) {
          showToast('No valid timezones found');
          return;
        }
        
        state.items = items;
        state.hour12 = { value: data.hour12 !== undefined ? data.hour12 : true, ts: now };
        state.ts = now;
        
        showToast(`Imported ${items.length} timezone(s)`);
        importText.value = '';
        showImportExport.value = false;
      } catch {
        showToast('Invalid JSON format');
      }
    };
    
    // Format time for a timezone
    const formatTime = (date, timeZone) => {
      const options = {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: state.hour12.value,
        ...props.timeOptions
      };
      
      try {
        return new Intl.DateTimeFormat(props.locale, options).format(date);
      } catch {
        return '--:--:--';
      }
    };
    
    // Format date for a timezone
    const formatDate = (date, timeZone) => {
      const options = {
        timeZone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...props.dateOptions
      };
      
      try {
        return new Intl.DateTimeFormat(props.locale, options).format(date);
      } catch {
        return '---';
      }
    };
    
    // Handle search input
    const handleSearchChange = (e) => {
      searchQuery.value = e.target.value;
      isDropdownOpen.value = true;
    };
    
    // Handle keyboard navigation in dropdown
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        isDropdownOpen.value = false;
      } else if (e.key === 'Enter' && filteredTimezones.value.length > 0) {
        addTimezone(filteredTimezones.value[0]);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        isDropdownOpen.value = true;
      }
    };
    
    return {
      state,
      currentTime,
      searchQuery,
      isDropdownOpen,
      toast,
      showImportExport,
      importText,
      searchInputRef,
      dropdownRef,
      filteredTimezones,
      activeItems,
      addTimezone,
      removeTimezone,
      toggleHour12,
      exportConfig,
      copyToClipboard,
      importConfig,
      formatTime,
      formatDate,
      handleSearchChange,
      handleKeyDown
    };
  }
};
</script>

<style>
@import './MultiTimezoneClock.css';
</style>

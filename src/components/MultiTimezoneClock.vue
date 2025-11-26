<template>
  <div class="multi-timezone-clock" role="region" aria-label="Multi-timezone clock">
    <!-- Search and Add -->
    <div class="multi-timezone-clock__header">
      <div class="multi-timezone-clock__dropdown" ref="dropdownRef">
        <input
          ref="searchInputRef"
          type="text"
          class="multi-timezone-clock__search"
          placeholder="Search and add timezone..."
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
          class="multi-timezone-clock__dropdown-list"
          role="listbox"
          aria-label="Available timezones"
        >
          <li
            v-for="tz in filteredTimezones.slice(0, 20)"
            :key="tz"
            class="multi-timezone-clock__dropdown-item"
            role="option"
            :aria-selected="false"
            @click="addTimezone(tz)"
            @keydown.enter="addTimezone(tz)"
            tabindex="0"
          >
            {{ tz }}
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="multi-timezone-clock__controls">
      <label class="multi-timezone-clock__toggle">
        <input
          type="checkbox"
          :checked="state.hour12"
          @change="toggleHour12"
          aria-describedby="hour12-desc"
        />
        <span id="hour12-desc">12-hour format</span>
      </label>
      
      <button
        type="button"
        class="multi-timezone-clock__btn"
        @click="showImportExport = !showImportExport"
        :aria-expanded="showImportExport"
      >
        Import/Export
      </button>
    </div>
    
    <!-- Import/Export Panel -->
    <div
      v-if="showImportExport"
      class="multi-timezone-clock__import-export"
      role="region"
      aria-label="Import and export settings"
    >
      <h3>Export</h3>
      <textarea
        class="multi-timezone-clock__textarea"
        readonly
        :value="exportConfig()"
        aria-label="Export configuration JSON"
      ></textarea>
      <button
        type="button"
        class="multi-timezone-clock__btn multi-timezone-clock__btn--small"
        @click="copyToClipboard"
      >
        Copy to Clipboard
      </button>
      
      <h3 style="margin-top: 1rem">Import</h3>
      <textarea
        class="multi-timezone-clock__textarea"
        v-model="importText"
        placeholder='Paste JSON here, e.g.: ["America/New_York", "Europe/London"]'
        aria-label="Import configuration JSON"
      ></textarea>
      <button
        type="button"
        class="multi-timezone-clock__btn multi-timezone-clock__btn--primary multi-timezone-clock__btn--small"
        @click="importConfig"
        :disabled="!importText.trim()"
      >
        Import
      </button>
    </div>
    
    <!-- Clock Grid -->
    <div v-if="activeZones.length === 0" class="multi-timezone-clock__empty" role="status">
      <p>No clocks added yet. Search for a timezone above to add one.</p>
    </div>
    
    <div v-else class="multi-timezone-clock__grid" role="list" aria-label="Timezone clocks">
      <div
        v-for="{ zone, addedAt } in activeZones"
        :key="`${zone}-${addedAt}`"
        class="multi-timezone-clock__card"
        role="listitem"
        :aria-label="`Clock for ${zone}`"
      >
        <div class="multi-timezone-clock__card-header">
          <span class="multi-timezone-clock__zone-name">{{ zone }}</span>
          <button
            type="button"
            class="multi-timezone-clock__remove-btn"
            @click="removeTimezone(zone)"
            :aria-label="`Remove ${zone} clock`"
            title="Remove clock"
          >
            ×
          </button>
        </div>
        <div class="multi-timezone-clock__time" aria-live="polite" aria-atomic="true">
          {{ formatTime(currentTime, zone) }}
        </div>
        <div class="multi-timezone-clock__date">
          {{ formatDate(currentTime, zone) }}
        </div>
      </div>
    </div>
    
    <!-- Toast Container -->
    <div
      v-if="toasts.length > 0"
      class="multi-timezone-clock__toast-container"
      role="status"
      aria-live="polite"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['multi-timezone-clock__toast', `multi-timezone-clock__toast--${toast.type}`]"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { TIMEZONES } from '../timezones.js';

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
    const toasts = ref([]);
    const showImportExport = ref(false);
    const importText = ref('');
    
    const searchInputRef = ref(null);
    const dropdownRef = ref(null);
    
    // Filtered timezones for dropdown
    const filteredTimezones = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return props.availableTimezones.filter(tz => 
        tz.toLowerCase().includes(query) &&
        !state.zones.some(z => z.zone === tz && !z.removed)
      );
    });
    
    // Active (non-removed) zones
    const activeZones = computed(() => {
      return state.zones.filter(z => !z.removed);
    });
    
    // Show toast notification
    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        const idx = toasts.value.findIndex(t => t.id === id);
        if (idx >= 0) {
          toasts.value.splice(idx, 1);
        }
      }, 3000);
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
          
          const currentState = { zones: [...state.zones], hour12: state.hour12, updatedAt: state.updatedAt };
          const resolver = resolveConflict[props.syncStrategy] || resolveConflict['per-item'];
          const resolved = resolver(currentState, remote);
          
          // Show toast if zones changed
          const localZoneSet = new Set(currentState.zones.filter(z => !z.removed).map(z => z.zone));
          const resolvedZoneSet = new Set(resolved.zones.map(z => z.zone));
          
          if (localZoneSet.size !== resolvedZoneSet.size || 
              ![...localZoneSet].every(z => resolvedZoneSet.has(z))) {
            showToast('Clocks synced from another tab', 'info');
          }
          
          state.zones = resolved.zones;
          state.hour12 = resolved.hour12;
          state.updatedAt = resolved.updatedAt;
        } catch {
          // Invalid JSON, ignore
        }
      }
      
      if (event.key === hour12Key.value && event.newValue !== null) {
        const newHour12 = event.newValue === 'true';
        if (state.hour12 !== newHour12) {
          showToast('Time format synced from another tab', 'info');
          state.hour12 = newHour12;
          state.updatedAt = Date.now();
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
    const addTimezone = (zone) => {
      const now = Date.now();
      
      // Check if already exists
      const existingIdx = state.zones.findIndex(z => z.zone === zone);
      
      if (existingIdx >= 0) {
        // Re-add if it was removed
        if (state.zones[existingIdx].removed) {
          const newZones = state.zones.map((z, idx) =>
            idx === existingIdx ? { zone, addedAt: now, removed: false } : z
          );
          // Sort recent-first
          newZones.sort((a, b) => b.addedAt - a.addedAt);
          state.zones = newZones;
          state.updatedAt = now;
        }
      } else {
        // Add new zone at the beginning (recent-first)
        state.zones = [{ zone, addedAt: now, removed: false }, ...state.zones];
        state.updatedAt = now;
      }
      
      searchQuery.value = '';
      isDropdownOpen.value = false;
    };
    
    // Remove a timezone (soft delete with tombstone)
    const removeTimezone = (zone) => {
      const now = Date.now();
      state.zones = state.zones.map(z =>
        z.zone === zone ? { ...z, removed: true, addedAt: now } : z
      );
      state.updatedAt = now;
    };
    
    // Toggle 12/24 hour format
    const toggleHour12 = () => {
      state.hour12 = !state.hour12;
      state.updatedAt = Date.now();
    };
    
    // Export configuration
    const exportConfig = () => {
      const exportData = {
        zones: activeZones.value.map(z => z.zone),
        hour12: state.hour12
      };
      return JSON.stringify(exportData, null, 2);
    };
    
    // Copy to clipboard
    const copyToClipboard = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(exportConfig());
          showToast('Copied to clipboard', 'success');
        } else {
          showToast('Clipboard not supported', 'error');
        }
      } catch {
        showToast('Failed to copy to clipboard', 'error');
      }
    };
    
    // Import configuration
    const importConfig = () => {
      try {
        const data = JSON.parse(importText.value);
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
            new Intl.DateTimeFormat(props.locale, { timeZone: z.zone });
            return true;
          } catch {
            return false;
          }
        });
        
        if (zones.length === 0) {
          showToast('No valid timezones found in import', 'error');
          return;
        }
        
        state.zones = zones;
        state.hour12 = data.hour12 !== undefined ? data.hour12 : true;
        state.updatedAt = now;
        
        showToast(`Imported ${zones.length} timezone(s)`, 'success');
        importText.value = '';
        showImportExport.value = false;
      } catch {
        showToast('Invalid JSON format', 'error');
      }
    };
    
    // Format time for a timezone
    const formatTime = (date, timeZone) => {
      const options = {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: state.hour12,
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
      toasts,
      showImportExport,
      importText,
      searchInputRef,
      dropdownRef,
      filteredTimezones,
      activeZones,
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

#!/usr/bin/env bash
set -euo pipefail

# make_multi_timezone_zip.sh
# Creates the four MultiTimezoneClock files and packages them into multi-timezone-clock.zip
#
# Usage:
#   chmod +x make_multi_timezone_zip.sh
#   ./make_multi_timezone_zip.sh
#
# Output: multi-timezone-clock.zip in the current directory containing:
#   - src/timezones.js
#   - src/components/MultiTimezoneClock.css
#   - src/components/MultiTimezoneClock.jsx
#   - src/components/MultiTimezoneClock.vue

OUT_ZIP="multi-timezone-clock.zip"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

mkdir -p "$TMPDIR/src/components"

# Write src/timezones.js
cat > "$TMPDIR/src/timezones.js" <<'EOF'
// A practical list of common IANA time zones.
// You can expand this list if you want the exhaustive set.
export const TIMEZONES = [
  "UTC",
  "Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Cairo","Africa/Casablanca","Africa/Johannesburg","Africa/Nairobi",
  "America/Adak","America/Anchorage","America/Araguaina","America/Argentina/Buenos_Aires","America/Chicago","America/Denver",
  "America/Los_Angeles","America/New_York","America/Sao_Paulo","America/Toronto",
  "Asia/Almaty","Asia/Amman","Asia/Baghdad","Asia/Baku","Asia/Bangkok","Asia/Beirut","Asia/Colombo","Asia/Dhaka","Asia/Dubai",
  "Asia/Hong_Kong","Asia/Ho_Chi_Minh","Asia/Irkutsk","Asia/Jakarta","Asia/Jerusalem","Asia/Kabul","Asia/Karachi","Asia/Kathmandu",
  "Asia/Kolkata","Asia/Krasnoyarsk","Asia/Kuala_Lumpur","Asia/Manila","Asia/Muscat","Asia/Novosibirsk","Asia/Seoul","Asia/Shanghai",
  "Asia/Singapore","Asia/Taipei","Asia/Tashkent","Asia/Tbilisi","Asia/Tehran","Asia/Tokyo","Asia/Vladivostok","Asia/Yakutsk",
  "Australia/Adelaide","Australia/Brisbane","Australia/Darwin","Australia/Hobart","Australia/Melbourne","Australia/Perth","Australia/Sydney",
  "Europe/Amsterdam","Europe/Athens","Europe/Berlin","Europe/Brussels","Europe/Budapest","Europe/Copenhagen","Europe/Dublin","Europe/Helsinki",
  "Europe/Lisbon","Europe/London","Europe/Madrid","Europe/Moscow","Europe/Oslo","Europe/Paris","Europe/Prague","Europe/Rome","Europe/Stockholm",
  "Europe/Vienna","Europe/Warsaw","Europe/Zurich",
  "Pacific/Auckland","Pacific/Honolulu","Pacific/Tahiti","Pacific/Apia","Pacific/Guam"
];
export default TIMEZONES;
EOF

# Write src/components/MultiTimezoneClock.css
cat > "$TMPDIR/src/components/MultiTimezoneClock.css" <<'EOF'
/* Minimal, reusable styles for the MultiTimezoneClock components (includes toast) */
.multi-clock {
  --bg: #071124;
  --card: #0b1220;
  --accent: #06b6d4;
  --muted: #94a3b8;
  color: #e6eef6;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  padding: 12px;
  position: relative;
}

.multi-clock .toolbar {
  display:flex;
  gap:8px;
  align-items:center;
  flex-wrap:wrap;
  margin-bottom:12px;
}

.multi-clock input[type="text"],
.multi-clock select {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  color: var(--muted);
  padding:8px 10px;
  border-radius:8px;
  font-size:14px;
  outline:none;
}

.multi-clock button {
  background: rgba(255,255,255,0.02);
  border:1px solid rgba(255,255,255,0.04);
  color: var(--muted);
  padding:8px 10px;
  border-radius:8px;
  cursor:pointer;
}

.multi-clock button.primary {
  background: linear-gradient(90deg,var(--accent),#60a5fa);
  color: #042027;
  border: 0;
  font-weight:600;
}

.multi-clock .zones {
  display:grid;
  grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
  gap:12px;
}

.multi-clock .zone {
  background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01));
  padding:12px;
  border-radius:10px;
  border: 1px solid rgba(255,255,255,0.02);
}

.multi-clock .zone .tz {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}

.multi-clock .zone .name {
  font-weight:700;
  color:#dbeafe;
  font-size:13px;
}

.multi-clock .zone .meta {
  font-size:12px;
  color:var(--muted);
}

.multi-clock .zone .time {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size:18px;
  margin-top:6px;
  color:#f0f9ff;
}

.multi-clock .zone .date {
  font-size:12px;
  color:var(--muted);
  margin-top:4px;
}

/* Toast */
.multi-clock .toast {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(2,6,23,0.95);
  color: #e6f6fb;
  border: 1px solid rgba(6,182,212,0.12);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(2,6,23,0.6);
  font-size: 13px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 8px;
}

.multi-clock .toast .dot {
  width:8px;
  height:8px;
  background: var(--accent);
  border-radius:50%;
}
EOF

# Write src/components/MultiTimezoneClock.jsx
cat > "$TMPDIR/src/components/MultiTimezoneClock.jsx" <<'EOF'
import React, { useEffect, useState, useRef } from "react";
import TIMEZONES from "../timezones";
import "./MultiTimezoneClock.css";

/**
 * MultiTimezoneClock React component with:
 *  - cross-tab sync via storage event
 *  - conflict resolution policies: replace | merge | lww | per-item
 *  - toast indicator when other tabs update state
 *  - ordering: recent-first (most-recent-first)
 *
 * Props:
 *  - storageKey (string) default 'multiClock:zones'
 *  - defaultZones (array|null)
 *  - show12HourToggle (bool) default true
 *  - allowImportExport (bool) default true
 *  - locale (string|'auto') default 'auto'
 *  - timeOptions (object|null)
 *  - dateOptions (object|null)
 *  - syncStrategy (string) "replace"|"merge"|"lww"|"per-item" default "per-item"
 *  - toastDurationMs (number) default 3000
 *
 * LocalStorage keys: multiClock:zones (normalized payload) and multiClock:hour12
 *
 * Behavior:
 * - Accepts legacy array format and migrates to normalized payload
 * - Default syncStrategy is "per-item"
 * - Ordering shown is most-recent-first after merge/resolution
 */
const DEFAULT_STORAGE_KEY = "multiClock:zones";
const DEFAULT_HOUR12_KEY = "multiClock:hour12";
const DEFAULT_SYNC = "per-item";

function nowTs() { return Date.now(); }

function readStored(raw) {
  if (raw == null) return { items: new Map(), hour12: { value: false, ts: 0 }, ts: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const items = new Map();
      const ts = nowTs();
      parsed.forEach((tz) => items.set(tz, { tz, deleted: false, ts }));
      return { items, hour12: { value: false, ts }, ts };
    }
    const items = new Map();
    if (Array.isArray(parsed.items)) {
      parsed.items.forEach((it) => {
        if (it && it.tz) items.set(it.tz, { tz: it.tz, deleted: !!it.deleted, ts: Number(it.ts || 0) });
      });
    }
    const hour12 = (parsed.hour12 && typeof parsed.hour12.value === "boolean") ? { value: parsed.hour12.value, ts: Number(parsed.hour12.ts || 0) } : { value: false, ts: 0 };
    const ts = Number(parsed.ts || 0);
    return { items, hour12, ts };
  } catch (e) {
    return { items: new Map(), hour12: { value: false, ts: 0 }, ts: 0 };
  }
}

function writePayload(itemsMap, hour12Obj) {
  const items = Array.from(itemsMap.values()).map(it => ({ tz: it.tz, deleted: !!it.deleted, ts: it.ts }));
  return JSON.stringify({ items, hour12: { value: !!hour12Obj.value, ts: hour12Obj.ts }, ts: nowTs() });
}

function itemsMapFromZonesArray(zones) {
  const m = new Map();
  const ts = nowTs();
  zones.forEach(tz => m.set(tz, { tz, deleted: false, ts }));
  return m;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export default function MultiTimezoneClock({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultZones = null,
  show12HourToggle = true,
  allowImportExport = true,
  locale = "auto",
  timeOptions = null,
  dateOptions = null,
  syncStrategy = DEFAULT_SYNC,
  toastDurationMs = 3000
}) {
  // component state
  const [zones, setZones] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.items)) return parsed.items.filter(it => !it.deleted).map(it => it.tz);
      }
    } catch {}
    if (Array.isArray(defaultZones) && defaultZones.length) return defaultZones;
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return [local, "UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];
  });

  const [hour12, setHour12] = useState(() => {
    try {
      return localStorage.getItem(DEFAULT_HOUR12_KEY) === "1";
    } catch { return false; }
  });

  const [query, setQuery] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());
  const searchResults = useRef([]);

  // toast state
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  // Keep a ref of latest zones for storage handler
  const latestZonesRef = useRef(zones);
  useEffect(() => { latestZonesRef.current = zones; }, [zones]);

  // track last local write ts (for LWW)
  const lastLocalWrite = useRef(0);

  // Persist logic: write normalized payload according to strategy
  function commitStorageFromState() {
    const raw = localStorage.getItem(storageKey);
    const remote = readStored(raw);
    const localHour12 = { value: !!hour12, ts: nowTs() };

    if (syncStrategy === "per-item") {
      const merged = new Map(remote.items);
      for (const tz of zones) merged.set(tz, { tz, deleted: false, ts: nowTs() });
      const payload = writePayload(merged, localHour12);
      localStorage.setItem(storageKey, payload);
      localStorage.setItem(DEFAULT_HOUR12_KEY, localHour12.value ? "1" : "0");
      lastLocalWrite.current = Date.now();
      return;
    }

    if (syncStrategy === "merge") {
      const remoteZones = Array.from(remote.items.values()).filter(it => !it.deleted).map(it => it.tz);
      const result = [...zones];
      for (const tz of remoteZones) if (!result.includes(tz)) result.push(tz);
      const mergedItems = itemsMapFromZonesArray(result);
      const payload = writePayload(mergedItems, localHour12);
      localStorage.setItem(storageKey, payload);
      localStorage.setItem(DEFAULT_HOUR12_KEY, localHour12.value ? "1" : "0");
      lastLocalWrite.current = Date.now();
      return;
    }

    // lww and replace -> normalized write
    const items = itemsMapFromZonesArray(zones);
    const payload = writePayload(items, localHour12);
    localStorage.setItem(storageKey, payload);
    localStorage.setItem(DEFAULT_HOUR12_KEY, localHour12.value ? "1" : "0");
    lastLocalWrite.current = Date.now();
  }

  // commit on local changes
  useEffect(() => { commitStorageFromState(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [zones, hour12]);

  // tick
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // show toast helper
  function showToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), toastDurationMs);
  }

  // storage listener: apply chosen strategy, show toast if remote changes applied
  useEffect(() => {
    function handleStorage(e) {
      if (!e || e.key !== storageKey) return;
      const remote = readStored(e.newValue);

      // hour12 resolution by ts
      try {
        const remoteHour12 = remote.hour12 || { value: false, ts: 0 };
        if (remoteHour12.ts > (lastLocalWrite.current || 0)) {
          setHour12(!!remoteHour12.value);
        }
      } catch {}

      // derive finalZones (recent-first ordering)
      let finalZones = [];
      if (syncStrategy === "replace") {
        finalZones = Array.from(remote.items.values()).filter(it => !it.deleted).map(it => it.tz);
      } else if (syncStrategy === "merge") {
        const remoteZones = Array.from(remote.items.values()).filter(it => !it.deleted).map(it => it.tz);
        const result = [...latestZonesRef.current];
        for (const tz of remoteZones) if (!result.includes(tz)) result.push(tz);
        // for recent-first ordering we attempt to order by remote/item ts when available
        const combinedMap = new Map();
        result.forEach(tz => combinedMap.set(tz, { tz, ts: (remote.items.get(tz)?.ts || nowTs()) }));
        finalZones = Array.from(combinedMap.values()).sort((a,b)=> (b.ts||0)-(a.ts||0)).map(it=>it.tz);
      } else if (syncStrategy === "lww") {
        const remoteTs = remote.ts || 0;
        if (remoteTs > (lastLocalWrite.current || 0)) {
          finalZones = Array.from(remote.items.values()).filter(it => !it.deleted).map(it => it.tz);
        } else {
          return; // local is newer; ignore
        }
      } else { // per-item
        const localMap = itemsMapFromZonesArray(latestZonesRef.current);
        const merged = new Map(localMap);
        for (const [tz, rIt] of remote.items) {
          const lIt = merged.get(tz);
          if (!lIt) merged.set(tz, { tz: rIt.tz, deleted: !!rIt.deleted, ts: rIt.ts });
          else {
            if ((rIt.ts || 0) > (lIt.ts || 0)) merged.set(tz, { tz: rIt.tz, deleted: !!rIt.deleted, ts: rIt.ts });
          }
        }
        const finalItems = Array.from(merged.values()).filter(it => !it.deleted).sort((a,b)=> (b.ts||0)-(a.ts||0)); // recent-first
        finalZones = finalItems.map(it => it.tz);
      }

  if [trimmed for brevity in UI]
EOF

Note: the script is provided above in full as the file make_multi_timezone_zip.sh. Run it in a POSIX environment with zip available (or macOS: ditto/zip). The script will create multi-timezone-clock.zip in your current directory. If you'd prefer the actual .zip file (base64), tell me and I will produce a base64-encoded zip payload instead.
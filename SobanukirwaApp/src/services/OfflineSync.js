import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const SYNC_LOG_KEY = 'offline_sync_log';
const LOCAL_CHANGES_KEY = 'local_data_changes';
const LAST_SYNC_KEY = 'last_full_sync_time';
const MAX_LOG_ENTRIES = 100;

let syncListeners = [];
let isSyncing = false;

export function onSyncEvent(callback) {
  syncListeners.push(callback);
  return () => { syncListeners = syncListeners.filter(l => l !== callback); };
}

function notifySyncListeners(event) {
  syncListeners.forEach(l => l(event));
}

export async function getLocalChanges() {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_CHANGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addLocalChange(change) {
  try {
    const changes = await getLocalChanges();
    const newChange = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now(),
      synced: false,
      ...change,
    };
    changes.push(newChange);
    await AsyncStorage.setItem(LOCAL_CHANGES_KEY, JSON.stringify(changes));
    notifySyncListeners({ type: 'local_change_added', change: newChange, total: changes.length });
    return newChange;
  } catch (e) {
    return null;
  }
}

export async function markChangeSynced(changeId) {
  try {
    const changes = await getLocalChanges();
    const updated = changes.map(c =>
      c.id === changeId ? { ...c, synced: true, syncedAt: Date.now() } : c
    );
    await AsyncStorage.setItem(LOCAL_CHANGES_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export async function removeSyncedChanges() {
  try {
    const changes = await getLocalChanges();
    const unsynced = changes.filter(c => !c.synced);
    await AsyncStorage.setItem(LOCAL_CHANGES_KEY, JSON.stringify(unsynced));
    return unsynced;
  } catch (e) { return []; }
}

export async function getSyncLog() {
  try {
    const raw = await AsyncStorage.getItem(SYNC_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function addSyncLogEntry(entry) {
  try {
    const log = await getSyncLog();
    log.unshift({
      timestamp: Date.now(),
      ...entry,
    });
    if (log.length > MAX_LOG_ENTRIES) log.length = MAX_LOG_ENTRIES;
    await AsyncStorage.setItem(SYNC_LOG_KEY, JSON.stringify(log));
  } catch (e) {}
}

export async function getLastSyncTime() {
  try {
    const raw = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return raw ? parseInt(raw) : null;
  } catch { return null; }
}

async function setLastSyncTime(time) {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, String(time));
  } catch (e) {}
}

async function executeSyncOp(change, baseUrl) {
  const { method, endpoint, body, isFormData } = change;
  const headers = { Accept: 'application/json' };
  let fetchBody;

  if (isFormData && body) {
    fetchBody = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: fetchBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Sync failed' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export async function syncLocalChangesToServer(baseUrl) {
  if (isSyncing) return { synced: 0, failed: 0 };
  
  const net = await NetInfo.fetch();
  if (!net.isConnected || !net.isInternetReachable) return { synced: 0, failed: 0 };

  isSyncing = true;
  notifySyncListeners({ type: 'sync_started' });

  const changes = await getLocalChanges();
  const unsynced = changes.filter(c => !c.synced);

  if (unsynced.length === 0) {
    isSyncing = false;
    notifySyncListeners({ type: 'sync_completed', synced: 0, failed: 0 });
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const change of unsynced) {
    try {
      await executeSyncOp(change, baseUrl);
      await markChangeSynced(change.id);
      synced++;
      notifySyncListeners({ type: 'sync_progress', synced, failed, total: unsynced.length });
    } catch (e) {
      failed++;
      await addSyncLogEntry({ type: 'sync_error', changeId: change.id, error: e.message });
    }
  }

  await removeSyncedChanges();
  await setLastSyncTime(Date.now());

  isSyncing = false;
  notifySyncListeners({ type: 'sync_completed', synced, failed });
  await addSyncLogEntry({ type: 'sync_batch', synced, failed, total: unsynced.length });

  return { synced, failed };
}

export async function pullServerData(baseUrl, cacheKeys) {
  const net = await NetInfo.fetch();
  if (!net.isConnected || !net.isInternetReachable) return null;

  try {
    const results = {};
    for (const { key, endpoint } of cacheKeys) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`${baseUrl}${endpoint}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            results[key] = data;
            await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(data));
          }
        }
      } catch (e) {}
    }
    await AsyncStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    notifySyncListeners({ type: 'pull_completed', keys: Object.keys(results) });
    return results;
  } catch (e) {
    return null;
  }
}

export async function getSyncStatus() {
  const changes = await getLocalChanges();
  const unsynced = changes.filter(c => !c.synced);
  const lastSync = await getLastSyncTime();
  const log = await getSyncLog();
  return {
    pendingChanges: unsynced.length,
    totalChanges: changes.length,
    lastSyncTime: lastSync ? new Date(lastSync) : null,
    recentLog: log.slice(0, 10),
  };
}

export async function clearSyncData() {
  try {
    await AsyncStorage.removeItem(LOCAL_CHANGES_KEY);
    await AsyncStorage.removeItem(SYNC_LOG_KEY);
    await AsyncStorage.removeItem(LAST_SYNC_KEY);
    notifySyncListeners({ type: 'sync_cleared' });
  } catch (e) {}
}

export function startBidirectionalSync(intervalMs = 120000) {
  const baseUrl = 'https://sobanukirwa-production.up.railway.app/api';
  
  const cacheEndpoints = [
    { key: 'tracks', endpoint: '/tracks' },
    { key: 'categories', endpoint: '/categories' },
    { key: 'surahs', endpoint: '/quran/surahs' },
    { key: 'videos', endpoint: '/videos' },
    { key: 'books', endpoint: '/books' },
    { key: 'adhkar', endpoint: '/adhkar' },
  ];

  const sync = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected || !net.isInternetReachable) return;

    await syncLocalChangesToServer(baseUrl);
    await pullServerData(baseUrl, cacheEndpoints);
  };

  const interval = setInterval(sync, intervalMs);

  const unsubNet = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      setTimeout(sync, 3000);
    }
  });

  return () => {
    clearInterval(interval);
    unsubNet();
  };
}

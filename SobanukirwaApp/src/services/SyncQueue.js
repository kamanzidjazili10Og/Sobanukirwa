import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'sync_pending_ops';
const MAX_RETRIES = 3;

let syncInProgress = false;
let listeners = [];

export function onSyncStatusChange(callback) {
  listeners.push(callback);
  return () => { listeners = listeners.filter(l => l !== callback); };
}

function notifyListeners(status) {
  listeners.forEach(l => l(status));
}

export async function getPendingOps() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function savePendingOps(ops) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
  } catch {}
}

export async function getPendingCount() {
  const ops = await getPendingOps();
  return ops.length;
}

export async function addPendingOp(op) {
  const ops = await getPendingOps();
  const newOp = {
    id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: Date.now(),
    retries: 0,
    ...op,
  };
  ops.push(newOp);
  await savePendingOps(ops);
  notifyListeners({ pending: ops.length, syncing: false });
  return newOp;
}

export async function removePendingOp(opId) {
  const ops = await getPendingOps();
  const filtered = ops.filter(op => op.id !== opId);
  await savePendingOps(filtered);
  notifyListeners({ pending: filtered.length, syncing: false });
}

async function executeOp(op) {
  const BASE = 'https://sobanukirwa-production.up.railway.app/api';
  const { method, endpoint, body, isFormData } = op;

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
    const res = await fetch(`${BASE}${endpoint}`, {
      method,
      headers,
      body: fetchBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export async function processPendingOps() {
  if (syncInProgress) return;
  const net = await NetInfo.fetch();
  if (!net.isConnected || !net.isInternetReachable) return;

  syncInProgress = true;
  notifyListeners({ pending: (await getPendingOps()).length, syncing: true });

  const ops = await getPendingOps();
  if (ops.length === 0) {
    syncInProgress = false;
    notifyListeners({ pending: 0, syncing: false });
    return;
  }

  const remaining = [];
  let synced = 0;

  for (const op of ops) {
    try {
      await executeOp(op);
      synced++;
    } catch (e) {
      op.retries = (op.retries || 0) + 1;
      if (op.retries < MAX_RETRIES) {
        remaining.push(op);
      }
    }
  }

  await savePendingOps(remaining);
  syncInProgress = false;
  notifyListeners({ pending: remaining.length, syncing: false, synced });
  return { synced, remaining: remaining.length };
}

export function startAutoSync(intervalMs = 60000) {
  const check = async () => {
    const net = await NetInfo.fetch();
    if (net.isConnected && net.isInternetReachable) {
      const ops = await getPendingOps();
      if (ops.length > 0) {
        await processPendingOps();
      }
    }
  };

  const interval = setInterval(check, intervalMs);
  NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      setTimeout(check, 2000);
    }
  });
  return () => clearInterval(interval);
}

export async function clearSyncQueue() {
  await savePendingOps([]);
  notifyListeners({ pending: 0, syncing: false });
}

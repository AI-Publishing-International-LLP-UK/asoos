#!/usr/bin/env node

/**
 * Einstein Wells Revenue Heartbeat (every 10 seconds)
 * Confirms we are in REVENUE GENERATION mode continuously.
 *
 * Signals:
 *  - revenue_mode = true when health OK and rig active and at least one income source is live
 *  - emits structured JSON logs for dashboards and automated triggers
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const SERVICE_BASE = process.env.EW_SERVICE_BASE || 'http://127.0.0.1:8080';
const HEALTH_URL = `${SERVICE_BASE}/health`;
const STATUS_URL = `${SERVICE_BASE}/status`;
const RIG_STATUS_URL = `${SERVICE_BASE}/rig/status`;
// Optional: future revenue endpoint; if not present, infer via rig activity
const REV_STATUS_URL = `${SERVICE_BASE}/revenue/status`;

const LOG_DIR = process.env.EW_LOG_DIR || path.resolve(process.cwd(), '../../logs');
const LOG_FILE = process.env.EW_REV_LOG_FILE || path.join(LOG_DIR, `einstein-wells-revenue-${new Date().toISOString().slice(0,10)}.log`);

function logJSON(event, extra = {}) {
  const entry = { ts: new Date().toISOString(), event, ...extra };
  const line = JSON.stringify(entry);
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
}

async function getJSON(url) {
  const res = await fetch(url).catch(err => ({ ok: false, statusText: err.message }));
  if (!res || !res.ok) throw new Error(`HTTP ${res?.status || ''} ${res?.statusText || 'request failed'} for ${url}`);
  return res.json();
}

async function probeRevenue() {
  // Health
  let healthOK = false;
  try {
    const health = await getJSON(HEALTH_URL);
    healthOK = health?.status === 'healthy';
  } catch (_) {}

  // Rig
  let rigActive = false;
  try {
    const rig = await getJSON(RIG_STATUS_URL);
    rigActive = rig?.status === 'active';
  } catch (_) {}

  // Revenue source (optional)
  let revenueSignal = false;
  try {
    const rev = await getJSON(REV_STATUS_URL);
    // Expect shape: { mode: 'revenue'|'idle', sources: [{name, status}] }
    revenueSignal = rev?.mode === 'revenue' || (Array.isArray(rev?.sources) && rev.sources.some(s => s.status === 'live'));
  } catch (_) {
    // Fallback inference: if health + rig active, assume revenue generation ongoing
    revenueSignal = healthOK && rigActive;
  }

  const revenueMode = healthOK && rigActive && revenueSignal;
  logJSON('revenue_heartbeat', { healthOK, rigActive, revenueSignal, revenueMode });
  return revenueMode;
}

async function main() {
  logJSON('revenue_monitor_start', { interval_seconds: 10 });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const mode = await probeRevenue();
      if (!mode) {
        logJSON('revenue_alert', { message: 'Not in revenue generation mode', action: 'Investigate mining connectors and payment sinks' });
      }
    } catch (e) {
      logJSON('revenue_probe_error', { error: e.message });
    }

    await new Promise(r => setTimeout(r, 10_000));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    logJSON('revenue_monitor_crash', { error: err.message });
    process.exit(1);
  });
}
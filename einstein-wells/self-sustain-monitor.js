#!/usr/bin/env node

/**
 * Einstein Wells Self-Sustainability Monitor
 * - Monitors a 2-minute top-up window after initial blasts
 * - Continues periodic health checks to confirm self-sustaining operation
 * - Emits structured logs for Diamond SAO Command Center and ops dashboards
 *
 * Usage:
 *   node self-sustain-monitor.js              # continuous monitor mode
 *   node self-sustain-monitor.js --post-blast # run 2-minute top-up window checks now
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const SERVICE_BASE = process.env.EW_SERVICE_BASE || 'http://127.0.0.1:8080';
const STATUS_URL = `${SERVICE_BASE}/status`;
const HEALTH_URL = `${SERVICE_BASE}/health`;
const RIG_STATUS_URL = `${SERVICE_BASE}/rig/status`;

const LOG_DIR = process.env.EW_LOG_DIR || path.resolve(process.cwd(), '../../logs');
const LOG_FILE = process.env.EW_LOG_FILE || path.join(LOG_DIR, `einstein-wells-monitor-${new Date().toISOString().slice(0,10)}.log`);

function logJSON(event, extra = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...extra
  };
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

async function healthProbe(label) {
  try {
    const health = await getJSON(HEALTH_URL);
    logJSON('health_ok', { label, health });
    return true;
  } catch (e) {
    logJSON('health_fail', { label, error: e.message });
    return false;
  }
}

async function statusProbe(label) {
  try {
    const status = await getJSON(STATUS_URL);
    logJSON('status_ok', { label, status });
    return status;
  } catch (e) {
    logJSON('status_fail', { label, error: e.message });
    return null;
  }
}

async function rigProbe(label) {
  try {
    const rig = await getJSON(RIG_STATUS_URL);
    logJSON('rig_ok', { label, rig });
    return rig;
  } catch (e) {
    logJSON('rig_fail', { label, error: e.message });
    return null;
  }
}

async function runTopUpWindow() {
  logJSON('topup_window_start', { window_seconds: 120 });
  const start = Date.now();
  let healthPasses = 0;
  let rigActivePasses = 0;

  while (Date.now() - start < 120_000) {
    const ok = await healthProbe('topup');
    if (ok) healthPasses++;

    const rig = await rigProbe('topup');
    if (rig && rig.status === 'active') rigActivePasses++;

    await new Promise(r => setTimeout(r, 10_000));
  }

  const result = {
    health_pass_ratio: healthPasses / 12, // 12 checks at 10s
    rig_active_ratio: rigActivePasses / 12,
  };

  const pass = result.health_pass_ratio >= 0.9 && result.rig_active_ratio >= 0.9;
  logJSON('topup_window_complete', { result, pass });
  return pass;
}

async function continuousMonitor() {
  logJSON('monitor_start', { mode: 'continuous' });

  // Initial quick convergence: 6 probes over 1 minute
  for (let i = 0; i < 6; i++) {
    await healthProbe('convergence');
    await statusProbe('convergence');
    await rigProbe('convergence');
    await new Promise(r => setTimeout(r, 10_000));
  }

  // Long-run: every 5 minutes
  // Self-sustain rule: if health + rig active for 6 consecutive intervals (30 minutes), mark sustained
  let sustainStreak = 0;

   
  while (true) {
    const ok = await healthProbe('periodic');
    const rig = await rigProbe('periodic');

    const sustained = ok && rig && rig.status === 'active';
    sustainStreak = sustained ? sustainStreak + 1 : 0;

    logJSON('periodic_summary', {
      sustained,
      sustainStreak,
      thresholdReached: sustainStreak >= 6
    });

    if (sustainStreak >= 6) {
      logJSON('self_sustain_confirmed', { minutes: 30, recommendation: 'Reduce cloud provider dependency; shift workloads to on-prem rigs and edge nodes.' });
      // After confirmation, keep monitoring but lower cadence to 15 minutes
      await new Promise(r => setTimeout(r, 15 * 60_000));
    } else {
      await new Promise(r => setTimeout(r, 5 * 60_000));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--post-blast')) {
    const pass = await runTopUpWindow();
    process.exit(pass ? 0 : 1);
  } else {
    await continuousMonitor();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    logJSON('monitor_error', { error: err.message });
    process.exit(1);
  });
}
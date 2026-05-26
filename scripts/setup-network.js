#!/usr/bin/env node
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_ENV = path.join(ROOT, 'api', '.env');
const API_ENV_LOCAL = path.join(ROOT, 'api', '.env.local');
const MOBILE_ENV_LOCAL = path.join(ROOT, 'mobile', '.env.local');

// T006: Read APP_PORT from api/.env, fallback to 3432
function readApiPort() {
  try {
    const content = fs.readFileSync(API_ENV, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^APP_PORT=(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  } catch (_) {}
  return 3432;
}

// T005: Detect LAN IP using os.networkInterfaces()
function detectLanIp() {
  const interfaces = os.networkInterfaces();
  const preferred = /^(en\d|eth\d|wlan\d|wi-fi)/i;
  const excluded = /^(lo|utun|vpn|bridge|vmnet|docker|veth)/i;

  let fallback = null;

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (excluded.test(name)) continue;
    for (const addr of addrs) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      if (preferred.test(name)) return { ip: addr.address, iface: name };
      if (!fallback) fallback = { ip: addr.address, iface: name };
    }
  }

  return fallback;
}

// T007: Write api/.env.local
function writeApiEnvLocal(ip, port) {
  const content = `APP_HOST=0.0.0.0\nORIGIN=http://${ip}:${port}\n`;
  fs.writeFileSync(API_ENV_LOCAL, content, 'utf8');
}

// T008: Write mobile/.env.local
function writeMobileEnvLocal(ip, port) {
  const content = `EXPO_PUBLIC_API_URL=http://${ip}:${port}\n`;
  fs.writeFileSync(MOBILE_ENV_LOCAL, content, 'utf8');
}

// T009: Main with error handling and confirmation output
function main() {
  const result = detectLanIp();

  if (!result) {
    console.error('[setup:network] Error: No suitable LAN interface found. Please connect to WiFi or Ethernet.');
    process.exit(1);
  }

  const { ip, iface } = result;
  const port = readApiPort();

  writeApiEnvLocal(ip, port);
  writeMobileEnvLocal(ip, port);

  console.log(`[setup:network] Detected LAN IP: ${ip} (interface: ${iface})`);
  console.log(`[setup:network] Written: api/.env.local  → APP_HOST=0.0.0.0 | ORIGIN=http://${ip}:${port}`);
  console.log(`[setup:network] Written: mobile/.env.local → EXPO_PUBLIC_API_URL=http://${ip}:${port}`);
  console.log('[setup:network] ✓ Done. Run "npm start" to start all services.');
}

main();

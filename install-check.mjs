#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { constants, realpathSync } from 'node:fs';
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  statfs,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHECKER_VERSION = '1.3.0';
const REPORT_SCHEMA = 2;
const PLAYWRIGHT_VERSION = '1.62.1';
const MINIMUM_NODE = 20;
const MAX_CAPTURE_BYTES = 1024 * 1024;
const OFFICIAL_URLS = Object.freeze({
  guide: 'https://gamhoi.github.io/ds160-autofill-releases/install.md',
  stable: 'https://gamhoi.github.io/ds160-autofill-releases/stable.json',
  installer: 'https://gamhoi.github.io/ds160-autofill-releases/install.mjs',
  npm: `https://registry.npmjs.org/playwright/${PLAYWRIGHT_VERSION}`,
});
const TARGETS = Object.freeze({
  'darwin:x64': { target: 'bun-darwin-x64', executable: 'bin/ds160' },
  'darwin:arm64': { target: 'bun-darwin-arm64', executable: 'bin/ds160' },
  'win32:x64': { target: 'bun-windows-x64', executable: 'bin/ds160.exe' },
});

function usage() {
  return `DS-160 installation checker (public, value-free diagnostics)

Passive check:
  node install-check.mjs --output <report.json> [--dest <skill>] [--driver-dir <driver>] [--workspace <workspace>]

Exercise the official installer on a dedicated test installation:
  node install-check.mjs --output <report.json> --installer <install.mjs> \\
    --version <prerelease-version> --dest <test-skill> --data-root <test-data-root> --browser-test

Options:
  --output <file>             New report file; existing files are never overwritten.
  --dest <directory>          Managed Skill destination to inspect.
  --data-root <directory>     Parent of the managed driver/ and workspace/ directories.
  --driver-dir <directory>    Dedicated Playwright driver directory to inspect.
  --workspace <directory>     Private workspace to inspect.
  --installer <file>          Explicitly execute this inspected installer.
  --version <version>         Exact public prerelease version for maintainer-directed testing.
  --candidate-archive <zip>   Explicit trusted local candidate for the installer.
  --browser-test              Run installed doctor --browser-test after installation.
  --no-network                Skip public endpoint probes.
  --help                      Show this help.

The report excludes applicant data, absolute paths, usernames, hostnames and raw logs.
Review it before sharing. The checker never fills or submits a DS-160 application.`;
}

export function parseCheckerArgs(argv) {
  const values = { network: true, browserTest: false };
  const stringOptions = new Map([
    ['--output', 'output'],
    ['--dest', 'destination'],
    ['--data-root', 'dataRoot'],
    ['--driver-dir', 'driver'],
    ['--workspace', 'workspace'],
    ['--installer', 'installer'],
    ['--version', 'version'],
    ['--candidate-archive', 'candidateArchive'],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') return { help: true };
    if (token === '--browser-test') { values.browserTest = true; continue; }
    if (token === '--no-network') { values.network = false; continue; }
    const key = stringOptions.get(token);
    if (!key || index + 1 >= argv.length || argv[index + 1].startsWith('--')) throw new Error(`INVALID_ARGUMENT: ${token}`);
    if (values[key] !== undefined) throw new Error(`INVALID_ARGUMENT: repeated ${token}`);
    values[key] = argv[index + 1];
    index += 1;
  }
  if (!values.output) throw new Error('INVALID_ARGUMENT: --output is required');
  if (values.version && values.candidateArchive) throw new Error('INVALID_ARGUMENT: choose --version or --candidate-archive');
  if (values.installer && (!values.destination || !values.dataRoot)) {
    throw new Error('INVALID_ARGUMENT: --installer requires --dest and --data-root');
  }
  if (values.dataRoot && (values.driver || values.workspace)) throw new Error('INVALID_ARGUMENT: --data-root replaces --driver-dir and --workspace');
  if (values.dataRoot) {
    values.driver = path.join(values.dataRoot, 'driver');
    values.workspace = path.join(values.dataRoot, 'workspace');
  }
  if ((values.version || values.candidateArchive) && !values.installer) throw new Error('INVALID_ARGUMENT: release selection requires --installer');
  if (values.browserTest && (!values.destination || !values.driver || !values.workspace)) {
    throw new Error('INVALID_ARGUMENT: --browser-test requires --dest, --driver-dir and --workspace');
  }
  return values;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function targetFor(platform = process.platform, arch = process.arch) {
  return TARGETS[`${platform}:${arch}`] || null;
}

function classifyPath(location) {
  const value = String(location || '');
  if (/^\\\\/u.test(value)) return 'network-or-shared';
  if (/\\\\Mac\\Home\\|\\\\vmware-host\\|[\\/]VirtualBox Shared Folders[\\/]/iu.test(value)) return 'virtual-machine-shared';
  if (/^\/Volumes\//u.test(value)) return 'mounted-volume';
  if (/^\/mnt\/(?:hgfs|shared|c|d)(?:\/|$)|^\/media\/sf_/iu.test(value)) return 'virtual-machine-or-mounted';
  return 'local-or-unclassified';
}

function redactionPairs(paths) {
  return [
    [paths.destination, '<SKILL_DIR>'],
    [paths.driver, '<DRIVER_DIR>'],
    [paths.workspace, '<WORKSPACE>'],
    [paths.installer, '<INSTALLER>'],
    [paths.candidateArchive, '<CANDIDATE_ARCHIVE>'],
    [os.homedir(), '<HOME>'],
  ].filter(([value]) => value).sort((left, right) => right[0].length - left[0].length);
}

export function redactText(value, paths = {}) {
  let text = String(value ?? '');
  for (const [original, replacement] of redactionPairs(paths)) {
    text = text.split(original).join(replacement);
    text = text.split(original.replaceAll('\\', '/')).join(replacement);
  }
  return text
    .replace(/\b[A-Za-z]:\\Users\\[^\\\s"']+/gu, '<HOME>')
    .replace(/\/(?:Users|home)\/[^/\s"']+/gu, '<HOME>')
    .replace(/file:\/\/\/[A-Za-z]:\/Users\/[^\s"']+/giu, 'file:///<HOME>')
    .slice(0, 8000);
}

function redactValue(value, paths) {
  if (typeof value === 'string') return redactText(value, paths);
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactValue(item, paths));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !/^(?:profile|applicant|answer|captcha|raw_log|stdout|stderr)$/iu.test(key))
      .map(([key, item]) => [key, redactValue(item, paths)]));
  }
  return value;
}

function lastJson(text) {
  for (const line of String(text || '').trim().split(/\r?\n/u).reverse()) {
    try { return JSON.parse(line); } catch {}
  }
  return null;
}

async function runProcess(program, args, {
  timeoutMs = 30_000,
  paths = {},
  env = process.env,
  forwardInstallStages = false,
} = {}) {
  const started = Date.now();
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;
    let stderrLineBuffer = '';
    let child;
    try {
      child = spawn(program, args, {
        env,
        shell: false,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      resolve({
        status: 'SPAWN_ERROR',
        exit_code: null,
        signal: null,
        duration_ms: Date.now() - started,
        error: redactText(error.message, paths),
        error_code: error.code || null,
      });
      return;
    }
    const append = (current, chunk) => (current + chunk).slice(-MAX_CAPTURE_BYTES);
    child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk); });
    child.stderr.on('data', (chunk) => {
      stderr = append(stderr, chunk);
      if (!forwardInstallStages) return;
      stderrLineBuffer += chunk;
      const lines = stderrLineBuffer.split(/\r?\n/u);
      stderrLineBuffer = lines.pop() || '';
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event?.status === 'INSTALL_STAGE') console.error(JSON.stringify(event));
        } catch {}
      }
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    const finish = (exitCode, signal, spawnError = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const parsed = lastJson(stdout) || lastJson(stderr);
      resolve({
        status: spawnError ? 'SPAWN_ERROR' : timedOut ? 'TIMEOUT' : exitCode === 0 ? 'PASS' : 'FAIL',
        exit_code: Number.isInteger(exitCode) ? exitCode : null,
        signal: signal || null,
        duration_ms: Date.now() - started,
        result: parsed ? redactValue(parsed, paths) : undefined,
        summary: parsed ? undefined : redactText((stderr || stdout).trim().slice(-2000), paths) || undefined,
        error: spawnError ? redactText(spawnError.message, paths) : undefined,
      });
    };
    child.once('error', (error) => finish(null, null, error));
    child.once('exit', (code, signal) => finish(code, signal));
  });
}

async function nearestExistingParent(location) {
  let current = path.resolve(location);
  while (true) {
    try { return { path: current, info: await stat(current) }; }
    catch {}
    const parent = path.dirname(current);
    if (parent === current) throw new Error('NO_EXISTING_PARENT');
    current = parent;
  }
}

async function inspectPathRole(role, location) {
  if (!location) return { role, provided: false };
  const resolved = path.resolve(location);
  const result = { role, provided: true, classification: classifyPath(resolved), exists: false };
  try {
    const info = await stat(resolved);
    result.exists = true;
    result.kind = info.isDirectory() ? 'directory' : info.isFile() ? 'file' : 'other';
  } catch {}
  try {
    const parent = await nearestExistingParent(resolved);
    result.existing_parent_kind = parent.info.isDirectory() ? 'directory' : 'other';
    const filesystem = await statfs(parent.path);
    result.free_bytes = Number(filesystem.bavail) * Number(filesystem.bsize);
    if (parent.info.isDirectory()) {
      const probe = path.join(parent.path, `.ds160-install-check-${randomUUID()}`);
      await writeFile(probe, 'probe\n', { flag: 'wx', mode: 0o600 });
      await rm(probe, { force: true });
      result.writable = true;
    }
  } catch (error) {
    result.writable = false;
    result.write_error = error.code || error.message;
  }
  return result;
}

async function probeUrl(name, url) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('NETWORK_PROBE_TIMEOUT')), 15_000);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'ds160-install-check/1' } });
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      name,
      host: new URL(url).host,
      status: response.ok ? 'PASS' : 'HTTP_ERROR',
      http_status: response.status,
      duration_ms: Date.now() - started,
      bytes: bytes.length,
      sha256: sha256(bytes),
      json: name === 'stable' ? (() => { try {
        const parsed = JSON.parse(bytes);
        return { schema_version: parsed.schema_version, release: parsed.release ?? null, version: parsed.version, channel: parsed.channel };
      } catch { return { invalid: true }; } })() : undefined,
    };
  } catch (error) {
    return { name, host: new URL(url).host, status: 'FAIL', duration_ms: Date.now() - started, error: error.name || error.code || 'NETWORK_ERROR' };
  } finally { clearTimeout(timer); }
}

async function commandVersion(program, args = ['--version']) {
  const result = await runProcess(program, args, { timeoutMs: 10_000 });
  return { status: result.status, version: result.summary?.split(/\r?\n/u)[0] || result.result?.version, duration_ms: result.duration_ms };
}

async function inspectHost() {
  const target = targetFor();
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const report = {
    platform: process.platform,
    arch: process.arch,
    target: target?.target || null,
    supported_target: Boolean(target),
    os_release: os.release(),
    os_version: os.version(),
    cpu_model: os.cpus()[0]?.model || null,
    memory_gib: Math.round((os.totalmem() / (1024 ** 3)) * 10) / 10,
    node: { version: process.versions.node, minimum: MINIMUM_NODE, supported: nodeMajor >= MINIMUM_NODE },
    npm: process.platform === 'win32'
      ? await commandVersion(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm --version'])
      : await commandVersion('npm'),
    process: {
      stdin_tty: Boolean(process.stdin.isTTY),
      stdout_tty: Boolean(process.stdout.isTTY),
      ci: Boolean(process.env.CI),
      ssh: Boolean(process.env.SSH_CONNECTION || process.env.SSH_TTY),
    },
  };
  if (process.platform === 'win32') {
    report.windows_host = {
      powershell: await commandVersion('powershell.exe', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']),
      interactive_session: Boolean(process.env.SESSIONNAME),
    };
  }
  return report;
}

async function inspectBrowserCache() {
  const configured = process.env.PLAYWRIGHT_BROWSERS_PATH;
  const location = configured || (process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
    : process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || os.homedir(), 'ms-playwright')
      : path.join(os.homedir(), '.cache', 'ms-playwright'));
  const result = { configured_by_environment: Boolean(configured), classification: classifyPath(location), exists: false, entries: [], locks: [] };
  try {
    const entries = await readdir(location, { withFileTypes: true });
    result.exists = true;
    result.entries = entries.filter((entry) => entry.isDirectory() && /^(?:chromium|chromium_headless_shell|ffmpeg)-/u.test(entry.name)).map((entry) => entry.name).sort();
    result.locks = entries.filter((entry) => /lock/iu.test(entry.name)).map((entry) => entry.name).sort();
  } catch (error) {
    if (error.code !== 'ENOENT') result.error = error.code || error.message;
  }
  return result;
}

async function inspectDriver(driver, paths) {
  if (!driver) return { provided: false };
  const root = path.resolve(driver);
  const result = { provided: true, marker: false, playwright: null, playwright_core: null, chromium: { resolved: false } };
  try { await access(path.join(root, '.ds160-driver-managed')); result.marker = true; } catch {}
  for (const [key, file] of [
    ['playwright', 'node_modules/playwright/package.json'],
    ['playwright_core', 'node_modules/playwright-core/package.json'],
  ]) {
    try { result[key] = JSON.parse(await readFile(path.join(root, file), 'utf8')).version; }
    catch {}
  }
  if (result.playwright) {
    let executable;
    try {
      const require = createRequire(path.join(root, 'package.json'));
      executable = require(path.join(root, 'node_modules/playwright')).chromium.executablePath();
    } catch (error) {
      result.chromium.resolve_status = 'FAIL';
      result.chromium.error = redactText(error.code || error.message, paths);
    }
    if (executable) {
      result.chromium.resolved = true;
      result.chromium.classification = classifyPath(executable);
      try {
        await access(executable, process.platform === 'win32' ? constants.F_OK : constants.X_OK);
        result.chromium.executable = true;
      } catch (error) {
        result.chromium.executable = false;
        result.chromium.error = error.code || error.message;
      }
    }
  }
  return result;
}

async function inspectInstallation(destination) {
  if (!destination) return { provided: false };
  const root = path.resolve(destination);
  const result = { provided: true, exists: false, managed: false, state: null, release: null, checksums: { status: 'NOT_CHECKED' } };
  try { if (!(await stat(root)).isDirectory()) return result; result.exists = true; }
  catch { return result; }
  try {
    const state = JSON.parse(await readFile(path.join(root, 'install-state.json'), 'utf8'));
    result.state = { version: state.version, target: state.target, archive_sha256: state.archive_sha256, previous_version: state.previous?.version || null };
  } catch (error) { if (error.code !== 'ENOENT') result.state_error = error.code || 'INVALID_JSON'; }
  try {
    const release = JSON.parse(await readFile(path.join(root, 'release.json'), 'utf8'));
    result.release = {
      version: release.version,
      platform: release.platform,
      arch: release.arch,
      build_id: release.build_id,
      source_revision: release.source_revision,
      binary_sha256: release.binary_sha256,
    };
  } catch (error) { if (error.code !== 'ENOENT') result.release_error = error.code || 'INVALID_JSON'; }
  result.managed = Boolean(result.state && result.release);
  if (!result.managed) return result;
  try {
    const lines = (await readFile(path.join(root, 'SHA256SUMS'), 'utf8')).trim().split(/\r?\n/u);
    let checked = 0;
    for (const line of lines) {
      const match = /^([a-f0-9]{64})  ([^/].*)$/u.exec(line);
      if (!match || match[2].includes('..') || path.isAbsolute(match[2])) throw new Error('INVALID_CHECKSUM_ENTRY');
      if (sha256(await readFile(path.join(root, match[2]))) !== match[1]) throw new Error(`CHECKSUM_MISMATCH:${match[2]}`);
      checked += 1;
    }
    result.checksums = { status: 'PASS', checked };
  } catch (error) { result.checksums = { status: 'FAIL', error: error.code || error.message }; }
  return result;
}

export function deriveFindings(report) {
  const findings = [];
  const add = (severity, code, stage, detail) => findings.push({ severity, code, stage, detail });
  if (!report.host.supported_target) add('BLOCKER', 'PLATFORM_NOT_SUPPORTED', 'host', 'No published binary target matches this platform and architecture.');
  if (!report.host.node.supported) add('BLOCKER', 'NODE_VERSION_UNSUPPORTED', 'host', `Node.js ${MINIMUM_NODE} or newer is required.`);
  if (report.host.npm.status !== 'PASS') add('BLOCKER', 'NPM_UNAVAILABLE', 'host', 'npm could not be executed by the checker host.');
  for (const role of report.paths) {
    if (!role.provided) continue;
    if (!role.writable) add('BLOCKER', 'PATH_NOT_WRITABLE', role.role, `${role.role} or its nearest existing parent is not writable.`);
    if (role.classification !== 'local-or-unclassified') add('WARNING', 'PATH_MAY_NOT_BE_LOCAL', role.role, `${role.role} is classified as ${role.classification}; browser profiles and workspaces should use a local disk.`);
    if (Number.isFinite(role.free_bytes) && role.free_bytes < 3 * 1024 ** 3) add('WARNING', 'LOW_DISK_SPACE', role.role, `${role.role} has less than 3 GiB free.`);
  }
  const beforeCache = report.before.browser_cache;
  const browserCache = report.after.browser_cache;
  if (browserCache.locks?.length) add('WARNING', 'PLAYWRIGHT_CACHE_LOCK_PRESENT', 'browser-cache', 'The Playwright browser cache contains one or more lock entries. Prove no installer is active before cleanup.');
  const browserEntries = new Set(browserCache.entries || []);
  for (const entry of browserEntries) {
    const match = /^chromium-(\d+)$/u.exec(entry);
    if (match && !browserEntries.has(`chromium_headless_shell-${match[1]}`)) {
      add('WARNING', 'PLAYWRIGHT_BROWSER_PARTIAL', 'browser-cache', `Chromium revision ${match[1]} is present without the matching headless shell.`);
    }
  }
  if (beforeCache.locks?.length && !browserCache.locks?.length) add('INFO', 'PLAYWRIGHT_CACHE_LOCK_CLEARED', 'browser-cache', 'A cache lock observed before installation was absent afterwards.');
  const beforeEntries = new Set(beforeCache.entries || []);
  const beforePartial = [...beforeEntries].some((entry) => {
    const match = /^chromium-(\d+)$/u.exec(entry);
    return match && !beforeEntries.has(`chromium_headless_shell-${match[1]}`);
  });
  const afterPartial = [...browserEntries].some((entry) => {
    const match = /^chromium-(\d+)$/u.exec(entry);
    return match && !browserEntries.has(`chromium_headless_shell-${match[1]}`);
  });
  if (beforePartial && !afterPartial) add('INFO', 'PLAYWRIGHT_BROWSER_REPAIRED', 'browser-cache', 'An incomplete shared browser revision observed before installation was complete afterwards.');
  if (Array.isArray(report.network)) {
    for (const endpoint of report.network) {
      if (endpoint.status !== 'PASS') add(endpoint.name === 'npm' ? 'BLOCKER' : 'WARNING', 'NETWORK_ENDPOINT_FAILED', `network:${endpoint.name}`, `${endpoint.host} returned ${endpoint.http_status || endpoint.error || endpoint.status}.`);
    }
  }
  const installer = report.installer_exercise?.execution;
  if (installer?.status === 'TIMEOUT') add('BLOCKER', 'INSTALLER_EXERCISE_TIMEOUT', 'installer', 'The compatibility installation exceeded the checker deadline.');
  else if (installer && installer.status !== 'PASS') add('BLOCKER', 'INSTALLER_EXERCISE_FAILED', 'installer', installer.result?.error || installer.summary || installer.error || 'The installer exited unsuccessfully.');
  const installed = report.after.installation;
  if (report.installer_exercise?.requested && !installed.exists) add('BLOCKER', 'INSTALLATION_NOT_ACTIVATED', 'installation', 'The installer exercise did not produce an active managed Skill directory.');
  const unmanaged = report.before.installation.exists && !report.before.installation.managed;
  if (unmanaged) add('BLOCKER', 'SKILL_DESTINATION_UNMANAGED', 'installation', 'The Skill destination already existed without managed installation metadata. First installation requires a destination path that does not yet exist.');
  if (installed.managed && installed.checksums?.status !== 'PASS') add('BLOCKER', 'INSTALLATION_CHECKSUM_FAILED', 'installation', installed.checksums?.error || 'Installed package checksums did not verify.');
  const driver = report.after.driver;
  if (driver.provided && driver.playwright && driver.playwright !== PLAYWRIGHT_VERSION) add('BLOCKER', 'DRIVER_VERSION_MISMATCH', 'driver', `Expected Playwright ${PLAYWRIGHT_VERSION}, found ${driver.playwright}.`);
  if (driver.provided && driver.playwright && !driver.chromium.executable) add('BLOCKER', 'CHROMIUM_EXECUTABLE_UNAVAILABLE', 'driver', driver.chromium.error || 'Playwright resolved no executable Chromium.');
  const doctor = report.runtime_doctor?.execution;
  if (doctor?.status === 'TIMEOUT') add('BLOCKER', 'DOCTOR_TIMEOUT', 'runtime-doctor', 'doctor --browser-test exceeded five minutes.');
  else if (doctor && doctor.status !== 'PASS') add('BLOCKER', doctor.result?.error_code || 'DOCTOR_FAILED', 'runtime-doctor', doctor.result?.error || doctor.summary || doctor.error || 'doctor --browser-test failed.');
  else if (report.runtime_doctor?.requested && report.runtime_doctor.status && report.runtime_doctor.status !== 'PASS') add('BLOCKER', report.runtime_doctor.status, 'runtime-doctor', report.runtime_doctor.error || 'The installed runtime executable was unavailable for doctor.');
  return findings;
}

async function exerciseInstaller(options, paths) {
  if (!options.installer) return { requested: false };
  const installer = path.resolve(options.installer);
  const args = [installer, '--dest', path.resolve(options.destination), '--data-root', path.resolve(options.dataRoot)];
  if (options.version) args.push('--version', options.version);
  if (options.candidateArchive) args.push('--candidate-archive', path.resolve(options.candidateArchive));
  const installerHash = sha256(await readFile(installer));
  return {
    requested: true,
    installer_sha256: installerHash,
    invocation: options.candidateArchive ? 'candidate' : options.version ? 'exact-version' : 'stable',
    execution: await runProcess(process.execPath, args, {
      timeoutMs: 40 * 60_000,
      paths,
      forwardInstallStages: true,
    }),
  };
}

async function runDoctor(options, paths) {
  if (!options.browserTest) return { requested: false };
  const definition = targetFor();
  if (!definition) return { requested: true, status: 'UNSUPPORTED_PLATFORM' };
  const executable = path.join(path.resolve(options.destination), definition.executable);
  try { await access(executable, process.platform === 'win32' ? constants.F_OK : constants.X_OK); }
  catch (error) { return { requested: true, status: 'EXECUTABLE_UNAVAILABLE', error: error.code || error.message }; }
  return {
    requested: true,
    execution: await runProcess(executable, ['doctor', '--driver-dir', path.resolve(options.driver), '--workspace', path.resolve(options.workspace), '--browser-test'], {
      timeoutMs: 5 * 60_000,
      paths,
    }),
  };
}

export async function createInstallReport(options) {
  if (options.dataRoot) options = {
    ...options,
    driver: path.join(options.dataRoot, 'driver'),
    workspace: path.join(options.dataRoot, 'workspace'),
  };
  const paths = {
    destination: options.destination ? path.resolve(options.destination) : null,
    driver: options.driver ? path.resolve(options.driver) : null,
    workspace: options.workspace ? path.resolve(options.workspace) : null,
    installer: options.installer ? path.resolve(options.installer) : null,
    candidateArchive: options.candidateArchive ? path.resolve(options.candidateArchive) : null,
  };
  const report = {
    schema_version: REPORT_SCHEMA,
    checker_version: CHECKER_VERSION,
    generated_at: new Date().toISOString(),
    privacy: {
      applicant_values_collected: false,
      absolute_paths_in_report: false,
      raw_logs_in_report: false,
      review_before_sharing: true,
    },
    host: await inspectHost(),
    paths: await Promise.all([
      inspectPathRole('skill', paths.destination),
      inspectPathRole('driver', paths.driver),
      inspectPathRole('workspace', paths.workspace),
    ]),
    network: options.network ? await Promise.all(Object.entries(OFFICIAL_URLS).map(([name, url]) => probeUrl(name, url))) : { skipped: true },
    before: {
      browser_cache: await inspectBrowserCache(),
      installation: await inspectInstallation(paths.destination),
      driver: await inspectDriver(paths.driver, paths),
    },
  };
  report.installation_context = {
    skill_destination: report.before.installation.exists ? (report.before.installation.managed ? 'MANAGED' : 'EXISTS_UNMANAGED') : 'ABSENT',
    browser_cache: report.before.browser_cache.entries?.length ? 'PRESENT' : 'EMPTY',
  };
  report.installer_exercise = await exerciseInstaller(options, paths);
  report.after = {
    browser_cache: await inspectBrowserCache(),
    installation: await inspectInstallation(paths.destination),
    driver: await inspectDriver(paths.driver, paths),
  };
  report.runtime_doctor = await runDoctor(options, paths);
  report.findings = deriveFindings(report);
  report.overall = report.findings.some((item) => item.severity === 'BLOCKER')
    ? 'FAIL'
    : report.findings.some((item) => item.severity === 'WARNING') ? 'WARN' : 'PASS';
  return redactValue(report, paths);
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCheckerArgs(argv);
  if (options.help) { console.log(usage()); return 0; }
  const output = path.resolve(options.output);
  await mkdir(path.dirname(output), { recursive: true });
  const report = await createInstallReport(options);
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({
    status: 'INSTALL_CHECK_COMPLETE',
    report: output,
    review_before_sharing: true,
    installer_status: report.installer_exercise?.execution?.status || 'NOT_RUN',
    doctor_status: report.runtime_doctor?.execution?.status || report.runtime_doctor?.status || 'NOT_RUN',
  }));
  return 0;
}

const invoked = (() => {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); }
  catch { return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url); }
})();
if (invoked) {
  try { process.exitCode = await main(); }
  catch (error) {
    console.error(JSON.stringify({ status: 'INSTALL_CHECK_FAILED', error: redactText(error.message) }));
    process.exitCode = 1;
  }
}

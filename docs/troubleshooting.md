# Installation Troubleshooting

Use this page only after the installer, `setup`, or session probe reports a failure.
Preserve the first status and avoid speculative cleanup.

## First Checks

1. Record the operating system, architecture, Agent name/version, selected Skill
   destination and data root, failed phase, error code, version, and build ID.
2. Confirm that the data root is persistent, private, and local. Do not assume a
   convenient home-directory path is permitted by the Agent host.
3. Confirm no installer, runner, broker, or Skill-owned Chromium process is still
   active before retrying or removing a stale lock.
4. Do not upload applicant files, photographs, browser profiles, saved PDFs, or raw
   runtime logs.

## Browser Verification

The installed `setup` command verifies the production profile's atomic Preferences
write, driver, synthetic browser behavior, and headed launcher without accessing
CEAC. A separate `session probe --browser-test` proves the broker survives across
tool calls and repeats that profile write in the runner process. A failure in one
permission mode is not repaired by passing a command under different privileges.

Keep the Agent's system-wide sandbox enabled. On a positively identified WorkBuddy
macOS host, the runtime reports `HOST_SANDBOX_COMPAT` and handles the known nested-
sandbox conflict automatically. Other GUI/security errors must be resolved through
the host's documented permission model; do not invent Chromium flags.

## Public Diagnostic Checker

Download and inspect:

https://gamhoi.github.io/ds160-autofill-releases/install-check.mjs

For a passive check of an existing attempt:

```text
node <install-check.mjs> --output <new-report.json> --dest <skill-folder> --driver-dir <driver-folder> --workspace <workspace>
```

For a dedicated compatibility machine, the checker can run the already-inspected
installer and browser test. Use fresh dedicated paths and the stable channel unless a
maintainer explicitly requests an exact prerelease:

```text
node <install-check.mjs> --output <new-report.json> --installer <install.mjs> --dest <new-test-skill> --data-root <new-test-data-root> --browser-test
```

The checker never creates or fills a DS-160 application. Its report is designed to
exclude usernames, hostnames, absolute paths, and applicant values, but it must still
be reviewed before sharing.

## Common Outcomes

- `NO_STABLE_RELEASE`: the public stable pointer is unavailable or invalid; do not
  silently install a prerelease.
- `CHROMIUM_NOT_INSTALLED` or driver mismatch: rerun the official installer against
  its managed driver directory.
- `BROWSER_INSTALL_CACHE_LOCK_BUSY`: the shared Playwright cache lock was detected
  before starting the browser download, or Playwright found it later. Wait for any
  active installer; if none is active, inspect the lock and host permissions. Do
  not remove it based only on its age. The installer never removes it automatically.
- `BROWSER_INSTALL_CACHE_LOCK_CLEANUP_FAILED`: Playwright could not release its
  shared cache lock. Inspect the host's file-operation policy before retrying;
  do not repeatedly reinstall or remove the lock without verifying ownership.
- `SETUP_PROFILE_WRITE_DENIED`: the real runner cannot atomically update its
  dedicated browser profile in the chosen workspace. Select another persistent,
  private data root permitted to the runtime; do not use the system temporary
  directory for an application.
- `INSTALL_PATH_OVERRIDE_REJECTED`: run the installed command without supplying
  a different driver or workspace path.
- active installation/session lock: wait for the recorded owner.
- stale lock: prove the recorded owner exited, then remove only the documented lock.
- `SECURE_BROWSER_LAUNCH_REQUIRES_HOST_PERMISSION`: follow the Agent host's documented
  GUI/local-execution permission flow without disabling system-wide protections.
- `SESSION_METADATA_WRITE_DENIED`: the broker could not atomically write session
  metadata under the current host permission. Choose a persistent private data root
  permitted by the host, then rerun `setup` and the session probe. Do not bypass the
  host sandbox or edit the metadata manually.
- `SESSION_LOOPBACK_DENIED`: the host denied the local broker listener. Use a host
  mode that permits loopback listeners; changing workspace paths will not fix it.
- `SESSION_START_FAILED`: no specific permission error was reported. Confirm the
  host keeps spawned processes alive across tool calls; use `--anchor` only with a
  genuinely long-lived host background task. Do not infer failure from a shell's
  delete prompt alone.
- detached probe fails because the host reaps child processes: use `--anchor` only
  if it provides a genuine long-running background task. `--anchor` does not
  change filesystem permissions. Conclude that the host cannot drive the Skill
  only after the path and process-lifetime checks both fail to provide a safe route.

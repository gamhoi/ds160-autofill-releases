# Installation Troubleshooting

Use the path-policy check below before installation on a restricted host. Use the
other sections if ordinary stable installation or required browser verification
fails. Preserve the first failure and avoid speculative cleanup.

## First Checks

1. Record the operating system, architecture, Agent name/version, requested Skill,
   driver and workspace locations, installer status, error code, version, and build ID.
2. Confirm the three directories are local and separate.
3. Confirm no installer, runner, broker, or Skill-owned Chromium process is still
   active before retrying or removing a stale lock.
4. Do not upload applicant files, photographs, browser profiles, saved PDFs, or raw
   runtime logs.

## Path-Policy Check

The installer atomically activates the Skill by renaming a staged directory under
the Skill parent. It also writes the driver and workspace. Session mode atomically
renames broker metadata inside the workspace; the runtime keeps its managed
operation lock beside the installed Skill. Merely creating a file, passing
`doctor --browser-test`, or installing with elevated privileges does not prove
that later session commands have these permissions.

On a host that restricts file paths, test the chosen Skill parent, driver
directory, and workspace before installation. After installation, also test the
installed Skill directory and workspace in the mode used for session calls:

1. Create the chosen driver and workspace directories if absent. Under each
   tested location, create a uniquely named disposable empty directory. Do not
   pre-create the final Skill directory; test its parent instead.
2. Rename that directory to a new sibling name, then remove it. Require all three
   operations to succeed. For the installed Skill and workspace, use the same
   execution mode as `session probe`, `wait`, `reply`, and `start`. Check whether
   the host silently escalated the command; an elevated pass does not count for
   sandboxed runtime calls.
3. If a location fails, choose another private local permitted location or obtain
   a persistent, narrowly scoped host path grant. Do not disable the whole host
   sandbox or use a repository, cloud-synced folder, or shared volume for applicant
   data just because it is writable.

The check creates only empty disposable directories. If removal is denied, report
the residue and do not use that location for a new installation. Do not delete
existing Skill, driver, browser, or applicant data while testing permissions.

## Browser Verification

`doctor --browser-test` proves the pinned driver, synthetic browser behavior, and the
production-equivalent headed launcher. It does not prove that a one-shot Agent can
keep a runner alive across later tool calls. Complete the installed runtime reference's
`session probe --browser-test` when session mode is required.

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
node <install-check.mjs> --output <new-report.json> --installer <install.mjs> --dest <new-test-skill> --driver-dir <new-test-driver> --workspace <new-test-workspace> --browser-test
```

The checker never creates or fills a DS-160 application. Its report is designed to
exclude usernames, hostnames, absolute paths, and applicant values, but it must still
be reviewed before sharing.

## Common Outcomes

- `NO_STABLE_RELEASE`: the public stable pointer is unavailable or invalid; do not
  silently install a prerelease.
- `CHROMIUM_NOT_INSTALLED` or driver mismatch: rerun the official installer against
  its managed driver directory.
- active installation/session lock: wait for the recorded owner.
- stale lock: prove the recorded owner exited, then remove only the documented lock.
- `SECURE_BROWSER_LAUNCH_REQUIRES_HOST_PERMISSION`: follow the Agent host's documented
  GUI/local-execution permission flow without disabling system-wide protections.
- `SESSION_START_FAILED` or a broker that never becomes ready: record any surfaced
  underlying error and check workspace rename/delete permissions in the same host mode.
  A missing session log does not prove a process-lifetime failure. If paths work,
  verify whether the host kills descendants at the end of a tool call.
- detached probe fails because the host reaps child processes: use `--anchor` only
  if it provides a genuine long-running background task. `--anchor` does not
  change filesystem permissions. Conclude that the host cannot drive the Skill
  only after the path and process-lifetime checks both fail to provide a safe route.

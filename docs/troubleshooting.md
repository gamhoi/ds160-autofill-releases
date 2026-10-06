# Installation Troubleshooting

Use this document only after the ordinary stable installation or required browser
verification fails. Preserve the first failure and avoid speculative cleanup.

## First Checks

1. Record the operating system, architecture, Agent name/version, requested Skill,
   driver and workspace locations, installer status, error code, version, and build ID.
2. Confirm the three directories are local and separate.
3. Confirm no installer, runner, broker, or Skill-owned Chromium process is still
   active before retrying or removing a stale lock.
4. Do not upload applicant files, photographs, browser profiles, saved PDFs, or raw
   runtime logs.

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
- session detached probe fails: use `--anchor` only if the host provides a genuine
  long-running background task; otherwise that Agent cannot drive this Skill safely.

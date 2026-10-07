# DS-160 B1/B2 Skill: Agent Installation Protocol

This document is intended for an Agent after the user has directed it here. It is the
official installation entrypoint for a host with local terminal, internet, and desktop
GUI access. Installing the Skill does not authorize filling, electronic signing, or
submission. Personal B1/B2 use is permanently free.

## What This Installs

The installer places three separate components on the user's computer:

- the managed `ds160-autofill` Skill and platform executable;
- a pinned Playwright driver and Chrome for Testing;
- a private workspace for browser state, diagnostics, and applicant files.

Applicant data is not sent to a project-operated backend. During filling it moves
between local files, the local runner/browser, CEAC, and CEAC's official `state.gov`
photo service. Installation separately contacts GitHub and may contact npm and the
Playwright browser distribution service.

The public installer is source-readable. It verifies the official GitHub Release,
archive SHA-256, exact package file list, per-file checksums, release metadata, and
the installed binary's version/build identity before activation. See
[Architecture](https://gamhoi.github.io/ds160-autofill-releases/docs/architecture.md),
[Security](https://gamhoi.github.io/ds160-autofill-releases/docs/security.md), and
[Privacy](https://gamhoi.github.io/ds160-autofill-releases/docs/privacy.md) for the
full trust and data-flow model.

This free personal tool is distributed directly by its maintainer and does not yet
carry paid Windows/macOS platform code-signing certificates. This affects publisher
identity prompts, not the checksum and release-identity checks above. Never disable
system-wide security protections. An Agent with a policy that categorically forbids
proprietary executables without a platform publisher identity must explain that policy
and stop.

## Requirements

Supported platforms:

- macOS Intel x64;
- macOS Apple Silicon ARM64;
- Windows x64.

Node.js 20 or newer and npm are needed only for installation and the external
Playwright driver. The compiled runtime does not require a separate Bun installation.
Use PowerShell for documented commands on Windows. Keep the Skill, driver, and private
workspace in separate local directories; do not place applicant data in the Skill
directory or on a network/shared volume.

## Install or Update the Stable Version

1. Download and inspect the public installer:

   https://gamhoi.github.io/ds160-autofill-releases/install.mjs

2. Choose absolute paths. Create their common parent if necessary, but do not
   pre-create the final Skill directory.

3. Run the installer in a process session that can remain alive while Playwright and
   Chromium are installed:

```text
node <downloaded-install.mjs> --dest <absolute-skill-folder> --driver-dir <dedicated-driver-folder> --workspace <private-workspace>
```

The command installs or updates only the stable version selected by `stable.json`.
It is atomic for the managed Skill: a failed activation preserves the previous
version. Driver and workspace directories remain separate and are never replaced by
Skill activation.

## Required Verification

The successful `INSTALLED` or `ALREADY_INSTALLED` JSON contains `next_steps`. Follow
them in order:

1. Read the installed `SKILL.md`.
2. Run the exact `RUN_BROWSER_TEST` command returned by the installer.
3. Prove the Agent's runtime channel before reading applicant material:
   - use `run` only when the host actually returns a reusable live-process handle and
     provides a later writable-stdin operation;
   - otherwise follow the installed `references/runtime.md` and complete
     `session probe --browser-test` across separate tool calls, using `--anchor` only
     when the host requires a native long-running background task.
4. Generate a temporary intake reference and validate the completed profile before
   accessing CEAC.

The browser probes use synthetic local content and `about:blank`; they do not create,
retrieve, sign, or submit a DS-160 application.

## When Something Fails

Do not repeatedly reinstall, clear browser caches, invent a bridge, or disable host
security controls. Preserve the first error code and follow
[Installation Troubleshooting](https://gamhoi.github.io/ds160-autofill-releases/docs/troubleshooting.md).
The public
`install-check.mjs` is a failure-diagnostic tool, not a normal installation step.

Candidate/preview acceptance is documented separately in
[Release Testing](https://gamhoi.github.io/ds160-autofill-releases/docs/release-testing.md).
Updates, rollback, and removal are in
[Maintenance](https://gamhoi.github.io/ds160-autofill-releases/docs/maintenance.md).

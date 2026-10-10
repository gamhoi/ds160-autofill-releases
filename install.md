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
photo service. Installation contacts the selected GitHub or Gitee release mirror and
may contact npm and the Playwright browser distribution service.

The public installer is source-readable. It verifies the selected official Release,
archive SHA-256, exact package file list, per-file checksums, release metadata, and
the installed binary's version/build identity before activation. See
[Architecture](https://gamhoi.github.io/ds160-autofill-releases/docs/architecture.md),
[Security](https://gamhoi.github.io/ds160-autofill-releases/docs/security.md), and
[Privacy](https://gamhoi.github.io/ds160-autofill-releases/docs/privacy.md) for the
full trust and data-flow model.
The same documents are under `docs/` in the
[Gitee mirror](https://gitee.com/gamhoi/ds160-autofill-releases).

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
Use PowerShell for documented commands on Windows. For an ordinary installation,
set `--dest` to `ds160-autofill` inside the Agent host's documented, persistent,
user-level Skills directory. The host must discover it in a new task; a writable
project or task directory is not a substitute. This does not require a system-wide
or administrator-level installation. Choose a
separate persistent, private, local data root that the Agent can use at runtime;
the installer creates `driver/` and `workspace/` beneath it. A disposable task
directory is suitable only for an isolated candidate test, not a reusable install.
Do not put applicant files in the Skill or a synced/shared location. Installation
under elevated permissions does not prove runtime access;
the local and cross-call checks below verify that separately.

## Install or Update the Stable Version

1. Download and inspect the same public installer from either mirror:

   - GitHub: https://gamhoi.github.io/ds160-autofill-releases/install.mjs
   - Gitee: https://gitee.com/gamhoi/ds160-autofill-releases/raw/master/install.mjs

2. Identify the host's registered user-level Skills directory before choosing
   `--dest`; use `<that-directory>/ds160-autofill`. A user-specified Skill path
   qualifies only if the host will discover it across tasks. Choose a separate,
   persistent private data root. Do not invent a top-level home directory, assume
   a task directory is synced merely from its name, or use the system temporary
   directory for a real application. If the registered Skill location or its write
   permission is unclear, ask the user instead of silently installing into the
   current project. Do not pre-create the final Skill directory. The isolated
   candidate-test exception is in Release Testing below; it does not change the
   destination for an ordinary stable installation.

3. Run the installer in a process session that can remain alive while Playwright and
   Chromium are installed:

```text
node <downloaded-install.mjs> --dest <absolute-skill-folder> --data-root <absolute-private-data-root>
```

The command installs or updates only the stable version selected by `stable.json`.
By default, it checks both official manifests and selects the faster responding source.
Use `--source github` or `--source gitee` only when a specific mirror is required.
Both mirrors publish the same manifest bytes and platform ZIPs; a mismatch stops
installation instead of accepting divergent release metadata.
It is atomic for the managed Skill: a failed activation preserves the previous
version. Driver and workspace directories remain separate and are never replaced by
Skill activation. Reuse the recorded data root when updating an existing Skill;
the installer rejects a different root rather than silently switching its workspace.

## Required Verification

The successful `INSTALLED` or `ALREADY_INSTALLED` JSON contains `next_steps`. Follow
them in order, using the installed paths recorded by the tool:

1. Read the installed `SKILL.md`.
2. Run the returned `VERIFY_LOCAL_SETUP` command in the permission mode intended
   for the application. It checks resources, the production browser profile's
   atomic write, synthetic browser behavior, and the headed launcher without CEAC.
3. Run the returned `session probe --browser-test` across separate tool calls as
   described in the installed `references/runtime.md`. This checks broker lifetime,
   input delivery, and the production profile write in the actual runner process.
   Use `--anchor` only if the host demonstrably needs a long-running background task.
4. Generate a temporary intake reference and validate the completed profile before
   accessing CEAC.

The browser probes use synthetic local content and `about:blank`; they do not create,
retrieve, sign, or submit a DS-160 application.

## When Something Fails

Do not repeatedly reinstall, clear browser caches, invent a bridge, or disable host
security controls. Preserve the first error code and follow
[Installation Troubleshooting](https://gamhoi.github.io/ds160-autofill-releases/docs/troubleshooting.md)
or the corresponding document in the Gitee mirror.
The public
`install-check.mjs` is a failure-diagnostic tool, not a normal installation step.

Candidate/preview acceptance is documented separately in
[Release Testing](https://gamhoi.github.io/ds160-autofill-releases/docs/release-testing.md).
Updates, rollback, and removal are in
[Maintenance](https://gamhoi.github.io/ds160-autofill-releases/docs/maintenance.md).

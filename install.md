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
Use PowerShell for documented commands on Windows. Keep the Skill, driver, and private
workspace in separate local directories. They may be siblings under one permitted
private root; separate does not mean different parent trees. Do not place applicant
data in the Skill directory or on a network/shared volume. Installation must be able to write the
driver/workspace and atomically rename under the Skill parent. Later runtime calls
must be able to manage the lock in the installed Skill and rename metadata in the
workspace. A privileged install does not prove those later permissions.

## Install or Update the Stable Version

1. Download and inspect the same public installer from either mirror:

   - GitHub: https://gamhoi.github.io/ds160-autofill-releases/install.mjs
   - Gitee: https://gitee.com/gamhoi/ds160-autofill-releases/raw/master/install.mjs

2. Choose paths before running the installer. Use user-specified locations if they
   meet the requirements above. Otherwise identify the Agent host's authorized,
   persistent local Skill and data locations; do not invent a new top-level folder
   under the user's home directory merely because its path looks convenient. If no
   suitable locations are known, ask the user. A task-specific folder may be
   appropriate for a short candidate test, but not automatically for a continuing
   installation. Do not mistake an Agent task folder for a repository or synced
   directory solely because it is called a workspace; check its actual properties.
   Create the chosen common parent if necessary, but do not pre-create the final
   Skill directory.

3. Before installing into newly chosen paths, complete the disposable
   [path-policy check](docs/troubleshooting.md#path-policy-check) for the
   Skill parent, driver, and workspace. Use the permission mode intended for later
   `session` calls and check for silent host escalation. If the check fails, stop
   before installation; do not move applicant files into a repository or synced
   folder merely to gain write permission.

4. Run the installer in a process session that can remain alive while Playwright and
   Chromium are installed:

```text
node <downloaded-install.mjs> --dest <absolute-skill-folder> --driver-dir <dedicated-driver-folder> --workspace <private-workspace>
```

The command installs or updates only the stable version selected by `stable.json`.
By default, it checks both official manifests and selects the faster responding source.
Use `--source github` or `--source gitee` only when a specific mirror is required.
Both mirrors publish the same manifest bytes and platform ZIPs; a mismatch stops
installation instead of accepting divergent release metadata.
It is atomic for the managed Skill: a failed activation preserves the previous
version. Driver and workspace directories remain separate and are never replaced by
Skill activation.

## Required Verification

The successful `INSTALLED` or `ALREADY_INSTALLED` JSON contains `next_steps`. Follow
them in order:

1. Read the installed `SKILL.md`.
2. Run the exact `RUN_BROWSER_TEST` command returned by the installer.
3. Prove the Agent's runtime channel before reading applicant material:
   - if installation ran with different privileges, first repeat the create/rename
     path-policy check in the workspace in the session command's actual permission
     mode; the session probe itself checks lock management inside the installed Skill;
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
[Installation Troubleshooting](https://gamhoi.github.io/ds160-autofill-releases/docs/troubleshooting.md)
or the corresponding document in the Gitee mirror.
The public
`install-check.mjs` is a failure-diagnostic tool, not a normal installation step.

Candidate/preview acceptance is documented separately in
[Release Testing](https://gamhoi.github.io/ds160-autofill-releases/docs/release-testing.md).
Updates, rollback, and removal are in
[Maintenance](https://gamhoi.github.io/ds160-autofill-releases/docs/maintenance.md).

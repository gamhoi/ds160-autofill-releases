# DS-160 B1/B2 Skill: Agent Installation Protocol

This document is intended for an Agent after the user has directed it here. It is the
official installation entrypoint for a host with local terminal, internet, and a
desktop GUI or Linux Xvfb display. Installing the Skill does not authorize filling, electronic signing, or
submission. Personal B1/B2 use is permanently free.

## What This Installs

The installer places three separate components on the runner host (a desktop or web Agent task VM):

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
- Windows x64;
- Linux x64 on supported Ubuntu/Debian releases with a non-root user, Chromium system dependencies, and an X11 display or Xvfb.

On Linux, run the installer, `setup`, and sessions as the same non-root user.
The installer stops early with `LINUX_INSTALL_REQUIRES_NON_ROOT_USER` if invoked
as root. The installed package contains further Linux notes in
`references/setup-linux.md`.
If the Agent shell starts as root, it may prepare a fresh task-specific private
directory owned by an existing non-root user, then run all DS-160 commands as
that user. Do not relax permissions on shared parent directories.

Node.js 20 or newer and npm are needed only for installation and the external
Playwright driver. The compiled runtime does not require a separate Bun installation.
Use PowerShell for documented commands on Windows. Choose the installation scope
before selecting paths:

- For a desktop Agent or a host that registers user Skills across tasks, set
  `--dest` to `ds160-autofill` inside its documented, persistent user-level Skills
  directory. Verify discovery in a new task. This does not require a system-wide
  or administrator-level installation.
- For a web Agent whose shell-installed Skills are not registered across tasks,
  a task-scoped installation is supported. Select the host's documented task
  storage, where possible the storage intended to survive VM replacement. Choose
  separate Skill and data-root paths writable by the same non-root runtime user.
  On Linux, if the private data root is on VM-local storage, also select a
  task-persistent `--dependency-root` for Playwright and Chromium. These are
  reusable program dependencies; keep application materials and the browser
  profile in the private data root.
  Record their absolute paths and read the installed `SKILL.md` explicitly. Use the
  installed executable by absolute path. An actual VM replacement is the time to
  test whether those paths survived; this is not an installation prerequisite and
  does not require a user decision. A shell installation does not register the
  Skill in the host's account-level catalog or make it discoverable in a new task.

By default, the installer creates `driver/` and `workspace/` beneath the data
root and, on Linux, keeps Chromium in `browsers/` there. On Linux,
`--dependency-root` instead keeps `driver/` and `browsers/` under that separate
root while `workspace/` stays under `--data-root`. Use the same non-root identity for
installation and runtime. Select paths from the host's task-storage conventions;
do not infer persistence solely from a directory name, mount type, or device ID.
For real applicant data, use host-designated task-private storage with owner-only
permissions. Those permissions alone do not establish isolation if tasks share a
UID. If there is concrete evidence that another task can read the proposed data
root or uploaded originals, do not copy more applicant data there; explain that
specific exposure once and use a safer location if available. If no suitable
location exists, stop before storing applicant data. This does not block Skill
installation or synthetic probes. Do not put applicant files in the Skill.
Treat mount choice, paths, permissions, and the current stable version as Agent
implementation details. Report the chosen location and any material limitation
briefly; request user input only for a concrete unresolved blocker.

## Install or Update the Stable Version

1. Download and inspect the same public installer from either mirror:

   - GitHub: https://gamhoi.github.io/ds160-autofill-releases/install.mjs
   - Gitee: https://gitee.com/gamhoi/ds160-autofill-releases/raw/master/install.mjs

2. For a cross-task desktop installation, identify the host's registered user-level
   Skills directory and use `<that-directory>/ds160-autofill`. For a task-scoped
   web installation, select writable task paths as described above and retain their
   absolute values for later turns. Choose a separate data root. If the host has no
   private persistent location, keep the Skill and Linux dependency root in
   task-persistent storage while the data root uses a private local directory.
   After VM replacement the applicant workspace may need to be restored, but
   the pinned Playwright and Chromium assets can be reused without downloading.
   Do not use a
   system temporary directory for a real application. Choose paths and permissions without asking
   the user unless no safe writable location exists. Do not pre-create the final
   Skill directory. The candidate testing rules are in Release Testing below.

3. Run the installer in a process session that can remain alive while Playwright and
   Chromium are installed:

```text
node <downloaded-install.mjs> --dest <absolute-skill-folder> --data-root <absolute-private-data-root>
```

On Linux, when the private data root is VM-local but the task has persistent
storage for program files, also pass `--dependency-root <absolute-task-persistent-dependency-directory>`.
For an existing managed installation, reuse the same `--dest` and `--data-root`
and add `--dependency-root` once to migrate the dependency paths. The installer
does not copy or move applicant files. Later updates remember the dependency
paths from the installation state, so the extra argument need not be repeated.
If the private data root is itself task-persistent, the default layout is sufficient.

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

On a task-scoped cloud installation, repeat `setup` and the browser-chain session
probe after a VM replacement, using the original absolute paths without reinstalling
when Skill, driver, workspace, and Chromium still exist. A live broker, runner, and
Chromium process cannot survive VM replacement. Inspect any old session metadata and
confirm the old processes are gone before cleanup or starting a new session; see the
installed `references/runtime.md`. An application draft must be recovered through
the normal retrieve flow, never by blindly repeating a protected action.

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

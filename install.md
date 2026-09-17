# Install the DS-160 B1/B2 Skill

This guide is an installation entrypoint for an Agent with local terminal, internet
and GUI access. Installing the tool does not authorize filling or submitting an
application. The binary edition is permanently free B1/B2, not an open-source engine.

## Environment

Supported: macOS Intel x64 / Apple Silicon ARM64, Windows x64. Unsupported platforms
must stop, not substitute a system Chrome or an unverified binary. Check the current
release's platform availability before promising installation. A null release in
stable.json means no approved public version is available yet.

Check `node --version` and `npm --version`. Node.js 20 or newer is needed for the
installer and external Playwright, not to run the compiled executable itself.
If missing, explain this dependency and install a supported Node.js LTS from
https://nodejs.org/ using the user's approved OS/package-manager route. Obtain any
required permission; do not disable security controls or repeatedly retry a blocked
environment. Recheck both commands before proceeding.

## Install

Choose the target Agent's supported Skill directory, with this Skill's own folder
named ds160-autofill. Use absolute paths. Do not overwrite unrelated rules/config or
assume all Agents share a directory. If the client has no compatible Skill loading
mechanism, report it. Keep driver, workspace and applicant materials outside this folder.

Download and inspect the public installer from:
https://gamhoi.github.io/ds160-autofill-releases/install.mjs

Save it locally, then run in a persistent process session:

```text
node <downloaded-install.mjs> --dest <absolute-skill-folder> --driver-dir <dedicated-driver-folder> --workspace <private-workspace>
```

It downloads the stable platform ZIP, verifies archive/file checksums and binary
identity, installs pinned Playwright/Chromium if necessary, and runs doctor before
activation. No system Chrome, Bun installation, account or product login is needed.
Unsigned OS approval may be necessary; never disable system-wide protections.

## Test an Explicit Local Candidate

For pre-release testing, obtain the matching platform ZIP directly from the maintainer
and use the same public installer above. Do not unzip it manually or create a manifest:

```text
node <downloaded-install.mjs> --candidate-archive <local-candidate.zip> --dest <absolute-test-skill-folder> --driver-dir <dedicated-driver-folder> --workspace <private-test-workspace>
```

This works even when stable.json has no release. Only an explicitly trusted local
release ZIP is accepted; debug ZIPs and other-platform packages are rejected. The ZIP
may be moved or renamed. Package checksums detect corruption, not authenticity of a
self-contained candidate; verify any separately supplied SHA-256 with the maintainer.
Do not combine this option with --version, --manifest-file or --rollback. Verify using
the next section, then follow the installed SKILL.md for filling. Installation alone
does not authorize a live application or submission. Normal installation and updates
still use the approved stable release; testing does not publish or promote a candidate.

## Verify

The installer must report INSTALLED or ALREADY_INSTALLED. Read the installed
SKILL.md, locate bin/ds160 (macOS) or bin/ds160.exe (Windows), then run:

```text
<exe> doctor --driver-dir <driver-folder> --workspace <workspace> --browser-test
<exe> template --output <temporary-intake.json>
```

Confirm the local browser test passes and the target Agent can discover the Skill;
reload its supported Skill mechanism if required. The generated intake is a reference,
not a completed application. These checks must not create or submit a CEAC application.

## Update and Roll Back

```text
node <install.mjs> --dest <skill-folder> --check
node <install.mjs> --dest <skill-folder>
node <install.mjs> --dest <skill-folder> --version <retained-version>
node <install.mjs> --dest <skill-folder> --rollback
```

Checking does not install. Update or rollback only with the user's approval and after
the runner exits. A shared installation lock blocks concurrent runs/changes. A lock
left by a killed process requires checking owner.json and proving its owner exited
before manually removing it; never remove a live lock. Installation failure before
activation leaves the previous package in place. Unknown files inside the Skill
block updates rather than risk deleting applicant data. One previous package is retained.
Driver repair may change a dedicated driver even when activation fails; it is separate
from the Skill rollback. Applicant profiles, photos, diagnostics and PDFs are not replaced.

Archived versions may no longer have downloadable ZIPs; choose a retained supported
version instead. A checksum checks integrity, not publisher authenticity. Download
only from the trusted publisher. Never send application material to installation support.

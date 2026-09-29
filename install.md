# Install the DS-160 B1/B2 Skill

This guide is an installation entrypoint for an Agent with local terminal, internet
and GUI access. Installing the tool does not authorize filling or submitting an
application. Personal B1/B2 use is permanently free; the binary engine is proprietary.
There is no developer applicant-data backend. The installed LICENSE.txt contains the
detailed terms and PRIVACY.md explains local files and CEAC data flow.

## Copy to Your Agent

Paste this prompt into the Agent that should use the Skill:

```text
Install or update the DS-160 B1/B2 Skill by following this guide:
https://gamhoi.github.io/ds160-autofill-releases/install.md

Use only the guide's official installer. Do not manually extract the package, run
npx skills add for this product, or create duplicate copies. After installation,
run doctor with --browser-test and generate a temporary template. Report the installed
version, Skill directory, driver directory, workspace and verification results.
```

Use one installation method and one managed `ds160-autofill` directory per target
Agent. If another copy exists, identify which installation owns it before changing
anything. Do not combine this installer with a Claude marketplace, `npx skills`, or
manual-copy installation of the same Skill.

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
Do not combine this option with --version, --manifest-file, --rollback or --uninstall.
Verify using the next section, then follow the installed SKILL.md for filling. Installation alone
does not authorize a live application or submission. Normal installation and updates
still use the approved stable release; testing does not publish or promote a candidate.

## Test an Exact Public Preview

A maintainer may publish a GitHub prerelease to test the real public download path
without changing the default stable version. Use only the exact version supplied by
the maintainer:

```text
node <downloaded-install.mjs> --version <preview-version> --dest <absolute-test-skill-folder> --driver-dir <dedicated-driver-folder> --workspace <private-test-workspace>
```

This downloads `manifest.json` and the matching platform ZIP from the official public
GitHub Release, then performs the same checksum, identity, dependency and doctor
checks as a stable install. Omitting `--version` still reads only stable.json. A public
preview is not a stable release and must not be installed silently for ordinary users.

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

## Installation Diagnostics

Do not run diagnostics before every normal installation. If installation or browser
verification fails, download and inspect the public checker:

https://gamhoi.github.io/ds160-autofill-releases/install-check.mjs

It is a source-readable Node.js script and does not contain the proprietary runtime.
Run a passive check against the same directories first:

```text
node <install-check.mjs> --output <new-report.json> --dest <skill-folder> --driver-dir <driver-folder> --workspace <workspace>
```

For a dedicated compatibility test machine, it can execute the already-inspected
official installer and collect installation plus browser verification in one report:

```text
node <install-check.mjs> --output <new-report.json> --installer <install.mjs> --version <exact-preview-version> --dest <dedicated-test-skill> --driver-dir <dedicated-test-driver> --workspace <dedicated-test-workspace> --browser-test
```

Use new or explicitly disposable test directories for this second mode. It may install
Playwright/Chromium and the selected Skill package, but it never creates, fills, signs
or submits a DS-160 application. The report excludes applicant values, usernames,
hostnames, absolute paths and raw logs. Review it before sharing. Do not upload a
profile, photograph, browser profile or ordinary runtime log for installation support.

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

## Uninstall

Stop the runner and Chromium first, then use the same downloaded installer:

```text
node <install.mjs> --dest <skill-folder> --uninstall
```

The command removes only the checksum-verified managed Skill directory and its known
rollback copy. It deliberately preserves the external driver directory, workspace,
profiles, photos, diagnostics and saved PDFs, and reports their locations. If package
files were changed or unknown files were placed inside the Skill, uninstall stops
rather than deleting them. Move applicant material out and restore or reinstall the
managed package before retrying. Remove preserved data separately only after the user
identifies it and explicitly authorizes deletion.

If filesystem locking prevents immediate cleanup after the managed directories have
been detached, the result reports an `UNINSTALL_RESIDUAL_PRESERVED` warning and the
exact residual path. Confirm no runner is active before removing only that path.

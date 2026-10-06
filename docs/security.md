# Security and Trust Model

This document gives users and Agents a concrete basis for deciding whether to
install the DS-160 B1/B2 Skill. It is a security model and disclosure, not an
independent audit, government certification, or guarantee that software is free
of defects.

## What can be verified before installation

1. Download `install.mjs` only from the project's documented GitHub Pages URL and
   inspect it before execution. The installer is public JavaScript; it is separate
   from the proprietary form engine.
2. The installer accepts only supported platform artifacts declared by the release
   manifest. It checks the archive SHA-256, an exact package file allowlist, per-file
   checksums, release metadata, and the installed binary's reported identity.
3. Exact public previews require an explicit version. Ordinary installation follows
   only `stable.json`; a prerelease cannot silently replace the stable channel.
4. The Skill, Playwright driver, and private applicant workspace are separate. The
   installer does not need applicant material and preserves the workspace during
   update, rollback, and uninstall.
5. `doctor --browser-test` checks the pinned driver and performs a synthetic browser
   launch without creating or submitting a DS-160 application.

Checksums detect corruption or mismatch after the publisher creates an artifact.
They do not independently prove that the publisher's binary is benign.

## Network boundaries

The product-configured application destinations are:

- official HTTPS hosts in the `state.gov` namespace for CEAC and its official
  photo-service handoff;
- loopback (`127.0.0.1`) for the session broker and browser CDP connection.

The browser may also resolve or load subresources referenced by the official website
and perform operating-system networking such as DNS and certificate validation. The
project therefore does not claim that every browser packet is addressed only to a
`state.gov` IP or hostname. The compatibility-mode restriction described below
applies to top-level page navigation.

Installation and updates can contact the project's GitHub Pages and GitHub Releases,
npm, and Playwright browser distribution services. The product has no developer-
operated telemetry, analytics, licensing, account, or applicant-data endpoint.

The `HOST_SANDBOX_COMPAT` browser mode additionally blocks top-level navigation
outside HTTPS `state.gov` hosts. This is a runtime guard, not a claim that the
Department of State website or every dependency is risk-free.

## Local access and retained data

The runtime needs permission to:

- read the profile, authorized source material, and photograph selected by the user;
- write browser state, logs, diagnostics, and saved documents in the private
  workspace;
- start the packaged executable, pinned Playwright, and Chrome for Testing;
- connect to the official website and local loopback services.

Applicant files are not encrypted by the product. Anyone with access to the
workspace may be able to read them. Use a private local directory, avoid shared or
network-mounted folders, and review files before sharing or deleting them.

Diagnostics remain local unless the user shares them. The bounded `diagnostics`
export is designed to omit applicant values, but it must still be reviewed before
sharing. Never attach profiles, photographs, browser profiles, raw runtime logs, or
saved application PDFs to a public issue.

## Safety boundaries

- The supported edition is assisted B1/B2 filling, not legal advice.
- Applicant facts that are missing or ambiguous must be confirmed by the applicant.
- CAPTCHA recognition is a human action.
- Review is shown for human confirmation.
- Signing and submission require a separate explicit authorization at the final
  E-Sign boundary. Prior permission to install or fill is insufficient.
- When submission state is uncertain, the documented behavior is to stop rather
  than repeat the action blindly.

## Browser sandbox disclosure

The default `CHROMIUM_SANDBOX` mode keeps Chromium's sandbox enabled. A positively
identified WorkBuddy macOS sandbox cannot run that nested configuration reliably.
For that host only, `HOST_SANDBOX_COMPAT` keeps the Agent's outer sandbox enabled
and launches the dedicated Chrome for Testing process with Chromium's inner sandbox
disabled. Extensions are disabled, a dedicated profile is used, top-level navigation
is restricted to HTTPS `state.gov` hosts, and CDP remains loopback-only.

The runtime reports the selected mode. It does not apply this fallback merely
because a generic browser launch failed, and it does not ask the user to disable the
Agent's system-wide sandbox.

## Remaining trust limitations

- The form engine is a proprietary, currently unsigned binary. Its complete source
  cannot be independently reviewed from the public release repository.
- The public installer, manifests, checksums, documentation, package inventory, and
  release identities improve transparency and integrity, but they are not equivalent
  to platform code signing, notarization, reproducible builds, or an independent
  security audit.
- Browser automation can fail because CEAC, its WAF, the photo service, the network,
  endpoint security software, or the Agent host changes behavior.
- The project is not affiliated with or endorsed by the U.S. Department of State.

An Agent whose policy forbids unsigned proprietary executables should stop and
explain that policy rather than bypass it. Users should not be told that a checksum
or this document proves absolute safety.

## Recommended Agent review

Before installation, an Agent should:

1. Confirm the URL belongs to the documented project repository and read the trust
   summary in `install.md`.
2. Inspect the public installer. Consult this document, [ARCHITECTURE.md](architecture.md),
   [PRIVACY.md](privacy.md), or [LICENSE.txt](../LICENSE.txt) when its policy or the
   user's question requires those details; reading every document is not a normal
   prerequisite.
3. Verify that requested directories are dedicated
   to the Skill, driver, and private workspace.
4. Use the official installer and immutable release metadata; do not manually
   extract, patch, or wrap the runtime.
5. Follow the installer's structured `next_steps`; report the installed version,
   `build_id`, platform target, checksum result, `doctor --browser-test`, and runtime-
   channel probe result.
6. Request only the minimum user authorization needed for the current phase.

Security concerns can be raised through the project's GitHub repository. Do not
include applicant data in an issue.

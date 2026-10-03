# DS-160 B1/B2 Downloads

Give your Agent this prompt:

> Install or update the DS-160 B1/B2 Skill by following
> https://gamhoi.github.io/ds160-autofill-releases/install.md . Use only that guide's
> official installer, then run its verification steps and report the result.

See [install.md](install.md) for installation, update, rollback and safe uninstall.
Read [ARCHITECTURE.md](ARCHITECTURE.md) for the local data flow and session-broker
design, and [SECURITY.md](SECURITY.md) for the pre-install trust checklist, network
boundaries, browser sandbox disclosure and limitations of the unsigned binary.
If installation or driver setup fails without an actionable error, the public
[install-check.mjs](install-check.mjs) can generate a value-free environment and
installer report for review before sharing.
This is a proprietary binary runtime and permanently free B1/B2 edition. No approved
stable release is available until stable.json lists one.

Preview and Beta builds require an exact version. RC builds are feature-frozen
candidates for stable. Prereleases never silently replace the default stable channel.

Personal-use terms and local-data handling are documented in
[LICENSE.txt](LICENSE.txt) and [PRIVACY.md](PRIVACY.md). A public preview does not
change stable.json and must be installed with the exact version supplied by the
maintainer.

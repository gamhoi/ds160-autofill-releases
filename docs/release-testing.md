# Candidate and Prerelease Testing

Ordinary users should install the stable channel from `install.md`. The routes below
are for maintainer-directed acceptance testing and never silently replace stable.
Choose the test root before installing. If the user provided one, verify that it
is private, local, and neither a repository nor a synced or shared volume. If not,
first consider the Agent host's current authorized local task directory. Verify
its actual properties and that it will remain available throughout this test;
do not assume that a home-directory path is permitted or that a task directory
is durable enough for later real applications. If neither location qualifies,
ask the user for a suitable root instead of inventing one under the home directory.

For example, use `<authorized-test-root>/ds160-test/{skill,driver,workspace}`:
three sibling directories under one permitted root, not directories nested inside
one another. Before running the installer, complete the path-policy check in
`INSTALLATION_TROUBLESHOOTING.md` for the Skill parent, driver, and workspace
in the execution mode intended for later session calls. Check for silent host
escalation. If any check fails, stop before installation; a successful install
in a different permission mode would not prove that session mode can run.

## Trusted Local Candidate

Use a platform-matching ZIP supplied by the maintainer and the same public installer.
Do not manually extract it or generate a manifest:

```text
node <install.mjs> --candidate-archive <trusted-local.zip> --dest <new-test-skill> --driver-dir <test-driver> --workspace <test-workspace>
```

Verify the separately supplied ZIP SHA-256. Package checksums detect corruption inside
the archive; they do not authenticate a ZIP received through an unrelated channel.

## Exact Public Prerelease

Use only the exact version requested by the maintainer:

```text
node <install.mjs> --version <prerelease-version> --dest <new-test-skill> --driver-dir <test-driver> --workspace <test-workspace>
```

The installer downloads that version's immutable manifest and matching platform ZIP
from the official GitHub Release, then performs the normal identity, dependency, and
doctor checks. Omitting `--version` always returns to the stable channel.

Candidate testing authorizes neither real applicant filling nor submission. A live
acceptance prompt must separately state its data, CAPTCHA, correction, E-Sign, and
submission boundaries.

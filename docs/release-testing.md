# Candidate and Prerelease Testing

Ordinary users should install the stable channel from `install.md`. The routes below
are for maintainer-directed acceptance testing and never silently replace stable.

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

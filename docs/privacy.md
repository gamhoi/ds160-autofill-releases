# Privacy and Local Data

DS-160 Autofill has no developer-operated account, subscription, licensing,
analytics, telemetry, or applicant-data backend. It does not upload applicant
materials or application answers to the developer.

For the component-level data path and local session-broker boundary, see
[ARCHITECTURE.md](architecture.md). For security limitations and pre-install review,
see [SECURITY.md](security.md).

## Where data goes

- Profiles, photos, browser state, diagnostics, logs, and saved PDFs may be stored
  in directories on the user's computer. The installation keeps the Skill, browser
  driver, and private workspace separate.
- During filling, applicant information is entered into the U.S. Department of
  State CEAC website. A photo may be sent to CEAC's official photo service.
- Installation and updates contact the project's GitHub release repository. Initial
  setup may contact the Node.js/npm and Playwright distribution services to install
  the pinned browser driver and Chromium.

The tool does not add a separate developer-controlled copy of the application data.
CEAC and all third-party services have their own privacy and retention practices.

## Diagnostics and support

Detailed diagnostics remain local by default. The `diagnostics` command can create
a bounded, value-free report for manual review. The user should inspect and approve
that report before sharing it. Do not upload profiles, photos, raw logs, browser
profiles, saved PDFs, or other applicant materials to a support issue.

## User responsibility

Use private local directories, control access to the workspace, and remove retained
files only after confirming they are no longer needed. The `clean` command does not
delete final submission PDFs or arbitrary applicant files.

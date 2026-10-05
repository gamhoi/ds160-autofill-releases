# Update, Rollback, and Removal

Use the same inspected public installer and stop the runner and Skill-owned Chromium
before changing the managed installation.

```text
node <install.mjs> --dest <skill-folder> --check
node <install.mjs> --dest <skill-folder>
node <install.mjs> --dest <skill-folder> --version <retained-version>
node <install.mjs> --dest <skill-folder> --rollback
node <install.mjs> --dest <skill-folder> --uninstall
```

Checking does not install. A downgrade requires explicit authorization. Installation
failure before activation leaves the current Skill in place. One previous managed
copy is retained for rollback when compatible.

The operation lock blocks concurrent update and runtime activity. Never remove a live
lock. For a stale lock, inspect `owner.json`, prove its recorded process exited, and
remove only the documented lock directory.

Uninstall removes only the checksum-verified managed Skill and retained rollback copy.
It preserves the external driver, workspace, browser state, profiles, photographs,
diagnostics, and saved PDFs, and reports their locations. Remove applicant data
separately only after the user reviews it.

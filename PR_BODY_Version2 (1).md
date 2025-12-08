### Title
Add/update latest-update-manifest.json (snapshot 2025-11-23T16:59:05Z)

### Summary
This PR adds/updates a distribution-ready manifest file (latest-update-manifest.json) containing a snapshot of repository file paths and canonical permalinks. The manifest is intended to be a stable, machine-friendly index for downstream consumers and distribution packaging. It includes a UTC snapshot timestamp and canonical GitHub URLs for each listed entry.

Manifest location (branch): `latest-update-manifest`  
File: `latest-update-manifest.json`  
Permalink preview (branch): https://github.com/xiaoli2428/moekha125-a11y/blob/latest-update-manifest/latest-update-manifest.json

### What changed
- Added/updated `latest-update-manifest.json` which lists top-level files, src entries, and canonical permalinks, plus metadata:
  - manifest_version
  - snapshot_time_utc
  - generated_by
  - description
  - files (path, type, url)

No source code was modified beyond adding/updating the manifest file.

### Why this change
- Provides a single, authoritative snapshot for distribution and synchronization tasks.
- Reduces errors by providing canonical permalinks and a snapshot timestamp.
- Makes it easy to attach the manifest to releases or CI pipelines.

### How to validate (quick commands)
1. Validate JSON syntax:
   - jq . latest-update-manifest.json
2. Compute/check SHA256:
   - Unix/macOS: sha256sum latest-update-manifest.json
   - PowerShell: Get-FileHash latest-update-manifest.json -Algorithm SHA256
3. Spot-check a few permalinks are reachable:
   - curl -I "https://github.com/xiaoli2428/moekha125-a11y/blob/copilot/link-with-subbase/index.html"
4. Optional: lint JSON for schema compliance (if you have a schema):
   - ajv validate -s manifest-schema.json -d latest-update-manifest.json

### Suggested reviewers
- @xiaoli2428 (maintainer)
- Any other maintainers or integrators who rely on the manifest.

### Labels (suggested)
- documentation
- enhancement
- release-prep

### Merge strategy
- Prefer "Squash and merge" to keep history concise (single commit for the manifest update).
- After merging, create a release and attach the manifest as a release asset (optional).

### Post-merge release instructions (recommended)
1. Create a release tag, e.g., `v0.1.0-manifest-20251123`.
2. ZIP the manifest and attach to the release:
   - zip latest-update-manifest.zip latest-update-manifest.json
   - gh release create v0.1.0-manifest-20251123 latest-update-manifest.zip -t "Manifest snapshot 2025-11-23" -n "Manifest snapshot 2025-11-23T16:59:05Z"
3. Publish release and add the SHA256 checksum to the release notes:
   - sha256sum latest-update-manifest.zip

---

### Reviewer checklist
- [ ] Confirm manifest JSON parses cleanly (run jq .).
- [ ] Confirm a representative sample of permalinks (3–5) resolve (curl -I).
- [ ] Confirm the snapshot_time_utc is correct and acceptable.
- [ ] Confirm no sensitive data or unintended files are included in the manifest.
- [ ] Confirm branch CI (if any) passes after the manifest change.
- [ ] Approve PR and merge using "Squash and merge".
- [ ] Create a release and upload the manifest as an asset (optional but recommended).
- [ ] Record the release tag and checksum in the project release notes.
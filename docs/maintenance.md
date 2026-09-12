# Maintenance

## Weekly (15 min)

- Check CI on `main`; review `link-check.yml` Monday report.
- Scan `/changelog/` vs `data/gate/2027/*` — any official change needs a source-review PR.

## Monthly

- Re-verify all `official` sources in `data/provenance/sources.json`; bump `checkedAt` / `verifiedAt`.
- Re-check every resource `lastChecked`; mark dead links `needs-review`, fix or remove.
- Review `report-error` issues; publish corrections with source + changelog entry.

## Per change

- Official facts: follow `docs/source-verification.md` (human approval required).
- Content: `draft → source check → technical review → copyright check → build → publish → periodic review`.
- Always run `npm run typecheck && npm run validate:data && npm run test && npm run build` before merge.

## Ownership

One maintainer can run this: GitHub + Pages + Search Console. No servers to patch; dependabot-style updates via `npm outdated` monthly.

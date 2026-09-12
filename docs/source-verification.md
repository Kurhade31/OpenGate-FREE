# Source verification

Official GATE facts must be traceable to an official source and human-approved before publishing.

## Registry

`data/provenance/sources.json` — every entry: id, url, authority (`official`), checkedAt (YYYY-MM-DD), checkedBy, notes. Validate with `npm run validate:sources`.

## Rules

1. Canonical order: official site → brochure → syllabus PDF → notifications → GOAPS portal. Never treat YouTube/blogs/Telegram/forums as authoritative.
2. Store official values as versioned data with `verifiedAt`; show source + date in the UI (`source-box`).
3. Uncertain/unannounced items display "Not officially announced yet" — never invent dates, rules, keys, or cutoffs.
4. Clearly label `official` vs `editorial` vs `community` vs `analysis`.

## Publishing flow (human in the loop)

Fetch source → detect change → open review issue/PR with old → new + source → maintainer verifies → update data + changelog → CI validates → preview → merge → deploy. AI may draft or check links; it must never auto-publish official facts.

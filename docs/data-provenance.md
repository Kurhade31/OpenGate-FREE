# Data provenance

Registry: `data/provenance/sources.json` — each entry has id, URL, authority (official), checkedAt, checkedBy, notes.

Update flow: fetch source → detect change → open review issue/PR → human verifies → update `data/gate/2027/*` + changelog → CI validates → preview → merge → deploy. Never auto-rewrite official data.

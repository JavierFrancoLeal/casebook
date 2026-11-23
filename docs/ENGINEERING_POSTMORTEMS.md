---
tier: 3
schema: case-law-v1
purpose: Cold Case-Law Archive & Open Symptoms Radar (NEVER auto-loaded; query via grep on failure)
total_cases: 11
open_symptoms: 1
tags:
  - node-zlib
  - dsh-logs
  - electron-macos
  - css-grid
  - js-dom
  - electron-asar
  - http-auth
  - dsh-hooks
  - sarif
  - dsh-quota
  - ledger-sync
error_strings:
  - "zstdDecompressSync"
  - "backgroundThrottling"
  - "document.elementFromPoint"
  - "setupWizSummary"
  - "Menu.setApplicationMenu"
  - "PointerEvent"
  - "asarUnpack"
  - "X-Fanal-CSRF"
  - "isRealDshAudit"
  - "SEC-CRED-001"
  - "ACCOUNT_QUOTA"
  - "LAST_TURN"
---

# Casebook — Cross-Project Cold Case-Law Archive (`CASE-100`..`CASE-110`) & Open Symptoms Radar

> **Namespace Discipline:** `CASE-100+` is reserved for cross-project infrastructure, Electron/Chromium, Node.js, HTTP security, and agent-harness precedents mined deterministically from production transcripts (zero collision with domain-specific `CASE-001..019` blocks).

---

## Compiled Cases (`status: compiled` — enforced mechanically in Tier 2, `0 tok` prose overhead)

- **CASE-100** `[node-zlib, dsh-logs]` · `vendor-quirk` · `status: compiled` · **Home:** `decode_dsh_zstd.js` (EOF coverage + `frameDecodeErrors === 0` assert)
  - **Root cause:** Node.js `<= v24.21.0` `zlib.zstdDecompressSync` / `createZstdDecompress` silently stopped after Frame #1 on RFC 8878 multi-frame concatenated `.zstd` logs (`54.83 KB` returned vs `234.82 MB` actual across 237 files = `99.98%` silent loss).
  - **Fix:** Upgrade to Node.js `>= v24.22.0` (`nodejs/node#65865`) or scan RFC 8878 frame boundaries with explicit EOF byte-coverage assertions.
- **CASE-101** `[electron-macos]` · `vendor-quirk` · `status: compiled` · **Home:** `apps/desktop/main.js`, `tools/test-human-journey-e2e.mjs` (CDP hit-test E2E)
  - **Root cause:** On occluded macOS Electron windows reopening with saved state, `backgroundThrottling: true` froze `#splash.done` CSS transitions while keeping `z-index: 100` and `pointer-events: auto`, intercepting 100% of form clicks (`elementFromPoint === #splash`).
  - **Fix:** Add `pointer-events: none` to `.done`, explicit `display: none` fallback timer, `backgroundThrottling: false`, and hit-test E2E gate.
- **CASE-102** `[css-grid]` · `class-pattern` · `status: compiled` · **Home:** `supervisor/dashboard.html`, `tools/test-human-journey-e2e.mjs`
  - **Root cause:** Dynamically inserted `#setupWizSummary` (`grid-column: 1 / -1`) auto-placed into row 2 and overlapped `#setupConstitutionBox` (`grid-row: 2 / span 2`).
  - **Fix:** Assign explicit non-overlapping CSS Grid row numbers across all wizard/setup cards and verify clickability with hit-test E2E.
- **CASE-103** `[electron-macos]` · `vendor-quirk` · `status: compiled` · **Home:** `apps/desktop/main.js`, `tools/check.sh` (`ELECTRON DESKTOP TYPING CHECK`)
  - **Root cause:** Packaged macOS Electron apps silently swallowed `Cmd+C`/`Cmd+V`/`Cmd+A` inside HTML inputs when no native `ApplicationMenu` Edit role existed and window focus was not claimed.
  - **Fix:** Register `Menu.setApplicationMenu` with native Edit roles (`undo/redo/cut/copy/paste/selectAll`) and call `app.focus({ steal: true })` on `ready-to-show`/`did-finish-load`.
- **CASE-104** `[js-dom]` · `class-pattern` · `status: compiled` · **Home:** `supervisor/dashboard.html`, `tools/api-smoke.sh` (`403` guard)
  - **Root cause:** Binding `loadStudioTelemetry(force)` directly as a DOM click handler passed a `PointerEvent` object as `force`, making `if (force)` truthy and bypassing Client-edition isolation.
  - **Fix:** Enforce strict boolean `force !== true` in UI and server-side `403` isolation on `/api/studio/telemetry`.
- **CASE-105** `[electron-asar]` · `vendor-quirk` · `status: compiled` · **Home:** `apps/desktop/main.js`, `tools/verify-app.mjs` (`NEG_EXIT=1`)
  - **Root cause:** Packing `brain/**` and `ui/**` inside `app.asar` broke child-process reads, while naive HTTP smoke tests reported green on HTTP 404/500 pages.
  - **Fix:** Configure `asarUnpack: ["brain/**", "ui/**"]` + `brainPath()` helper and assert DOM/origin/title in smoke tests (`NEG_EXIT=1`).
- **CASE-106** `[http-auth]` · `class-pattern` · `status: compiled` · **Home:** `supervisor/server.js`, `apps/desktop/main.js`, `tools/api-smoke.sh`
  - **Root cause:** Local HTTP endpoints (`/api/wall`, `/api/live`, `/api/state`) listened on `0.0.0.0` without session cookies or CSRF headers, and plaintext fallback existed when `masterKey` was absent.
  - **Fix:** Default bind to `127.0.0.1` loopback (`--lan` opt-in), require `HttpOnly` cookie + `X-Fanal-CSRF: 1` (`401`/`403`), and fail closed without `masterKey`.
- **CASE-107** `[dsh-hooks]` · `class-pattern` · `status: compiled` · **Home:** `dual-brain-guard/src/core.mjs`, `test/dual-brain-guard.test.mjs`
  - **Root cause:** Quoted `--patch`/`--profile` strings bypassed `isRealDshAudit()`, and `\s*` inside negative lookahead `(?!\s*\/dev\/null\b)` introduced regex backtracking edge cases in shell tamper guards.
  - **Fix:** Replace naive substring regexes with shell-aware argument parsing and deterministic adversarial bypass tests.
- **CASE-108** `[sarif]` · `class-pattern` · `status: compiled` · **Home:** `tools/sarif_ingest.py`, `tools/run_sec_benchmark.py`
  - **Root cause:** Lossy SARIF tool-to-module hard-mapping plus synthetic `counts.major += 1` produced contradictory `REJECT` verdicts and `SEC-CRED-001` self-false-positives when scanning `validators/`.
  - **Fix:** Preserve native SARIF rule metadata, decouple missing-tool warnings from severity counts, and exclude validator fixtures from self-credential scans.

---

## Active Prose Cases (`status: prose` — candidates for Tier 2 compilation or `5 → 1` compaction)

- **CASE-109** `[dsh-quota]` · `vendor-quirk` · `status: prose` · **Home:** `agent-governance/jfranco-balance/`
  - **Root cause:** `402 ACCOUNT_QUOTA` (`Insufficient Balance`) interrupted long multi-turn runs mid-flight (`2` occurrences across 237 sessions), while `156,224` tokens were pruned via `compaction/prune`.
  - **Fix:** Monitor real-time balance and UTC off-peak discount windows (`16:30–00:30 UTC`) pre-flight via `jfranco-balance`.

---

## Open Symptoms Radar (`status: open` — unresolved mysteries indexed for future serendipity/transferability)

- **CASE-110** `[ledger-sync]` · `status: open` · **Observed:** Both `~/.dsh/dialogue.md` (`LAST_TURN: #28` declared vs `#40` actual) and `lsq-bridge/.dsh/dialogue.md` (`LAST_TURN: #6` declared vs `#48` actual) drifted out of sync when turns were appended in mixed heading formats (`### Turno #N` / `## Turn #N`).
  - **Hypotheses:** Manual or semi-automated turn appends update the tail of the ledger without atomically rewriting the top `LAST_TURN:` header field.
  - **Trigger to close:** Add a deterministic `verify-ledger-header` pre-commit check that parses all 4 historical turn heading formats and asserts `LAST_TURN == max(turn_id)`.

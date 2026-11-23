---
name: casebook
description: Bounded-entropy 4-tier constitutional memory system for AI coding agents. Use when recording resolved bugs as CASE-NNN precedents, logging unresolved anomalies in the Open Symptoms Radar, routing lessons by Transferability x Recurrence, compacting 5 similar cases into 1 test or skill, or auditing memory token bloat with verify-casebook.mjs.
---

# Casebook — 4-Tier Constitutional Agent Memory

Prevent AI agent rules from degrading into a bloated, high-entropy bureaucracy. Treat engineering memory like law + compiler engineering:

| Tier | Role | Loaded When | Entropy Guard |
| :--- | :--- | :--- | :--- |
| **Tier 0 — Constitution** | Universal invariants (`AGENTS.md`, global constitution) | Always | Hard token cap (`<= 1,500 tok` combined); **zero** vendor bugs or duplicates |
| **Tier 1 — Domain Skills** | Tool & craft codes (`.agents/skills/*/SKILL.md`) | Lazy-loaded on domain match (`0 tok` when idle) | Scoped strictly to one tool or craft |
| **Tier 2 — Compiled Law** | Executable tests, `assert`s, linters, CI guards, hooks | **`0 tokens` in prompt** (runs mechanically) | Preferred destination: once compiled, collapse prose to a 1-line pointer |
| **Tier 3 — Cold Case-Law & Open Symptoms Radar** | `docs/ENGINEERING_POSTMORTEMS.md` | **Never auto-loaded** — queried via `grep` on failure only | Structured `CASE-001..N` + YAML index (`tags`, `error_strings`) |

---

## Step 1: Route by Transferability (WHERE it lives — 3-question filter)

Ask in order:
1. **Does this disappear if I swap the vendor/library?** → **YES = `vendor-quirk`** → Tool Skill (Tier 1).
2. **Does it survive a vendor swap, but stay within one craft** (e.g., PyTorch/GPU, Android Release, SQL)? → **YES = `class-pattern`** → Craft Skill (Tier 1).
3. **Is it a universal law of math, physics, or computing** (e.g., compile != execute, never trust a flag name without reading its code, measure bytes/reality)? → **YES = `universal-invariant`** → Constitution (Tier 0, only if within token cap).

If all three are **NO**, you still have a **symptom**, not a root cause → log it in **`## Open Symptoms Radar` (`status: open`)** in Tier 3 so future projects can match it by `tag` or `error_string`.

---

## Step 2: Promote by Recurrence (WHEN it moves)

Count **distinct `CASE-NNN` incidents** (never raw matching lines):
- **`1×` incident:** Log as a 3-line `CASE-NNN` block in Tier 3 (`status: prose`). Costs `0 tokens` during normal work.
- **`2×` distinct incidents with the same mechanism:** Mandatory promotion → compile into an executable **Tier 2 test/assert/hook** (`status: compiled`, `0 tokens`) or a Tier 1 Skill section.
- **`5×` distinct incidents sharing a `tag`:** Mandatory **`5 → 1` Compaction** — merge into 1 Tier 2 test (preferred) or 1 Tier 1 Skill block, and collapse the 5 prose blocks to 1-line pointers.

---

## Step 3: Terminate Wittgenstein's Regress ("Reality Verifies the Rule")

Never add prose meta-rules to verify prose rules (infinite regress). Ground every `status: compiled` case in a **non-linguistic oracle**:
1. **Physical/runtime execution** (real interpreter, real GPU allocator, real build artifact).
2. **Differential oracle** (two independent substrates — e.g., summing checkpoint bytes on disk vs trusting a model label, comparing fp32 vs fp64 outputs numerically).
3. **Structural invariants** (`output.shape == input.shape` rather than hand-typed magic numbers).

---

## Step 4: Run the Verification Oracle

Run the bundled zero-dependency verifier against any repository:

```bash
node <path-to-plugin>/skills/casebook/scripts/verify-casebook.mjs --repo .
```

It validates:
- YAML front-matter index completeness (every tag used in `CASE-NNN` exists in front-matter `tags`).
- Distinct `CASE-NNN` incident counts (no duplicate IDs, no line-counting inflation).
- Recurrence triggers (`>= 2` distinct cases → promote to Tier 2; `>= 5` → compact `5 → 1`).
- Tier 0 token ceiling (`AGENTS.md <= 900 tok` target).
- Open Symptoms Radar inventory (`status: open`).

For new repositories, copy `templates/ENGINEERING_POSTMORTEMS.template.md` to `docs/ENGINEERING_POSTMORTEMS.md`.

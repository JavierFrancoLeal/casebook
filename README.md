# Casebook (`@franco/casebook`)

[![CI](https://github.com/JavierFrancoLeal/casebook/actions/workflows/ci.yml/badge.svg)](https://github.com/JavierFrancoLeal/casebook/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

**Bounded-entropy 4-tier constitutional memory for AI coding agents.**  
*By [Javier Franco](https://github.com/JavierFrancoLeal) · `v1.0.1` · Apache-2.0*

> **"The world verifies the verifier."** — *Reality verifies the rule.*  
> 📖 **Read the field-notes essay:** [Reality Verifies the Rule (Wan2.2, Android R8 & Wittgenstein)](./docs/ESSAY_REALITY_VERIFIES_THE_RULE.md)  
> 📚 **Cross-Project Precedents (`CASE-100..110`):** [Cold Case-Law Archive & Open Symptoms Radar](./docs/ENGINEERING_POSTMORTEMS.md)

![Casebook Oracle Terminal Demo](./assets/demo-terminal.svg)

---

## The Problem: Context Entropy & Agent Bureaucracy

Every time an AI coding agent hits a painful bug, the reflex is to append another paragraph to `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`. After 50 bugs, your always-loaded prompt becomes a heavy, contradictory bureaucratic filter — burning thousands of tokens per turn while agents still ignore buried prose.

**Casebook** solves this with a 4-tier architecture inspired by **constitutional jurisprudence** and **compiler design**:

| Tier | Legal Equivalent | Where It Lives | Daily Token Cost | Entropy Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0 — Constitution** | National Constitution | `AGENTS.md` / global constitution | Always loaded (**hard cap `<= 900 tok` repo / `<= 1,500 tok` total**) | Abstract universal invariants only. **Never** add vendor bugs here. |
| **Tier 1 — Domain Skills** | Penal / Commercial Code | `.agents/skills/<domain>/SKILL.md` | **Lazy-loaded** (`0 tok` when idle) | Scoped strictly to one tool or craft. |
| **Tier 2 — Compiled Law** | Physical lock / traffic light | Tests, `assert`s, linters, CI guards, hooks | **`0 tokens` in prompt** (100 % mechanical) | Preferred destination: once compiled to code, collapse prose to 1 line. |
| **Tier 3 — Cold Case-Law & Open Symptoms Radar** | Court Archive + Open Docket | `docs/ENGINEERING_POSTMORTEMS.md` | **Never auto-loaded** (`grep` on failure only) | Structured `CASE-001..N` with YAML `tags` + `error_strings` index. |

---

## Two Orthogonal Axes: Transferability × Recurrence

1. **Transferability decides WHERE a lesson lives (3-question filter):**
   - Disappears if you swap the vendor/library? → **`vendor-quirk`** → Tool Skill (Tier 1).
   - Survives vendor swap, stays within one craft? → **`class-pattern`** → Craft Skill (Tier 1).
   - Law of physics, math, or computing (e.g., *compile != execute*)? → **`universal-invariant`** → Constitution (Tier 0).
   - None of the above? You have a **symptom, not a root cause** → log it in **`## Open Symptoms Radar` (`status: open`)** so future projects can match it by `error_string` or `tag`.
2. **Recurrence decides WHEN a lesson promotes (distinct `CASE-NNN` count):**
   - **`1×` incident:** Stays cold in Tier 3 (`0 tok/turn`).
   - **`2×` distinct incidents:** Promote to an executable **Tier 2 test/assert/hook** (preferred) or Tier 1 Skill.
   - **`5×` distinct incidents on the same `tag`:** Mandatory **`5 → 1` Compaction**.

---

## Quick Start (1 Command, Zero Dependencies)

### Install as an Antigravity Plugin
```bash
git clone https://github.com/JavierFrancoLeal/casebook.git ~/.gemini/config/plugins/casebook
```

### Run the Verification Oracle in Any Repository (Node `>= 18`)
```bash
node ~/.gemini/config/plugins/casebook/skills/casebook/scripts/verify-casebook.mjs --repo .
```

### Run the Test Suite
```bash
npm test
```

---

## Open-Source Agent Governance Suite

| Repository | Role | Status |
| :--- | :--- | :--- |
| **[`casebook`](https://github.com/JavierFrancoLeal/casebook)** | Bounded-entropy 4-tier constitutional memory, Open Symptoms Radar & 5-to-1 compaction oracle | **`v1.0.1` Live** |
| **[`dual-brain-guard`](https://github.com/JavierFrancoLeal/dual-brain-guard)** | Harness-agnostic mechanical Proposer != Verifier cross-model guard (`CLI + MCP + hooks`) | **`v1.1.1` Live** |
| **[`autonomy-ladder`](https://github.com/JavierFrancoLeal/autonomy-ladder)** | Evidence-based Traffic-Light autonomy grader (`🟢 / ⚑ / 🟡 / 🔴` & `A/B/C/D` trust scores) | **`v1.0.2` Live** |
| **[`governed-browser`](https://github.com/JavierFrancoLeal/governed-browser)** | Constitutional commit-click brake (`🛑 RED` on Send/Pay/Delete) & SHA-256 hash-chained audit trail | **`v1.0.1` Live** |
| **[`forensic-contracts`](https://github.com/JavierFrancoLeal/forensic-contracts)** | 5-line `@forensic-contract` linter, `@blast-radius` cage enforcer & literal `sourcePin` verifier | **`v1.0.1` Live** |
| **[`agent-governance`](https://github.com/JavierFrancoLeal/agent-governance)** | Complete 26-plugin DeepSeek Harness governance suite (mother repository) | **`v1.0.0` Live** |
| **[`best-security-governance-architects`](https://github.com/JavierFrancoLeal/best-security-governance-architects)** | CPU-first pre-merge security & governance suite (`ECOSYSTEM_CONTRACT v1.2.0`) | **`v1.2.0` Live** |
| **[`best-ui-ux-designers`](https://github.com/JavierFrancoLeal/best-ui-ux-designers)** | Adversarial UI/UX design judgment suite — 12 Barbell design minds & 4 Via Negativa auditors | **`v1.2.0` Live** |
| **[`contrast-guard`](https://github.com/JavierFrancoLeal/contrast-guard)** | Zero-dependency WCAG 2.1 + perceptual CIELAB ΔE contrast & anti-camouflage auditor (CLI + headless Chrome CDP) | **`v1.0.0` Live** |

---

## License

Apache License 2.0 — see [LICENSE](./LICENSE).

# Reality Verifies the Rule: Bounded-Entropy Memory for AI Coding Agents

*Field notes from debugging a 17.27B video diffusion model, an Android R8 silent strip, and a buggy self-test — by [Javier Franco](https://github.com/JavierFrancoLeal).*

---

## 1. The Context-Entropy Trap

Every team building with AI coding agents discovers the same trap around week three.

Your agent hits a nasty production bug. You fix it, and to make sure it never happens again, you append a paragraph to `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`. Two weeks later you hit ten more bugs — ten more paragraphs. Three months later your always-loaded system prompt has mutated into a **5,000-token bureaucratic constitution** full of vendor quirks, outdated workarounds, and contradictory instructions.

Worse: **the longer the rule file gets, the less reliably the agent obeys it.** You are paying a permanent token tax on every single turn for prose that silently rots.

We hit this exact wall while shipping a mobile + GPU video pipeline (`Expo / React Native` on Android + `Wan2.2-Animate-14B` on Colab A100 GPUs). Our postmortem log hit `21.4 KB` (~`5,360 tokens`) — **6.6× larger than our global constitution** — and vendor-specific patches were already leaking into `AGENTS.md`.

---

## 2. Three Real Failures That Broke Our Naive Rule System

### Failure A — The "14B" model that was actually `17.27B` (`32.18 GiB`)
Our GPU notebook passed `--offload_model True --t5_cpu` and hit a `CUDA out of memory` crash on an A100-40GB (`39.49 GiB`). Even with two AI models reviewing the diff together, **both models missed it** because both shared the exact same untested priors:
1. We trusted the marketing name `"14B"` (assuming `~28 GB` in `bf16`). Summing the actual 4 safetensors shards on disk revealed **`34,549,785,168 bytes = 17.27B params = 32.18 GiB`**.
2. We trusted the CLI flag name `--offload_model True`. Reading upstream `wan/animate.py` revealed it only offloaded T5 (a complete no-op when `--t5_cpu` was set), leaving the `32.18 GiB` DiT, `2.22 GiB` CLIP, and `0.47 GiB` VAE all resident during diffusion (`38.49 GiB` total), where `rope_apply` cast `q`/`k` to `float64`/`complex128` (`~3.7 GiB` transient) and crashed.

**Lesson:** Redundancy is not independence. Two LLMs reviewing prose with the same assumptions share correlated blind spots.

### Failure B — Waist-up `--retarget_flag` phantom limbs (`retarget_pose.py:446`)
Enabling `--retarget_flag` on waist-up sign-language videos caused `Wan2.2` to hallucinate wooden lecterns and podiums right at the avatar's waist. Reading `retarget_pose.py` showed why: it shrank the upper-body skeleton by ~25 %, anchored `half_body` translation at the neck (lines `741–751`), and synthesized missing distal joints straight downward as `[keypoint1_x, keypoint1_y + ref_length/H]` (line `446`). Disabling `--retarget_flag` eliminated 100 % of the hallucinations immediately.

**Lesson:** That quirk dies the day you switch away from `Wan2.2`. Putting it in a global `AGENTS.md` pollutes every unrelated web or mobile project forever.

### Failure C — Living Wittgenstein's Paradox in real time
After patching `rope_apply` from `float64` to `float32`, we added a 1-second CUDA self-test to verify our own patch:
```python
_rq = torch.randn(1, 64, 40, 128, device='cuda', dtype=torch.bfloat16)
_ro = rope_apply(_rq, _gs, _fr)
assert _ro.shape == (1, 64, 5120) and _ro.dtype == torch.float32
```
The patch was right — **the verifier itself was wrong.** `rope_apply` returns 4D `(1, 64, 40, 128)`, not flattened 3D `(1, 64, 5120)`.

That is **Wittgenstein's Rule-Following Paradox** (*Philosophical Investigations* §§185–242) in pure software form: *who verifies the verifier?* If you add a prose meta-rule to check a prose rule, you get infinite regress.

---

## 3. The Solution: Constitutional Jurisprudence + Non-Linguistic Oracles

Instead of one flat rule file, **Casebook** splits agent memory into **4 entropy-bounded tiers**:

1. **Tier 0 — Constitution (`AGENTS.md`, hard cap `<= 900 tok`):** Universal invariants only (*compile != execute*, *never trust a CLI flag name without reading its code*). Zero vendor quirks.
2. **Tier 1 — Domain Skills (lazy-loaded, `0 tok` when idle):** Scoped strictly to one tool or craft (e.g., `wan22`, `eas-android-release-debug`).
3. **Tier 2 — Compiled Law (`0 tokens` in prompt, 100 % mechanical):** Executable tests, `assert`s, linters, ProGuard rules, and CI hooks. Once a bug is compiled into a test that fails by itself, **delete the prose rule.**
4. **Tier 3 — Cold Case-Law Archive & Open Symptoms Radar (`docs/ENGINEERING_POSTMORTEMS.md`):** Never auto-loaded; queried via `grep` on failure only.

### Two Orthogonal Routing Axes: `Transferability × Recurrence`
- **Transferability decides WHERE a lesson lives** (3-question filter):
  1. Disappears if you swap the vendor? → **`vendor-quirk`** (Tool Skill, Tier 1).
  2. Survives vendor swap, stays within one craft? → **`class-pattern`** (Craft Skill, Tier 1).
  3. Law of physics, math, or computing? → **`universal-invariant`** (Constitution, Tier 0).
  4. None of the above? You have a **symptom, not a root cause** → log it in **`## Open Symptoms Radar` (`status: open`)** so a future project can match it by `error_string` or `tag`.
- **Recurrence decides WHEN a lesson promotes** (counting distinct `CASE-NNN` IDs, never raw lines):
  - **`1×`** → stays cold in Tier 3 (`0 tok/turn`).
  - **`2×` distinct incidents** → mandatory promotion to an executable Tier 2 test or Tier 1 Skill.
  - **`5×` distinct incidents on the same tag** → mandatory **`5 → 1` Compaction**.

### Terminating Wittgenstein's Regress
**The world verifies the verifier.** You stop infinite regress by changing substrate — never placing two layers of prose back-to-back:
- **Physical execution:** CUDA's allocator does not read your Markdown; bytes either fit or throw.
- **Differential oracles:** sum `safetensors` bytes on disk instead of trusting a `"14B"` label; compare `fp32` vs `fp64` outputs numerically instead of guessing.
- **Structural invariants:** assert `output.shape == input.shape`, never a hand-typed magic constant like `5120`.

---

## 4. Measured Impact

Migrating our own production repository to Casebook dropped:
- Always-loaded `AGENTS.md`: **`5,087 B → 1,948 B` (`509 tokens` verified `cl100k`, `-62 %`)** with zero duplication against global rules.
- Cold `ENGINEERING_POSTMORTEMS.md`: **`21,440 B → 11,210 B` (`-48 %`)**, flat `CASE-001..018` + `CASE-019` (`status: open`), validated automatically by `verify-casebook.mjs`.

Try it on your own repository in 5 seconds:
```bash
git clone https://github.com/JavierFrancoLeal/casebook.git
node casebook/skills/casebook/scripts/verify-casebook.mjs --repo /path/to/your-repo
```

---

*Part 1 of the Open-Source Agent Engineering Trilogy by Javier Franco: **[`casebook`](https://github.com/JavierFrancoLeal/casebook)** (memory) · `dual-brain-guard` (cross-model enforcement) · `autonomy-ladder` (evidence-based autonomy).*

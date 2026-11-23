#!/usr/bin/env node
/**
 * Casebook Verification Oracle (zero external dependencies)
 * Validates 4-tier bounded-entropy memory integrity in any repository:
 *  - Tier 0 token ceiling (AGENTS.md)
 *  - Tier 3 YAML front-matter tag index completeness
 *  - Distinct CASE-NNN incident deduplication & recurrence triggers (2x promote / 5x compact)
 *  - Open Symptoms Radar inventory (status: open)
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let rawRepo = process.cwd();
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo' && args[i + 1]) {
    rawRepo = args[i + 1];
    break;
  }
  if (args[i].startsWith('--repo=')) {
    rawRepo = args[i].slice('--repo='.length);
    break;
  }
}
const repoRoot = path.resolve(rawRepo);
if (!fs.existsSync(repoRoot) || !fs.statSync(repoRoot).isDirectory()) {
  console.error(`Casebook Oracle — error: repository directory does not exist: ${repoRoot}`);
  process.exit(1);
}
const agentsPath = path.join(repoRoot, 'AGENTS.md');
const pmPath = path.join(repoRoot, 'docs', 'ENGINEERING_POSTMORTEMS.md');
const maxTier0Tokens = 900;

const approxTokens = (str) => Math.ceil(Buffer.byteLength(str, 'utf8') / 4);
const failures = [];
const warnings = [];

console.log(`Casebook Oracle — auditing: ${repoRoot}\n`);

// 1. Tier 0 check (AGENTS.md)
if (fs.existsSync(agentsPath)) {
  const agentsText = fs.readFileSync(agentsPath, 'utf8');
  const tok = approxTokens(agentsText);
  const status = tok <= maxTier0Tokens ? 'OK' : 'WARN';
  console.log(`[Tier 0] AGENTS.md: ~${tok} tok (budget <= ${maxTier0Tokens} tok) [${status}]`);
  if (tok > maxTier0Tokens) {
    warnings.push(`AGENTS.md (~${tok} tok) exceeds Tier-0 budget (${maxTier0Tokens} tok). Move case-law to Tier 1/3.`);
  }
} else {
  console.log('[Tier 0] AGENTS.md: not present');
}

// 2. Tier 3 check (docs/ENGINEERING_POSTMORTEMS.md)
if (!fs.existsSync(pmPath)) {
  console.log('[Tier 3] docs/ENGINEERING_POSTMORTEMS.md: not found (nothing to audit).');
  process.exit(0);
}

const pmText = fs.readFileSync(pmPath, 'utf8');
const fmMatch = pmText.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  failures.push('Missing YAML front-matter index at top of docs/ENGINEERING_POSTMORTEMS.md');
}

const frontMatterTags = new Set();
if (fmMatch) {
  let inTags = false;
  for (const line of fmMatch[1].split('\n')) {
    if (/^tags:\s*$/.test(line)) {
      inTags = true;
      continue;
    }
    if (inTags) {
      const m = line.match(/^\s+-\s+([a-z0-9-]+)\s*$/);
      if (m) {
        frontMatterTags.add(m[1]);
      } else if (/^\S/.test(line)) {
        inTags = false;
      }
    }
  }
}

// Parse distinct CASE-NNN headers (strip HTML comments first; never count raw matching lines!)
const caseHeaderRe = /^- \*\*(CASE-\d{3})\*\*\s+`\[([^\]]+)\]`(?:\s+·\s+`([^`]+)`)?\s+·\s+`status:\s*(compiled|prose|open)`/;
const malformedCaseRe = /^- \*\*(case-\d+|CASE-(?!\d{3}\*\*)\d+)\*\*/;
const seenIds = new Set();
const tagToDistinctCases = new Map();
const counts = { compiled: 0, prose: 0, open: 0 };
const uncommentedPmText = pmText.replace(/<!--[\s\S]*?-->/g, '');

for (const line of uncommentedPmText.split('\n')) {
  const bad = line.match(malformedCaseRe);
  if (bad) {
    failures.push(`Malformed case ID "${bad[1]}" (must match 3-digit CASE-NNN, e.g., CASE-001)`);
    continue;
  }
  const m = line.match(caseHeaderRe);
  if (!m) continue;
  const [, id, rawTags, , status] = m;
  if (seenIds.has(id)) {
    failures.push(`Duplicate case ID detected: ${id}`);
    continue;
  }
  seenIds.add(id);
  counts[status] += 1;

  const tags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
  for (const tag of tags) {
    if (fmMatch && !frontMatterTags.has(tag)) {
      failures.push(`Tag "${tag}" used in ${id} is missing from YAML front-matter tags index`);
    }
    if (!tagToDistinctCases.has(tag)) tagToDistinctCases.set(tag, new Set());
    tagToDistinctCases.get(tag).add(id);
  }
}

console.log(`[Tier 3] ENGINEERING_POSTMORTEMS.md: ~${approxTokens(pmText)} tok (cold, 0 tok/turn)`);
console.log(`         Distinct cases: ${seenIds.size} total (${counts.compiled} compiled | ${counts.prose} prose | ${counts.open} open symptoms)\n`);

// 3. Recurrence matrix (distinct incidents per tag)
console.log('[Recurrence Matrix — Distinct CASE-NNN per tag]');
for (const [tag, ids] of [...tagToDistinctCases.entries()].sort((a, b) => b[1].size - a[1].size)) {
  const n = ids.size;
  const action = n >= 5 ? 'COMPACT 5->1 (Tier 2/1)' : n >= 2 ? 'PROMOTE CANDIDATE (2x)' : 'COLD (1x)';
  console.log(`  - ${tag.padEnd(20)} ${String(n).padStart(2)} distinct cases (${[...ids].join(', ')}) -> ${action}`);
}

if (warnings.length > 0) {
  console.log('\nWARNINGS:');
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (failures.length > 0) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  x ${f}`);
  process.exit(1);
}

console.log('\nCASEBOOK ORACLE: PASS');

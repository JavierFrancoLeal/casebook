import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO_ROOT, 'skills', 'casebook', 'scripts', 'verify-casebook.mjs');
const TEMPLATE = path.join(REPO_ROOT, 'skills', 'casebook', 'templates', 'ENGINEERING_POSTMORTEMS.template.md');

function runOracle(repoDir) {
  return spawnSync(process.execPath, [SCRIPT, '--repo', repoDir], { encoding: 'utf8' });
}

function makeTempRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'casebook-test-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
  return dir;
}

test('1. Pristine template strips HTML comments and reports 0 distinct cases (PASS)', () => {
  const dir = makeTempRepo({
    'docs/ENGINEERING_POSTMORTEMS.md': fs.readFileSync(TEMPLATE, 'utf8'),
  });
  try {
    const res = runOracle(dir);
    assert.equal(res.status, 0, res.stderr || res.stdout);
    assert.match(res.stdout, /Distinct cases: 0 total \(0 compiled \| 0 prose \| 0 open symptoms\)/);
    assert.match(res.stdout, /CASEBOOK ORACLE: PASS/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('2. Valid multi-case archive detects 2x promote and 5x compact triggers accurately', () => {
  const md = `---
tier: 3
schema: case-law-v1
tags:
  - gpu-oom
  - android-r8
---

## Compiled
- **CASE-001** \`[gpu-oom]\` · \`vendor-quirk\` · \`status: compiled\` · **Home:** \`test.py\`
- **CASE-002** \`[gpu-oom]\` · \`vendor-quirk\` · \`status: compiled\` · **Home:** \`test.py\`
- **CASE-003** \`[gpu-oom]\` · \`class-pattern\` · \`status: prose\` · **Home:** \`skill.md\`
- **CASE-004** \`[gpu-oom]\` · \`class-pattern\` · \`status: prose\` · **Home:** \`skill.md\`
- **CASE-005** \`[gpu-oom]\` · \`class-pattern\` · \`status: prose\` · **Home:** \`skill.md\`
- **CASE-006** \`[android-r8]\` · \`class-pattern\` · \`status: compiled\` · **Home:** \`proguard.js\`
- **CASE-007** \`[android-r8]\` · \`status: open\` · **Observed:** Intermittent strip
`;
  const dir = makeTempRepo({
    'AGENTS.md': '# Project Constitution\n\nKeep it concise.\n',
    'docs/ENGINEERING_POSTMORTEMS.md': md,
  });
  try {
    const res = runOracle(dir);
    assert.equal(res.status, 0, res.stderr || res.stdout);
    assert.match(res.stdout, /Distinct cases: 7 total \(3 compiled \| 3 prose \| 1 open symptoms\)/);
    assert.match(res.stdout, /gpu-oom\s+5 distinct cases .* -> COMPACT 5->1/);
    assert.match(res.stdout, /android-r8\s+2 distinct cases .* -> PROMOTE CANDIDATE \(2x\)/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('3. Duplicate CASE-NNN fails with exit 1 and does NOT inflate status tallies', () => {
  const md = `---
tier: 3
tags:
  - gpu-oom
---

- **CASE-001** \`[gpu-oom]\` · \`vendor-quirk\` · \`status: compiled\`
- **CASE-001** \`[gpu-oom]\` · \`vendor-quirk\` · \`status: prose\`
`;
  const dir = makeTempRepo({ 'docs/ENGINEERING_POSTMORTEMS.md': md });
  try {
    const res = runOracle(dir);
    assert.equal(res.status, 1);
    assert.match(res.stdout, /Duplicate case ID detected: CASE-001/);
    assert.match(res.stdout, /Distinct cases: 1 total \(1 compiled \| 0 prose \| 0 open symptoms\)/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('4. Undeclared tag missing from YAML front-matter fails with exit 1', () => {
  const md = `---
tier: 3
tags:
  - gpu-oom
---

- **CASE-001** \`[unindexed-tag]\` · \`vendor-quirk\` · \`status: prose\`
`;
  const dir = makeTempRepo({ 'docs/ENGINEERING_POSTMORTEMS.md': md });
  try {
    const res = runOracle(dir);
    assert.equal(res.status, 1);
    assert.match(res.stdout, /Tag "unindexed-tag" used in CASE-001 is missing from YAML front-matter tags index/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('5. Bloated Tier-0 AGENTS.md (>900 tok) emits explicit entropy warning', () => {
  const bloated = '# Bloated Rules\n' + '- Never repeat bug X with verbose prose.\n'.repeat(120);
  const dir = makeTempRepo({
    'AGENTS.md': bloated,
    'docs/ENGINEERING_POSTMORTEMS.md': fs.readFileSync(TEMPLATE, 'utf8'),
  });
  try {
    const res = runOracle(dir);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /exceeds Tier-0 budget/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('6. Hardening: --repo=<path> syntax works, nonexistent repo fails with exit 1, and malformed CASE IDs are rejected', () => {
  const missing = spawnSync(process.execPath, [SCRIPT, '--repo=/nonexistent/casebook-path'], { encoding: 'utf8' });
  assert.equal(missing.status, 1);

  const md = `---
tier: 3
tags:
  - gpu-oom
---

- **CASE-1** \`[gpu-oom]\` · \`vendor-quirk\` · \`status: prose\`
`;
  const dir = makeTempRepo({ 'docs/ENGINEERING_POSTMORTEMS.md': md });
  try {
    const res = spawnSync(process.execPath, [SCRIPT, `--repo=${dir}`], { encoding: 'utf8' });
    assert.equal(res.status, 1);
    assert.match(res.stdout, /Malformed case ID "CASE-1"/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

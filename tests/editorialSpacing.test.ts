import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('keeps the hero lines compact and opens Selected Work as a left-aligned editorial stage', () => {
  const page = readFileSync('src/pages/index.astro', 'utf8');

  assert.match(page, /\.reveal-line \{[^}]*margin-bottom: -0\.1em;/);
  assert.match(page, /\.section-heading \{[^}]*display: block;/);
  assert.match(page, /\.section-heading h2 \{[^}]*margin: 1\.5rem 0 0;/);
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('keeps the hero lines compact and aligns the work heading closer to its label', () => {
  const page = readFileSync('src/pages/index.astro', 'utf8');

  assert.match(page, /\.reveal-line \{[^}]*margin-bottom: -0\.1em;/);
  assert.match(page, /\.section-heading \{[^}]*grid-template-columns: 1fr 2\.4fr;/);
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('declares aescentwebstudios.com as the canonical public website', () => {
  const config = readFileSync('astro.config.mjs', 'utf8');
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');

  assert.match(config, /site:\s*'https:\/\/aescentwebstudios\.com'/);
  assert.match(layout, /rel="canonical"/);
  assert.match(layout, /property="og:url"/);
});

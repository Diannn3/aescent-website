import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('keeps hero actions inside short desktop viewports', () => {
  const page = readFileSync('src/pages/index.astro', 'utf8');

  assert.match(page, /\.hero-copy h1 \{[^}]*\/\.84 var\(--font-display\)/);
  assert.match(page, /@media \(min-width: 48\.0625rem\) and \(max-height: 62rem\)/);
  assert.match(page, /\.hero-copy h1 \{ font-size: clamp\(3\.8rem, 5\.5vw, 6\.8rem\); \}/);
  assert.match(page, /\.hero-copy \{ transform: translateY\(-2rem\); \}/);
});

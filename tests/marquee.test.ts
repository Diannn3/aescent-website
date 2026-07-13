import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync('src/pages/index.astro', 'utf8');

test('duplicates a viewport-wide marquee group for a seamless loop', () => {
  const groups = [...page.matchAll(/<div class="marquee-group">([\s\S]*?)<\/div>/g)];
  const terms = ['Strategy', 'Structure', 'Restraint', 'Clarity', 'Trust', 'Conversion'];

  assert.equal(groups.length, 2);
  assert.equal(groups[0][1], groups[1][1]);
  assert.equal((groups[0][1].match(/<span>/g) ?? []).length, terms.length);
  for (const term of terms) {
    assert.match(groups[0][1], new RegExp(`<span>${term} `));
  }
  assert.match(page, /\.marquee-group \{[^}]*min-width: 100vw/);
});

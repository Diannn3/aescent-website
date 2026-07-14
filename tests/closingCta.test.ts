import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('sends the final call to action to Aescent Facebook', () => {
  const page = readFileSync('src/pages/index.astro', 'utf8');

  assert.match(
    page,
    /href="https:\/\/www\.facebook\.com\/aescentweb"[^>]*>Begin a Project/,
  );
});

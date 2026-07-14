import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('publishes the approved privacy notice and terms with homepage links', () => {
  assert.ok(existsSync('src/pages/privacy.astro'), 'privacy route is missing');
  assert.ok(existsSync('src/pages/terms.astro'), 'terms route is missing');

  const homepage = readFileSync('src/pages/index.astro', 'utf8');
  const privacy = readFileSync('src/pages/privacy.astro', 'utf8');
  const terms = readFileSync('src/pages/terms.astro', 'utf8');

  assert.match(homepage, /href="\/privacy"[^>]*>Privacy Notice</);
  assert.match(homepage, /href="\/terms"[^>]*>Terms of Use</);
  assert.match(privacy, /<h1>Privacy Notice<\/h1>/);
  assert.match(privacy, /Data Privacy Act of 2012/);
  assert.match(privacy, /dian\.aescentweb@gmail\.com/);
  assert.match(terms, /<h1>Terms of Use<\/h1>/);
  assert.match(terms, /Project-estimator ranges are indicative only/);
  assert.match(terms, /laws of the Republic of the Philippines/);
});

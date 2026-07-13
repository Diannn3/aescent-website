import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('flows from the estimator directly into the contact section without a footer block', () => {
  const page = readFileSync('src/pages/index.astro', 'utf8');
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');

  assert.ok(page.indexOf('<ProjectEstimator />') < page.indexOf('<section id="contact"'));
  assert.equal(page.includes('<footer class="site-footer">'), false);
  assert.equal(layout.includes('.site-footer'), false);
});

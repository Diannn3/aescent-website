import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('hero section contains updated conversion-focused content', () => {
  const page = readFileSync('src/pages/index.astro', 'utf8');

  // Exact headline
  assert.ok(page.includes('Websites built'), 'Missing headline line 1');
  assert.ok(page.includes('to make local businesses'), 'Missing headline line 2');
  assert.ok(page.includes('look established.'), 'Missing headline line 3');

  // Supporting copy
  assert.ok(
    page.includes('Aescent designs fast, mobile-first websites for clinics and service businesses in Laguna—built to earn trust and turn online visitors into enquiries.'),
    'Missing supporting copy'
  );

  // Trust line
  assert.ok(
    page.includes('Laguna-based &middot; Clear scope &middot; Client-owned.'),
    'Missing trust line'
  );

  // CTA button labels and destinations
  assert.ok(page.includes('Get a Project Estimate &rarr;'), 'Missing primary CTA label');
  assert.ok(page.includes('href="#estimator" class="button-primary"'), 'Missing primary CTA destination');

  assert.ok(page.includes('View Selected Work &rarr;'), 'Missing secondary CTA label');
  assert.ok(page.includes('href="#work" class="button-secondary"'), 'Missing secondary CTA destination');
});

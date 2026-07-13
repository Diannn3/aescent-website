import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('renders a two-second skeleton loading screen before the page is revealed', () => {
  const scriptPath = 'src/scripts/loadingScreen.ts';
  const layout = readFileSync('src/layouts/Layout.astro', 'utf8');

  assert.equal(existsSync(scriptPath), true);

  const script = readFileSync(scriptPath, 'utf8');
  assert.match(script, /export const LOADING_SCREEN_DURATION = 2000/);
  assert.match(script, /setTimeout\(reveal, LOADING_SCREEN_DURATION\)/);
  assert.match(layout, /data-loading-screen/);
  assert.match(layout, /initLoadingScreen\(\)/);
});

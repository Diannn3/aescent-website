import assert from 'node:assert/strict';
import test from 'node:test';

import { canProgrammaticallyNavigate, clampProgress, resolveActiveChapter, shouldSyncActive } from '../src/scripts/chapterNavigation.ts';

test('selects the chapter containing the viewport focus line', () => {
  const active = resolveActiveChapter([
    { id: 'philosophy', top: -480, bottom: 320 },
    { id: 'work', top: 320, bottom: 1240 },
  ], 300, 'down');

  assert.equal(active, 'philosophy');
});

test('uses the closest chapter when no section contains the focus line', () => {
  const active = resolveActiveChapter([
    { id: 'philosophy', top: -900, bottom: -200 },
    { id: 'work', top: 120, bottom: 860 },
  ], 0, 'down');

  assert.equal(active, 'work');
});

test('uses scroll direction only to resolve an equal-distance chapter tie', () => {
  const chapters = [
    { id: 'philosophy', top: -240, bottom: -40 },
    { id: 'work', top: 40, bottom: 240 },
  ];

  assert.equal(resolveActiveChapter(chapters, 0, 'down'), 'work');
  assert.equal(resolveActiveChapter(chapters, 0, 'up'), 'philosophy');
});

test('clamps page progress to the available scroll range', () => {
  assert.equal(clampProgress(-50, 1000, 500), 0);
  assert.equal(clampProgress(250, 1000, 500), 0.5);
  assert.equal(clampProgress(900, 1000, 500), 1);
  assert.equal(clampProgress(250, 500, 500), 0);
});

test('synchronizes the initial empty chapter state before comparing later updates', () => {
  assert.equal(shouldSyncActive(undefined, undefined, false), true);
  assert.equal(shouldSyncActive(undefined, undefined, true), false);
  assert.equal(shouldSyncActive(undefined, 'philosophy', true), true);
});

test('keeps desktop chapter clicks programmatic when Lenis is unavailable', () => {
  assert.equal(canProgrammaticallyNavigate(true, false, false), true);
  assert.equal(canProgrammaticallyNavigate(false, false, false), false);
  assert.equal(canProgrammaticallyNavigate(true, true, false), false);
  assert.equal(canProgrammaticallyNavigate(true, false, true), false);
});

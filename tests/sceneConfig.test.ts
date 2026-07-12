import assert from 'node:assert/strict';
import test from 'node:test';

import { requiresSceneRefresh, resolveSceneQuality, sampleSceneState } from '../src/components/hero/sceneConfig.ts';

test('selects static, mobile, and desktop scene qualities', () => {
  assert.equal(resolveSceneQuality(1440, true), 'static');
  assert.equal(resolveSceneQuality(390, false), 'mobile');
  assert.equal(resolveSceneQuality(768, false), 'mobile');
  assert.equal(resolveSceneQuality(769, false), 'desktop');
});

test('clamps scene progress to the authored camera path', () => {
  assert.deepEqual(sampleSceneState(-1), sampleSceneState(0));
  assert.deepEqual(sampleSceneState(2), sampleSceneState(1));
});

test('opens the threshold only after the structure reveals its depth', () => {
  const elevation = sampleSceneState(0);
  const reveal = sampleSceneState(0.4);
  const passage = sampleSceneState(0.8);

  assert.equal(elevation.gateOpen, 0);
  assert.ok(reveal.spread > elevation.spread);
  assert.ok(passage.gateOpen > reveal.gateOpen);
  assert.ok(passage.camera[2] < elevation.camera[2]);
});

test('requests a new frame when responsive quality changes', () => {
  assert.equal(requiresSceneRefresh('static', 'mobile'), true);
  assert.equal(requiresSceneRefresh('mobile', 'desktop'), true);
  assert.equal(requiresSceneRefresh('desktop', 'desktop'), false);
});

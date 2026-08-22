import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('builds Selected Work as a dedicated finite gallery island', () => {
  assert.equal(existsSync('src/components/work/SelectedWorkGallery.tsx'), true);
  assert.equal(existsSync('src/data/selectedWork.ts'), true);

  const page = readFileSync('src/pages/index.astro', 'utf8');
  const packageManifest = readFileSync('package.json', 'utf8');

  assert.match(page, /<SelectedWorkGallery client:visible/);
  assert.doesNotMatch(page, /class="blueprint-ledger"/);
  assert.match(packageManifest, /"embla-carousel-react"/);
});

test('keeps two approved projects finite and truthfully classified', () => {
  assert.equal(existsSync('src/data/selectedWork.ts'), true);
  if (!existsSync('src/data/selectedWork.ts')) return;

  const data = readFileSync('src/data/selectedWork.ts', 'utf8');

  assert.match(data, /statusLabel:\s*'Concept Study \/ Dental'/);
  assert.match(data, /statusLabel:\s*'Studio Venture \/ Food & Beverage'/);
  assert.match(data, /https:\/\/dental\.aescentwebstudios\.com/);
  assert.doesNotMatch(data, /laguna-smiles-demo\.vercel\.app/);
  assert.doesNotMatch(data, /E-commerce/);
});

#!/usr/bin/env node
// Robust TS→JS converter without relying on cwd quirks.
// Run via `npm run convert` from project root.
// After running, you may remove the dev-deps (@babel/core @babel/preset-typescript).
import { promises as fs } from 'fs';
import path from 'path';
import { transformAsync } from '@babel/core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const tsExtensions = ['.ts', '.tsx'];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(fullPath));
    } else if (tsExtensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertFile(filePath) {
  const code = await fs.readFile(filePath, 'utf8');
  const isTSX = filePath.endsWith('.tsx');
  const { code: output } = await transformAsync(code, {
    presets: [['@babel/preset-typescript', { isTSX, allExtensions: true, allowDeclareFields: true }]],
    filename: filePath,
    retainLines: true,
  });
  const newExt = isTSX ? '.jsx' : '.js';
  const newPath = filePath.replace(/\.tsx?$/, newExt);
  await fs.writeFile(newPath, output, 'utf8');
  await fs.unlink(filePath);
  console.log(`✓ ${path.relative(PROJECT_ROOT, newPath)}`);
}

async function run() {
  const tsFiles = await walk(PROJECT_ROOT);
  if (tsFiles.length === 0) {
    console.log('No .ts / .tsx files found.');
  } else {
    console.log(`Converting ${tsFiles.length} TypeScript files...`);
    for (const f of tsFiles) {
      await convertFile(f);
    }
  }
  // Tailwind config
  const tailwindTs = path.join(PROJECT_ROOT, 'tailwind.config.ts');
  const tailwindJs = path.join(PROJECT_ROOT, 'tailwind.config.js');
  try {
    await fs.access(tailwindTs);
    const content = await fs.readFile(tailwindTs, 'utf8');
    await fs.writeFile(tailwindJs, content.replace(/^export default /, 'module.exports = '), 'utf8');
    await fs.unlink(tailwindTs);
    console.log('✓ tailwind.config.js created');
  } catch {}

  // Remove TS config artifacts
  for (const relic of ['tsconfig.json', 'next-env.d.ts', '.bolt']) {
    try {
      const p = path.join(PROJECT_ROOT, relic);
      await fs.rm(p, { recursive: true, force: true });
      console.log(`✓ Removed ${relic}`);
    } catch {}
  }
  console.log('\nConversion complete. You may now uninstall @babel/core @babel/preset-typescript.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

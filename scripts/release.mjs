#!/usr/bin/env node
// Versiones de la app y sus notificaciones de novedades (RULES.md §10).
//   node scripts/release.mjs bump 1.1.0   sube la versión y deja lista su entrada de novedades
//   node scripts/release.mjs check [--base origin/main]   falla si la versión no está documentada
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const PACKAGE_PATH = 'package.json';
const RELEASES_PATH = 'src/static/releases.ts';
const TEXTS_PATH = 'src/static/texts/es.json';
const NEXT_MARKER = '// release:next';
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, data) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
const versionKey = (version) => `v${version.replaceAll('.', '_')}`;

function compareVersions(first, second) {
  const [a, b] = [first, second].map((version) => version.match(SEMVER).slice(1).map(Number));
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function bump(version) {
  if (!SEMVER.test(version ?? '')) fail('Indica la versión nueva, por ejemplo: yarn release:bump 1.1.0');
  const packageJson = readJson(PACKAGE_PATH);
  if (compareVersions(version, packageJson.version) <= 0) {
    fail(`La versión ${version} tiene que ser mayor que la actual (${packageJson.version}).`);
  }

  const releases = readFileSync(RELEASES_PATH, 'utf8');
  if (!releases.includes(NEXT_MARKER)) fail(`No encuentro "${NEXT_MARKER}" en ${RELEASES_PATH}.`);
  const today = new Date().toISOString().slice(0, 10);
  const key = versionKey(version);
  const entry = [
    `  {`,
    `    version: '${version}',`,
    `    publishedAt: '${today}T12:00:00Z',`,
    `    changes: [`,
    `      // feature('${key}.clave'), improvement('${key}.clave'), fix('${key}.clave'),`,
    `    ],`,
    `  },`,
  ].join('\n');
  writeFileSync(
    RELEASES_PATH,
    releases.replace(/^(\s*\/\/ release:next.*)$/m, (marker) => `${marker}\n${entry}`),
    'utf8',
  );

  const texts = readJson(TEXTS_PATH);
  texts.notifications.releases[key] = {};
  writeJson(TEXTS_PATH, texts);

  packageJson.version = version;
  writeJson(PACKAGE_PATH, packageJson);

  console.log(`✔ Versión ${version} preparada. Falta:`);
  console.log(`  1. Agregar los cambios en ${RELEASES_PATH} (feature, improvement o fix con su clave).`);
  console.log(`  2. Su título y descripción en ${TEXTS_PATH} → notifications.releases.${key}.`);
  console.log('  3. yarn release:check');
}

function check(baseRef) {
  const { version } = readJson(PACKAGE_PATH);
  const releases = readFileSync(RELEASES_PATH, 'utf8');
  const latest = releases.slice(releases.indexOf(NEXT_MARKER)).match(/version: '([^']+)'/)?.[1];
  if (latest !== version) {
    fail(`package.json dice ${version} pero la última versión en ${RELEASES_PATH} es ${latest ?? 'ninguna'}. Corre yarn release:bump.`);
  }

  const key = versionKey(version);
  const blockStart = releases.indexOf(`version: '${version}'`);
  const block = releases.slice(blockStart, releases.indexOf('],', blockStart));
  const itemKeys = [...block.matchAll(/^\s*(?:feature|improvement|fix)\('([^']+)'\)/gm)].map(
    (match) => match[1],
  );
  if (itemKeys.length === 0) fail(`La versión ${version} no tiene cambios en ${RELEASES_PATH}.`);

  const texts = readJson(TEXTS_PATH).notifications?.releases ?? {};
  for (const itemKey of itemKeys) {
    const [releaseKey, changeKey] = itemKey.split('.');
    const change = texts[releaseKey]?.[changeKey];
    if (releaseKey !== key || !change?.title?.trim() || !change?.description?.trim()) {
      fail(`Falta el título o la descripción de "${itemKey}" en ${TEXTS_PATH} (notifications.releases).`);
    }
  }

  if (baseRef) {
    let baseVersion;
    try {
      baseVersion = JSON.parse(execFileSync('git', ['show', `${baseRef}:${PACKAGE_PATH}`], { encoding: 'utf8' })).version;
    } catch {
      fail(`No pude leer la versión de ${baseRef}. ¿Hiciste git fetch?`);
    }
    if (compareVersions(version, baseVersion) <= 0) {
      fail(`La versión ${version} tiene que ser mayor que la de ${baseRef} (${baseVersion}). Corre yarn release:bump.`);
    }
  }

  console.log(`✔ Versión ${version} documentada con ${itemKeys.length} cambios.`);
}

const [command, argument, value] = process.argv.slice(2);
if (command === 'bump') bump(argument);
else if (command === 'check') check(argument === '--base' ? value : undefined);
else fail('Uso: node scripts/release.mjs bump <X.Y.Z> | check [--base <ref>]');

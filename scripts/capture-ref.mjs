#!/usr/bin/env node
/**
 * Captures craft.do reference screenshots + computed styles for the visual diff
 * checklist. Requires a logged-in craft.do session, so it launches headed on the
 * first run and saves the storage state for reuse.
 *
 *   node scripts/capture-ref.mjs --login              # manual sign-in, saves state
 *   node scripts/capture-ref.mjs                      # capture everything
 *   node scripts/capture-ref.mjs --only=document-detail # one screen
 *
 * Outputs: docs/craft-ref/ref-<screen>-<w>.png and docs/craft-ref/tokens.json
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs', 'craft-ref');
const STATE = path.join(ROOT, 'e2e', '.craft-ref-state.json');
const BASE = process.env.CRAFT_REF_BASE ?? 'https://app.craft.do';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

/** Entity screens have no stable URL across accounts; pass `--path` with your own:
 *  `node scripts/capture-ref.mjs --only=document-detail --path=/documents/abc123` */
const SCREENS = [
  { name: 'login', path: '/login' },
  { name: 'documents', path: '/documents' },
  { name: 'recent', path: '/recent' },
  { name: 'favorites', path: '/favorites' },
  { name: 'daily-notes', path: '/daily-notes' },
  { name: 'tasks', path: '/tasks' },
  { name: 'calendar', path: '/calendar' },
  { name: 'templates', path: '/templates' },
  { name: 'search', path: '/search' },
  { name: 'settings', path: '/settings' },
  { name: 'trash', path: '/trash' },
  { name: 'collections', path: '/collections' },
  { name: 'whiteboards', path: '/whiteboards' },
];

const PROPS = [
  'background-color', 'color', 'font-family', 'font-size', 'line-height',
  'letter-spacing', 'padding', 'gap', 'border-radius', 'border-color',
];

/** Reads the properties that matter off the surfaces a designer compares. */
const PROBE = (props) => () => {
  const pick = (el) => {
    const s = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
  };
  const named = (sel) => {
    const el = document.querySelector(sel);
    return el ? pick(el) : null;
  };
  return {
    page: pick(document.body),
    main: named('main') ?? named('[class*="content"]'),
    sidebar: named('nav') ?? named('[class*="sidebar"]'),
    card: named('[class*="card"]'),
    button: named('button'),
    heading: named('h1') ?? named('h2'),
    input: named('input') ?? named('textarea'),
  };
};

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

async function login() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  console.log('Sign in in this window, then press Enter here…');
  await new Promise((resolve) => process.stdin.once('data', resolve));
  await mkdir(path.dirname(STATE), { recursive: true });
  await context.storageState({ path: STATE });
  console.log(`storage state → ${path.relative(ROOT, STATE)}`);
  await browser.close();
}

async function capture() {
  if (!existsSync(STATE)) {
    throw new Error(`no craft.do session — run \`node ${path.relative(ROOT, import.meta.filename)} --login\` first`);
  }
  await mkdir(OUT, { recursive: true });
  const only = value('only');
  const override = value('path');
  let screens;
  if (override) {
    // Entity screens (`document-detail`, `collection`, `whiteboard`, the four panel
    // tabs) are absent from SCREENS because their URLs differ per account.
    if (!only) throw new Error('--path needs --only <name> to label the output');
    screens = [{ name: only, path: override }];
  } else {
    screens = only ? SCREENS.filter((s) => s.name === only) : SCREENS;
    if (screens.length === 0) throw new Error(`unknown screen: ${only}`);
  }

  const browser = await chromium.launch();
  const tokens = {};
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      storageState: STATE,
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.name === 'mobile' ? 3 : 1,
    });
    for (const screen of screens) {
      const target = override ?? screen.path;
      const page = await context.newPage();
      try {
        await page.goto(`${BASE}${target}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(700);
        const file = path.join(OUT, `ref-${screen.name}-${viewport.name}.png`);
        await page.screenshot({ path: file });
        tokens[`${screen.name}@${viewport.name}`] = await page.evaluate(PROBE(PROPS));
        console.log(`✓ ${path.relative(ROOT, file)}`);
      } catch (error) {
        // One unreachable screen must not cost the whole batch — a session that
        // expired mid-run still leaves everything else usable.
        console.error(`✗ ${screen.name}/${viewport.name}: ${error.message.split('\n')[0]}`);
        tokens[`${screen.name}@${viewport.name}`] = { error: error.message.split('\n')[0] };
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
  await browser.close();
  await writeFile(`${OUT}/tokens.json`, JSON.stringify(tokens, null, 2));
  console.log(`tokens → docs/craft-ref/tokens.json`);
}

if (flag('login')) await login();
else await capture();

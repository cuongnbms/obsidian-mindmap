'use strict';

// Run with: node --test tests/*.test.js
// Stubs the `obsidian` module (only available inside Obsidian) and the DOM
// render step; everything else runs the real plugin code.

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const obsidianStub = {
  Plugin: class { constructor(app, manifest) { this.app = app; this.manifest = manifest; } },
  PluginSettingTab: class {},
  Setting: class {},
  MarkdownView: class {},
  Menu: class {},
  Notice: class {},
  TFolder: class {},
  debounce: (fn) => fn,
  normalizePath: (p) => p,
  parseYaml: () => ({}),
};
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'obsidian') return obsidianStub;
  return origLoad.call(this, request, ...rest);
};
const Plugin = require('../main.js');
globalThis.requestAnimationFrame = (cb) => cb(); // browser API used after writes

function setup(markdown) {
  const writes = [];
  const app = { vault: { modify: async (file, content) => { writes.push({ file, content }); } } };
  const plugin = new Plugin(app, {});
  plugin._renderTreeIntoCanvas = () => {}; // DOM boundary
  const file = { basename: 'Note', path: 'Note.md' };
  const parsed = plugin._parseStructured(markdown);
  const overlay = {
    _lmmFile: file,
    _lmmParsed: parsed,
    _lmmTreeInfo: plugin._buildTree(parsed, file.basename),
    _lmmSelected: null,
  };
  return { plugin, overlay, writes, file };
}

const md = (...lines) => lines.join('\n') + '\n';

// Depths: Root 0 · A, B, C 1 · A1, A2, B1 2 · A1a 3
const SAMPLE = md(
  '# Root',
  '## A',
  '### *A1*',
  '#### A1a',
  '### A2',
  '## B',
  '### B1',
  '## C',
);

test('level 1 collapses depth-1 nodes with children and expands deeper ones', async () => {
  const { plugin, overlay, writes, file } = setup(SAMPLE);
  await plugin._collapseToLevel(overlay, 1);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].file, file);
  assert.equal(writes[0].content, md(
    '# Root',
    '## *A*',
    '### A1',
    '#### A1a',
    '### A2',
    '## *B*',
    '### B1',
    '## C',
  ));
});

// Catches: off-by-one on depth, collapsing leaves, not re-expanding shallower nodes.
test('level 2 expands depth-1 nodes and collapses only depth-2 nodes with children', async () => {
  const { plugin, overlay, writes } = setup(md(
    '# Root',
    '## *A*',
    '### A1',
    '#### A1a',
    '### A2',
    '## *B*',
    '### B1',
    '## C',
  ));
  await plugin._collapseToLevel(overlay, 2);
  assert.equal(writes[0].content, md(
    '# Root',
    '## A',
    '### *A1*',
    '#### A1a',
    '### A2',
    '## B',
    '### B1',
    '## C',
  ));
});

// Catches: "All" leaving some collapsed marker behind.
test('level 0 (All) expands every node', async () => {
  const { plugin, overlay, writes } = setup(md(
    '# Root',
    '## *A*',
    '### *A1*',
    '#### A1a',
    '## B',
  ));
  await plugin._collapseToLevel(overlay, 0);
  assert.equal(writes[0].content, md(
    '# Root',
    '## A',
    '### A1',
    '#### A1a',
    '## B',
  ));
});

// Catches: counting depth from the first heading instead of the virtual root
// (file with several top-level headings, root = file name).
test('with a virtual root, level 1 collapses the top-level headings', async () => {
  const { plugin, overlay, writes } = setup(md(
    '# A',
    '## A1',
    '# B',
    '## B1',
    '### B1a',
  ));
  await plugin._collapseToLevel(overlay, 1);
  assert.equal(writes[0].content, md(
    '# *A*',
    '## A1',
    '# *B*',
    '## B1',
    '### B1a',
  ));
});

// Catches: rewriting the note body or frontmatter.
test('keeps frontmatter and heading bodies intact', async () => {
  const { plugin, overlay, writes } = setup(md(
    '---',
    'mindmap-layout: right',
    '---',
    '# Root',
    '## A',
    'some notes under A',
    '### A1',
  ));
  await plugin._collapseToLevel(overlay, 1);
  assert.equal(writes[0].content, md(
    '---',
    'mindmap-layout: right',
    '---',
    '# Root',
    '## *A*',
    'some notes under A',
    '### A1',
  ));
});

// Catches: the refactor of _toggleCollapse onto the shared persist helper
// breaking single-node collapse.
test('single-node toggle still writes one collapsed marker', async () => {
  const { plugin, overlay, writes } = setup(SAMPLE);
  const b = overlay._lmmTreeInfo.tree.children[1];
  assert.equal(b.text, 'B');
  await plugin._toggleCollapse(overlay, b);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].content, SAMPLE.replace('## B\n', '## *B*\n'));
});

function keyEvent(key, extra = {}) {
  const ev = {
    key, ctrlKey: false, metaKey: false, altKey: false, isComposing: false,
    target: { tagName: 'DIV', isContentEditable: false },
    prevented: false,
    preventDefault() { this.prevented = true; },
    stopPropagation() {},
    ...extra,
  };
  return ev;
}

// Catches: wrong key→level mapping.
test('digit keys 1/2/3/0 collapse to that level', () => {
  const { plugin, overlay } = setup(SAMPLE);
  const calls = [];
  plugin._collapseToLevel = (o, level) => { calls.push([o, level]); };
  for (const k of ['1', '2', '3', '0']) {
    const e = keyEvent(k);
    plugin._handleLevelKey(overlay, e);
    assert.equal(e.prevented, true, `key ${k}`);
  }
  assert.deepEqual(calls, [[overlay, 1], [overlay, 2], [overlay, 3], [overlay, 0]]);
});

// Catches: shortcuts firing while typing (node edit, toolbar select) or on
// Cmd/Ctrl/Alt combos, or swallowing unrelated keys.
test('level keys are ignored while editing, with modifiers, or for other keys', () => {
  const { plugin, overlay } = setup(SAMPLE);
  const calls = [];
  plugin._collapseToLevel = (o, level) => { calls.push(level); };
  const ignored = [
    keyEvent('1', { target: { tagName: 'DIV', isContentEditable: true } }),
    keyEvent('1', { target: { tagName: 'SELECT', isContentEditable: false } }),
    keyEvent('2', { target: { tagName: 'INPUT', isContentEditable: false } }),
    keyEvent('1', { metaKey: true }),
    keyEvent('1', { ctrlKey: true }),
    keyEvent('1', { altKey: true }),
    keyEvent('4'),
    keyEvent(' '),
  ];
  for (const e of ignored) {
    plugin._handleLevelKey(overlay, e);
    assert.equal(e.prevented, false, `key ${e.key} on ${e.target.tagName}`);
  }
  assert.deepEqual(calls, []);
});

// Catches: clearing the `*...*` of leaf headings (italic text the user wrote),
// which single-node toggle never touches.
test('leaves italic leaf headings untouched', async () => {
  const input = md(
    '# Root',
    '## A',
    '### *italic leaf*',
    '## *also leaf*',
  );
  for (const level of [0, 1, 2, 3]) {
    const { plugin, overlay, writes } = setup(input);
    await plugin._collapseToLevel(overlay, level);
    const expected = level === 1 ? input.replace('## A\n', '## *A*\n') : input;
    assert.equal(writes[0].content, expected, `level ${level}`);
  }
});

'use strict';

// Run with: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'obsidian') {
    return {
      Plugin: class { constructor(app, manifest) { this.app = app; this.manifest = manifest; } },
      PluginSettingTab: class {}, Setting: class {}, MarkdownView: class {}, Menu: class {},
      Notice: class {}, TFolder: class {}, debounce: (fn) => fn, normalizePath: (p) => p,
      parseYaml: () => ({}),
    };
  }
  return origLoad.call(this, request, ...rest);
};
const Plugin = require('../main.js');

// A node element rendered at `w`×`h` CSS px inside a canvas zoomed to `scale`:
// getBoundingClientRect reports the zoomed size, offsetWidth/Height the layout size.
function fakeEl(w, h, scale) {
  return {
    offsetWidth: w,
    offsetHeight: h,
    getBoundingClientRect: () => ({ width: w * scale, height: h * scale }),
  };
}

// Catches: nodes measured in screen px while zoomed out, so re-renders that keep
// the zoom pack siblings and children too tightly and boxes overlap.
test('node size is measured in layout px, independent of canvas zoom', () => {
  const plugin = new Plugin({}, {});
  const child = { _el: fakeEl(300, 44, 0.5), children: [] };
  const root = { _el: fakeEl(200, 60, 0.5), children: [child] };
  plugin._measureNodes(root);
  assert.equal(root.width, 200);
  assert.equal(root.height, 60);
  assert.equal(child.width, 300);
  assert.equal(child.height, 44);
});

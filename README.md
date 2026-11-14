# Obsidian Mindmap

Forked from [ninglg/light-mindmap](https://github.com/ninglg/light-mindmap).

Feature-rich mindmap plugin — multiple layouts, themes, node shapes & line styles, wikilink support, node collapse, PNG export — all from plain markdown headings, no custom syntax needed.

## Preview
![Obsidian Mindmap Preview](preview.png)

## How It Works

Add `type: mindmap` to any note's frontmatter. The plugin replaces the editor/reading view with a live mind map built from the note's heading hierarchy.

You can also right-click a folder in the file explorer and select **Create mindmap** to quickly create a new mindmap file in that folder.

```yaml
---
type: mindmap
---

# My Plan
## Life
### walk the dog
### cook dinner
### call my parents
## *Work*
### write report
### team discussion
### send emails
## *Study*
### learn new words
### listen to podcast
### practice coding
## Shopping
### buy fruits
### get stationery
### pick up snacks

```

The mind map updates in real time as you edit the source.

## Features

### Auto-Render from Headings

- Parses all heading levels (`#` through `######`) into a tree
- Strips inline markdown (bold, italic, links, wikilinks, code) from node labels
- When multiple top-level headings exist, a virtual root node (named after the file) is created automatically
- Fenced code blocks are skipped during parsing

### Layouts

Five layout modes, switchable from the toolbar dropdown or via command:

| Layout           | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| **Balanced**     | Children are distributed to both sides of the root, weighted by subtree height |
| **Right**        | All branches expand to the right                                               |
| **Left**         | All branches expand to the left                                                |
| **Tree**         | Top-down tree — root at the top, branches expand downward                      |
| **Radial**       | Root at the center, branches radiate outward in a circle                       |

### Themes

Seven built-in color palettes:

| Theme        | Style                                         |
| ------------ | --------------------------------------------- |
| **Vibrant**  | Indigo/violet/pink gradient — the default     |
| **Classic**  | Earth tones on a warm cream background        |
| **Fresh**    | Greens and teals on a light mint background   |
| **Ocean**    | Blues and indigos on a pale blue background   |
| **Sunset**   | Reds, oranges, and pinks on a warm background |
| **Midnight** | Neon accents on a dark slate background       |
| **Slate**    | Cool blue-grey with a subtle tech grid pattern |

Themes adapt automatically to Obsidian's dark/light mode.

### Connection Line Styles

| Style                  | Shape                          | Dash   |
| ---------------------- | ------------------------------ | ------ |
| **Smooth**             | Cubic Bézier curve             | Solid  |
| **Smooth Dashed**      | Cubic Bézier curve             | Dashed |
| **Straight**           | Direct line                    | Solid  |
| **Right Angle**        | Horizontal + vertical segments | Solid  |
| **Right Angle Dashed** | Horizontal + vertical segments | Dashed |

### Node Shapes

| Shape          | Appearance                            |
| -------------- | ------------------------------------- |
| **Rounded**    | Rounded rectangle (default)           |
| **Square**     | Sharp corners                         |
| **Borderless** | No border or background on leaf nodes |
| **Pill**       | Fully rounded capsule                 |
| **Doodle**     | Hand-drawn style with slight rotation |

### Pan & Zoom

- **Drag** the canvas background to pan (mouse or touch)
- **Pinch** to zoom on touch devices
- **Scroll** to pan vertically/horizontally
- **Ctrl/Cmd + Scroll** to zoom in/out around the cursor
- Toolbar buttons: **Fit** (fit all nodes into view), **+** / **−** (step zoom)

### Node Editing

Nodes can be edited directly on the canvas — changes are written back to the markdown file:

| Action                        | Gesture / Key                                  |
| ----------------------------- | ---------------------------------------------- |
| Select node                   | Click                                          |
| Edit node text                | Double-click or **F2**                         |
| Confirm edit                  | **Enter**                                      |
| Confirm edit + add child      | **Tab**                                        |
| Cancel edit                   | **Escape**                                     |
| Add sibling (without editing) | Select node, press **Enter**                   |
| Add child (without editing)   | Select node, press **Tab**                     |
| Delete node                   | Select node, press **Delete** or **Backspace** |
| Collapse / expand node        | Select node, press **Space**                   |
| Drag node (change parent)     | Drag node to center of another node            |
| Drag node (reorder)           | Drag node to top/bottom of another node        |
| Right-click context menu      | Right-click on node                            |

- The root node cannot be deleted.
- Pressing **Enter** on the root node has no effect (no sibling can be added above root).
- Pressing **Tab** on a collapsed node auto-expands it and adds a new child.
- Double-clicking or pressing **F2** on a collapsed node auto-expands it and enters edit mode.
- Collapsed nodes display a **+** badge after the text. The badge is also rendered in exported PNGs.

### Right-Click Context Menu

Right-click on any node to open the context menu with quick actions:

| Action           | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| **Edit**         | Enter edit mode for the node                                |
| **Add Sibling**  | Insert a sibling node (not available on root)               |
| **Add Child**    | Create a child node (auto-expands if collapsed)             |
| **Collapse**     | Toggle collapsed state (only for nodes with children)       |
| **Delete**       | Delete the node (not available on root)                     |

The context menu automatically displays in Chinese or English based on Obsidian's language setting.

### Persisted Settings

All per-file display preferences are written to frontmatter and restored on next open:

| Frontmatter key  | Values                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| `mindmap-layout` | `balanced` / `right` / `left` / `tree` / `radial`                      |
| `mindmap-theme`  | `vibrant` / `classic` / `fresh` / `ocean` / `sunset` / `midnight` / `slate` |
| `mindmap-line`   | `curve` / `straight` / `polyline` / `polyline-dashed` / `curve-dashed` |
| `mindmap-node`   | `rounded` / `square` / `borderless` / `circle` / `doodle`              |

### Toggle Source View

- **Edit Markdown** button in the toolbar hides the mind map and shows a floating **Obsidian Mindmap** button
- Returning from source view auto-fits the mindmap to the viewport
- Command palette: **Toggle mindmap / source view**
- Command palette: **Cycle mindmap layout (balanced / right / left / tree / radial)**

### Links & Wiki-links

Markdown links (`[text](url)`) and wiki-links (`[[Note]]`, `[[Note|Alias]]`) in heading text are rendered as clickable links on the mindmap canvas.

- **External links** (`http://...`) open in the default browser
- **Internal links** (relative paths like `./note.md`) open in a new Obsidian tab
- **Wiki-links** (`[[Note]]`) open the target note in a new Obsidian tab — supports shortest paths, relative paths, and aliases natively

During node editing, typing `[[` triggers an autocomplete popup that searches all vault notes. Use **↑↓** to navigate, **Enter** to insert, **Escape** to dismiss. Links are shown as plain text while editing for easy modification.

### Export PNG

Click the **Export PNG** button in the toolbar to save the current mindmap as a high-resolution PNG image (2x scale). A system file dialog will let you choose the save location.

## Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from [this repository](https://github.com/cuongnbms/obsidian-mindmap)
2. Copy the three files into `<vault>/.obsidian/plugins/obsidian-mindmap/`
3. Reload Obsidian and enable the plugin in **Settings → Community plugins**

## Example Frontmatter

```yaml
---
type: mindmap
mindmap-layout: balanced
mindmap-theme: vibrant
mindmap-line: curve
mindmap-node: rounded
---
```

## Compatibility

- Minimum Obsidian version: **1.4.0**
- Desktop and mobile supported
- Works with both light and dark Obsidian themes

## License

MIT

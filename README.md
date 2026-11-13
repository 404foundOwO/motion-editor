# motion-editor
Dumb claude-slop video editor that balances between creative and simplicity
Made this since there's no RELIABLE cross-platform program to do my videos on!

**Use it:** https://404foundowo.github.io/motion-editor/ (GitHub Pages, works on any device), or clone the repo and open `index.html`.
For a single offline file run `python3 tools/build.py`, which writes `dist/motion-editor.html` (about 1.5 MB, everything embedded).
I'm trying to add features that most simple editors don't have some simple stuff, such as:
- Native Gradient blur
- Alight motion type of keyframe handling (And keybinds to move between them fast!)
- Repeat objects for set bpm with each copy mirroring
- Camera bop
- Particle emitters
- 3D preview of canvas
- Import 3D GLB Models (Experimental)
- Text physics (not pixel accurate yet!)
- Autosave and saving projects with the videos bundled
- Ability to set preview to 1/4 res, and disabling effects temporarily
anndd much mooreee ! (and will continue to add when i need)


Frame-by-frame 60 fps export uses WebCodecs, so it needs a Chromium-based browser (Chrome, Edge, Brave). Editing and preview work anywhere.

## Keybinds!
Press `?` in the app for this list. On macOS use Cmd instead of Ctrl.

### Playback & timeline

| Keys | Action |
|---|---|
| `Space` | Play / pause |
| `← →` | Step one frame |
| `Shift ← →` | Step 10 frames |
| `A / D` | Previous / next keyframe |
| `I / O / L` | Loop in / out / on-off |
| `X` | Cut tool |
| `S / Esc` | Select tool |
| `Delete` | Delete selection |

### Edit

| Keys | Action |
|---|---|
| `Ctrl Z` | Undo |
| `Ctrl Shift Z / Ctrl Y` | Redo |
| `Ctrl C / V` | Copy / paste |
| `Ctrl X / D` | Cut / duplicate |
| `Ctrl A` | Select all keyframes of the layer |
| `Ctrl G` | Group the selected layer |
| `Ctrl Shift G` | Ungroup |
| `P` | Motion path edit mode |

### Mouse

| Keys | Action |
|---|---|
| `Shift + drag (canvas)` | Box-select layers |
| `Shift + drag (timeline)` | Box-select keyframes (+Ctrl to add) |
| `Alt + drag` | Turn snapping off |
| `Shift + drag a handle` | Snap angle to 15° |
| `Drag a property label` | Scrub the value (Shift fine, Alt coarse) |
| `Double-click keyframe` | Open the graph editor |
| `Double-click layer name` | Rename the layer |
| `Drag a layer onto a group row` | Move it into the group |
| `Drag a layer between rows` | Reorder (and leave a group) |
| `Right-click` | Context menu |

### 3D orbit view

| Keys | Action |
|---|---|
| `W / S` | Fly forward / back |
| `A / D` | Move left / right |
| `Q / E` | Move up / down |
| `Shift + move` | 3× faster |
| `F` | Frame the selected layer |
| `Home` | Reset the view |
| `1 / 3 / 7` | Front / side / top view |

### Dialogs & menus

| Keys | Action |
|---|---|
| `Esc` | Close or cancel |
| `Enter` | Apply (graph editor, aspect size) |
| `Enter in search` | Add the first match |
| `?` | Show this list |


## How the code is laid out
- `index.html` is just the page shell
- `css/` styles and fonts, `fonts/` the variable fonts
- `js/` the app, in numbered files that load in order and share one global scope (shapes, render core, effects, timeline, gradient blur, wipe, blend and groups, export, and so on)
- `vendor/` three.js, GLTFLoader and the mp4/webm muxers
- `tools/build.py` bundles everything into one offline file
- `tests/` headless smoke tests (`npm i`, then `npm test`)

## Don't really like something?
Create a PR, or ask your "Agent" to change it. Each file is small enough to read now, see `CLAUDE.md` for a map.

Third-party licenses: `THIRD_PARTY_NOTICES.md`

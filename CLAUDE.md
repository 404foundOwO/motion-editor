# Working notes for agents

Browser-only motion editor. No framework, no bundler, no modules: `js/*.js` are classic scripts loaded in filename order by `index.html`, so they share one global scope. Top-level `const`/`let` in an earlier file are visible in later ones, but only at call time. Keep that order in mind when adding code.

## Where things are
| File | Contents |
|---|---|
| 01-icons-state | globals (W,H,Q,PV), icon set |
| 02-shapes | Material 3 expressive shape generators |
| 03-model-layers | add-layer list, project `P`, `val`/keyframes, `mk()` layer factory |
| 04-text-physics | letter/glyph layout, text physics |
| 05-audio-registry | audio, effect registries `EF`/`EP`, `effOf`, layer hierarchy |
| 06-render-core | offscreen pools, `postSrc0`, `layerDraw0`, `drawGroup0`, repeat/tile, `glRun` (WebGL effects) |
| 07-panels-editing | effect UI, context menu, copy/paste, tools |
| 08-draw-text-lines-emitters | captions, lines, shapes, particle emitters |
| 09-scene-timeline-graph | `draw`, side panel, timeline, easing graph editor |
| 10-gradient-blur | gradient/corner blur engine and handles |
| 11-wipe | wipe effect and handles |
| 12-bubble-shape | message bubble |
| 13-shortcuts | `?` cheat sheet (data in `KBD`) |
| 14-blend-groups | blend modes (`blendDraw`), grouping, timeline drag into groups |
| 15-render-safety | `safeDraw`, error isolation, GL recovery, main `tick` |
| 16-viewport-export | aspect ratio, preview quality, audio + video export |
| 17-project-media | save/load, media import, `ld()` loader for three.js |
| 18-canvas-handles | canvas overlay handles, snapping, motion paths |
| 19-view-layout | orbit view, layout, toolbar |
| 20-audio-export | audio-only export dialog and encoders (WAV, Ogg/WebM Opus, M4A AAC) |

## Conventions
- Effect parameters are `[key,label,default]` entries in `EP`; add the effect in `EF` and the draw code in the render path.
- A render failure must never freeze the preview: new draw code is wrapped by the `layerDraw`/`postSrc` wrappers in 15-render-safety.
- Files stay under about 30 KB. Split by topic when one grows.
- Lines are long (compact style). Use grep with `-o` and context, or read with offset/limit, rather than whole files.

## Verify before pushing
`npm i && npm test` (headless jsdom, canvas via @napi-rs/canvas; WebGL is not available there). Also run `python3 tools/build.py` and open `dist/motion-editor.html` once. `dist/` is not committed.

## Deploy
GitHub Pages serves `main` from the repo root. A push updates the site.

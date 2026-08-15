# Technical Structure — Duck Shooter: Wild Marsh

## Runtime Shape

React is the static picture frame; Babylon.js renders the live playfield. `client/src/App.tsx` renders only `GameCanvas`. `GameCanvas` initializes one lifecycle-safe Babylon `Engine`, delegates scene creation to `createGameScene(engine, canvas)`, resizes with the browser, and disposes the complete game on unmount.

## Modules

| Module | Owns | Responsibility |
| --- | --- | --- |
| `components/GameCanvas.tsx` | Canvas and Babylon engine lifecycle | Creates exactly one engine, starts the render loop, handles resize, and disposes all resources. |
| `game/scene.ts` | Babylon scene setup | Creates the orthographic camera, root scene, game world, and exposes the `GameHandle` cleanup contract. |
| `game/GameWorld.ts` | Game state, launch lifecycle, target collection | Runs the explicit game state machine, steps entities, drives round progression, and bridges player actions to score/results. |
| `game/DuckTarget.ts` | Target plane, flight state, fall state, hit effects | Owns one Babylon plane and its deterministic flight/fall equations. |
| `game/Environment.ts` | Background planes and procedural scene decorations | Loads the generated marsh texture and creates reeds, waterline glints, clouds, and low-cost depth layers. |
| `game/HudLayer.ts` | DOM HUD root and UI bindings | Creates and updates field-ledger panels, overlays, cursor, button actions, and accessibility labels without React state coupling. |
| `game/AudioManager.ts` | Web Audio context and effect synths | Unlocks audio after user gesture and produces original synthesized shot, hit, wing, and round cues. |
| `game/types.ts` | Shared game contracts | Defines game phase, visible statistics, target variants, and callback contracts. |
| `game/constants.ts` | Original tuning and generated image URLs | Centralizes round tuning, theme colors, storage key, and the permanent asset URLs. |

## Game State Machine

`TITLE → READY → LAUNCHING → INTERMISSION → ROUND_SUMMARY → GAME_OVER`, with `PAUSED` as a reversible overlay state. `GameWorld` is the only module allowed to transition core phases. A target independently moves from `FLYING → HIT_FALLING → RESOLVED` or `FLYING → ESCAPED → RESOLVED`.

## Input Semantics

`shoot`, `reload`, `togglePause`, `toggleSound`, `startOrRestart`, and `pointerMove` are semantic actions. Browser pointer and keyboard listeners translate to those actions at `GameWorld`; no gameplay class reads arbitrary document key state. Only live target planes are pickable.

## Assets

The generated wetland background is a camera-facing texture plane. Each generated duck uses an alpha-textured Babylon plane. The logo is loaded as a DOM image in the game’s start / summary notebook sheet and as the document favicon. Procedural geometry is restricted to supporting scenery, contour lines, particles, and UI ornaments; it does not replace the prominent generated art.

## Cleanup Contract

Each system owns a `dispose()` method for its Babylon meshes, textures, DOM listeners, and timers. `GameWorld.dispose()` calls all system cleanup; `GameHandle.dispose()` invokes the world cleanup then scene disposal. The `GameCanvas` React effect finally disposes the Babylon engine.

## Asset Hints

| Asset | Owner | Usage |
| --- | --- | --- |
| Marsh background | `Environment` | One 16:9 full-window plane at z=4 behind all active targets. |
| Flight ducks | `DuckTarget` factory | Alpha-textured 3:2 target planes between 150–220 CSS px wide at a 1280 px viewport. |
| Logo mark | `HudLayer` and `client/index.html` | 96 px title mark, 32 px favicon. |

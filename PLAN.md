# Game Plan: Duck Shooter — Wild Marsh

## Product Goal

Create an original, PC-first browser shooting gallery inspired by the broad arcade loop of classic duck-target games. The player aims with the mouse, fires limited cartridges at animated flying ducks, completes ten-target rounds, meets an advancing quota, and tracks a session high score. All identity, birds, scenery, interface, sounds, and logo remain original.

## Visual Target

Use the generated in-game reference at `/manus-storage/wild-marsh-visual-target_032290a7.png` as the visual QA target. The shipped scene must retain its golden-hour marsh, left score ledger, top round plate, lower-right ammunition meter, fine brass crosshair, and clean two-dimensional target readability.

## Risk Tasks

### 1. Pointer Picking Against Moving Target Quads

- **Why isolated:** A full-screen Babylon canvas with a screen-space orthographic camera, alpha-textured target planes, and browser pointer events can otherwise create offset or unreliable hit detection.
- **Approach:** Convert pointer coordinates into a ray on an orthographic scene and choose the nearest active pickable target mesh; keep decorative layers non-pickable. Use a per-target hit radius based on its on-screen scale rather than relying on transparent image bounds.
- **Verify:** Moving targets can be hit accurately at the cursor center across all screen corners; clicking empty sky does not raise score; a hit removes only the selected live target.

### 2. Procedural Flight, Fall, and Round State Handoff

- **Why isolated:** Targets need natural readable arcs plus an immediate state transition from flying to hit/falling and then a reliable handoff to the next launch, without duplicate spawns or advancing during pause.
- **Approach:** Give each target a deterministic elapsed-time flight equation with per-launch seeds. On hit, switch to a falling velocity and rotation state; when offscreen, complete the launch. A single round controller owns launch count, shots, quota, intermission, and restart transitions.
- **Verify:** A flying duck transitions to a smooth tumbling fall immediately after a hit; a missed target exits once without double-counting; round completion triggers only after all launch results resolve; pausing freezes both target motion and state timers.

## Main Build

Build a full-window orthographic Babylon scene with generated art textures, layered decorative geometry, and original target flight patterns. Create a React canvas host only; all gameplay code stays framework-independent under `client/src/game/`.

- **Core loop:** Start screen, 10-target rounds, three cartridges per launch, score, streak bonus, required-hit quota, round-clear bonus, ramping speed, round transition, and a game-over/restart screen.
- **Input:** Mouse move establishes the custom reticle; primary click shoots; `R` reloads early; `P` pauses/resumes; `M` toggles sound; `Enter` starts/restarts. Canvas focus is not required to fire.
- **Feedback:** Procedural cursor ring, shot flash, feather motes, hit score stamps, recoil-like crosshair response, duck tumbling fall, low-key screen shake, and Web Audio effects unlocked by first user action.
- **HUD:** Left vertical score ledger, top-center round/quota plate, bottom-right cartridges meter, center status prompts, pause overlay, and final results field-note sheet.
- **Environment:** Generated full-screen marsh background (`/manus-storage/wild-marsh-background_c551ef3a.png`), procedural cloud/reed/water overlays, a distant-bird layer, original generated duck textures (`duck-kingfisher-flight_b4fb7f92.png`, `duck-rust-flight_6fc35e8f.png`, `duck-ivory-flight_64211aa1.png`), and the generated wing-and-sight logo (`/manus-storage/wild-marsh-logo_4623381b.png`) for launch/restart panels.
- **Persistence:** Store a session high score in `localStorage`; it survives a page refresh but no account or remote service is needed.
- **Deterministic demo:** `?demo` runs a visible autoplay sequence for visual verification without human input; it must not replace normal manual controls.
- **Assets needed:** 16:9 wetland background; three transparent duck textures; square logo mark; procedural lines, ripples, glints, cards, and particles.
- **Verify:**
  - Mouse movement drives a visually aligned crosshair and clicking fires exactly one shot.
  - All target directions and flight arcs remain smooth, screen-readable, and distinct from a falling hit state.
  - Score, hit count, quota, ammo, streak, round number, pause state, and session high score update correctly.
  - Launches offer three shots, and reload restores the cartridges only when a launch remains active.
  - Round speed and quota visibly increase after a successful round; failure enters a clear restart screen.
  - Keyboard shortcuts function without conflicting with the browser’s normal scrolling because the game prevents page scroll during play.
  - Generated logo, background, and duck textures visibly load; no missing-texture checkerboard or fallback material appears.
  - HUD remains readable at 1280 × 720 and 375 × 812 without overlap; PC layout remains the primary experience.
  - `?demo` visibly launches, hits, and scores targets for a static verification capture.
  - No browser console errors during a full manual and demo round.
  - Reference consistency: golden-hour field-guide palette, side-on 16:9 gallery layout, brass/ledger HUD, original wild-duck targets, and kingfisher-teal action feedback.

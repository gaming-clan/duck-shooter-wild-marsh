# Duck Shooter: Wild Marsh — Design Exploration

## Three Possible Directions

### Theme Name: Field-Journal Arcade

**Very Brief Intro:** A lush, illustrated wetland seen through the framing language of a premium nature field guide. Precise arcade UI, engraved details, and cinematic water create a tactile PC shooting-gallery experience.

**Probability:** 0.07

### Theme Name: Autumn Carnival Range

**Very Brief Intro:** A warm traveling fairground takes over a lakeside clearing, with painted boards, brass fixtures, and theatrical target launches. It is spirited, handcrafted, and deliberately playful.

**Probability:** 0.03

### Theme Name: Nightwatch Observatory

**Very Brief Intro:** A moonlit marsh turns target tracking into a quiet, high-contrast stargazing ritual. Cool night blues and observational instrumentation provide a restrained, mysterious arcade mood.

**Probability:** 0.09

---

# Chosen Direction: Field-Journal Arcade

## Design Movement

**Illustrated naturalism with early-twentieth-century scientific field-guide graphics**, translated into an energetic arcade shooting gallery. The game should feel like an original premium PC title with an inviting golden-hour wetland, not a pastiche of any legacy console game.

## Core Principles

1. **The marsh is the stage.** Reeds, water, depth layers, distant silhouettes, and wind-driven movement create the visual drama before any target appears.
2. **Arcade clarity survives the atmosphere.** Targets, ammo, scores, hit confirmation, and round conditions must stay legible at a glance, even amid lively scenery.
3. **Tactile field equipment.** Brass, enamel, parchment, etched lines, and a measurement-grid language lend each control and HUD element physical credibility.
4. **Movement carries personality.** Ducks must have expressive flight arcs and reactive fall trajectories, while the world responds with ripples, feather motes, and clean impacts.

## Color Philosophy

The environment is built around **marsh green, deep spruce, river blue, and parchment cream**, with a horizon of muted apricot suggesting the final moments of daylight. Contrast is reserved for meaningful events: a **kingfisher teal** target-acquisition accent, warm brass scoring, and restrained scarlet only for a near-miss warning. The palette should feel serene until action begins, then become brisk and precise.

## Layout Paradigm

The playfield fills the entire browser window as a layered diorama rather than sitting inside a card or centered panel. The HUD is arranged as a field instrument: a left-edge vertical score ledger, a bottom-right cartridge gauge, and a small top-center round placard. Menus emerge as a physical field notebook laid over the landscape, slightly skewed and anchored from the lower-left rather than symmetrically centered.

## Signature Elements

1. **Field-guide crosshair:** a thin brass reticle with range tick marks, a subtle inner dot, and a brief teal confirmation ring on a hit.
2. **Waterline telemetry:** fine contour lines, reflected color bands, and small expanding ripples wherever a duck falls near the lake.
3. **Etched ledger panels:** slim parchment-and-brass score panels with rule lines, ink-like numerals, and practical labels.

## Interaction Philosophy

The mouse is the player’s field instrument. Hovering the scene is quiet and observational; clicking is crisp, immediate, and consequential. Every shot must resolve visually through recoil-like reticle feedback, a water or air impact, and clear ammunition change. Keyboard controls are few and discoverable: `R` reloads early, `P` pauses, and `M` toggles sound.

## Animation

Background layers drift at different speeds to establish depth: cloud banks move slowly, distant birds cross rarely, reeds sway in staggered gusts, and the waterline shimmers almost imperceptibly. Targets fly in readable, smooth S-curves with occasional dives and climbs. Hits should create a tight 140–220 ms response sequence: teal reticle ring, feather burst, target tumble, and a score stamp that rises then dissolves. Menus use short page-slide transitions; no bouncing, neon glow, or prolonged motion.

## Typography System

Use **DM Serif Display** for round titles, score milestones, and notebook headings, paired with **Barlow Condensed** for live HUD telemetry and controls. Headings use high-contrast serif italics sparingly for field-guide character, while all gameplay-critical values use condensed uppercase numerals at generous sizes. Never use Inter.

## Brand Essence

**Duck Shooter: Wild Marsh is a refined, original PC arcade gallery for players who want sharp aim inside a living wetland world.**

Personality: **observant, tactile, spirited**.

## Brand Voice

Copy is concise, confident, and field-note-like: it describes action as an observation rather than a generic command. Calls to action should sound like a range operator inviting a round.

> “The reeds are moving. Keep your eye on the horizon.”

> “Range is open. Make every cartridge count.”

## Wordmark & Logo

The wordmark pairs a narrow engraved serif with a compact, hand-cut **flying-duck-and-reed emblem**: a single teal wing stroke crossing a brass sight ring, with no character face or borrowed game iconography. The mark should work as a bold symbol without text in the header and favicon.

## Signature Brand Color

**Kingfisher Teal — `#1C9B91`**. It appears only on target-confirmation moments, the active crosshair, and selected controls, making it a strong action signal rather than a generic background color.

## Style Decisions

The opening and idle states must always reveal the layered marsh diorama alongside visible field-instrument UI, never a blank color field. Brand presence must arrive on the first screen through the duck-and-reed emblem and engraved Wild Marsh wordmark. Every visible game state must combine reeds or water depth, parchment ledger surfaces, brass measurement marks, the DM Serif Display and Barlow Condensed typography pairing, and Kingfisher Teal restricted to active or action-confirmation signals.

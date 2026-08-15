# Duck Shooter: Wild Marsh

**Duck Shooter: Wild Marsh** is an original, PC-first browser arcade gallery. Track expressive flying ducks across a golden-hour wetland, make each three-cartridge launch count, clear ten-target rounds, and carry a field-score streak into faster flights.

The game takes broad inspiration from the arcade shooting-gallery format while using an original title, original logo, original generated art, original interface, and synthesized audio feedback. It does not use Nintendo branding, characters, or assets.

| Control | Action |
| --- | --- |
| Mouse movement | Aim the brass field reticle |
| Left mouse button | Fire a cartridge |
| `R` | Reload the active launch early |
| `P` | Pause or resume |
| `M` | Toggle sound |
| `Enter` | Start, restart, or continue to the next round |

## Local development

Install dependencies with `pnpm install`, then run `pnpm dev`. Use `pnpm check` for TypeScript validation and `pnpm build` for a production build.

For a deterministic visual demonstration of the gameplay loop, open the root URL with `?demo` appended. The normal root route opens the interactive field-note title screen.

## Design direction

The game uses the **Field-Journal Arcade** visual system: illustrated wetland scenery, parchment score ledgers, brass measurement marks, a Kingfisher Teal action signal, and the pairing of DM Serif Display with Barlow Condensed. The full visual direction and asset manifest are kept in [`ideas.md`](ideas.md) and [`ASSETS.md`](ASSETS.md).

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

Install dependencies with `pnpm install`, then run `pnpm dev` for development. Use `pnpm check` for TypeScript validation and `pnpm build` for a production build. For a locally installed PWA that can relaunch after the development server closes, run `pnpm build` and then `pnpm preview --host --port 3003`; install the app from that production preview, not from the HMR development server.

For a deterministic visual demonstration of the gameplay loop, open the root URL with `?demo` appended. The normal root route opens the interactive field-note title screen.

## Run and install on Windows

The project checkout lives at `C:\Manus\duck-shooter-wild-marsh`. Open **PowerShell** in that folder and run `npm install -g pnpm` once if `pnpm` is not already installed. Then run `pnpm install`, `pnpm build`, and `pnpm preview --host --port 3003`; open `http://localhost:3003` in your browser. Keep `pnpm dev` for development only.

Wild Marsh is an installable PWA. For the published version or the production preview, open the game in Chrome or Microsoft Edge and choose the browser's **Install app** button in the address bar, or use the browser menu and select **Install Duck Shooter: Wild Marsh**. The production build registers the service worker and caches the app shell plus previously loaded assets for offline relaunches. If an older white-screen installation already exists, uninstall it, rebuild, start the production preview, and install it again.

## Design direction

The game uses the **Field-Journal Arcade** visual system: illustrated wetland scenery, parchment score ledgers, brass measurement marks, a Kingfisher Teal action signal, and the pairing of DM Serif Display with Barlow Condensed. The full visual direction and asset manifest are kept in [`ideas.md`](ideas.md) and [`ASSETS.md`](ASSETS.md).

# Asset Manifest — Duck Shooter: Wild Marsh

## Art Direction

Field-Journal Arcade: a premium illustrated-naturalism wetland at golden hour. The rendered game uses calm river blue, deep spruce, parchment cream, warm brass, and **Kingfisher Teal (`#1C9B91`)** for target-confirmation moments. The playfield is a readable side-on shooting-gallery diorama with field-instrument HUD overlays. Avoid retro pixel art, neon, purple gradients, copied classic-console imagery, recognizable legacy game characters, and any Nintendo marks.

## Generated Assets

The first generation set failed and is retired. The following replacement URLs are the active assets; the game runtime points only to these entries.

| Asset | Purpose | In-game size | Web URL | Notes |
| --- | --- | --- | --- | --- |
| Marsh background | Full-screen sky, lake, distant-bank background | 2560 × 1440 px, full viewport cover | `/manus-storage/wild-marsh-background-v2_21a319b9.png` | Use as a large background texture beneath procedural depth and foreground elements. |
| Kingfisher flight duck | Common fast target | 190 × 128 px at 1280 px viewport width | `/manus-storage/duck-kingfisher-flight-v2_1f2ba0f0.png` | Transparent 3:2 duck art facing right. |
| Rust flight duck | Common banking target | 176 × 118 px at 1280 px viewport width | `/manus-storage/duck-rust-flight-v2_c2626146.png` | Transparent 3:2 duck art facing left. |
| Ivory flight duck | High-value rare target | 202 × 136 px at 1280 px viewport width | `/manus-storage/duck-ivory-flight-v2_86d4eeaf.png` | Transparent 3:2 duck art facing right. |
| Wild Marsh logo mark | App header / favicon mark | 96 × 96 px in start panel; 32 × 32 px favicon | `/manus-storage/wild-marsh-logo-v2_45b295f2.png` | Text-free flying wing, brass sight ring, and reeds. |

## Asset Integration Notes

Generated files are stored outside the code tree under `/home/ubuntu/webdev-static-assets/` and exposed through the permanent URLs above. The game uses these URLs directly for Babylon textures and page iconography. Visual scenery may be extended by procedural geometry and canvas effects, but prominent elements must maintain this generated illustrated-naturalist visual language.

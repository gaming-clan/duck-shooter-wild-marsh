import type { TargetVariant } from "@/game/types";

export const ASSETS = {
  background: "/manus-storage/wild-marsh-background-v2_21a319b9.png",
  logo: "/manus-storage/wild-marsh-logo-v2_45b295f2.png",
  ducks: {
    kingfisher: "/manus-storage/duck-kingfisher-flight-v2_1f2ba0f0.png",
    rust: "/manus-storage/duck-rust-flight-v2_c2626146.png",
    ivory: "/manus-storage/duck-ivory-flight-v2_86d4eeaf.png",
  },
} as const;

export const STORAGE_KEY = "wild-marsh-high-score";
export const ROUND_TARGETS = 10;
export const STARTING_SHOTS = 3;

export const TARGET_DATA: Record<TargetVariant, { points: number; width: number; height: number; texture: string; label: string }> = {
  kingfisher: { points: 100, width: 3.25, height: 2.16, texture: ASSETS.ducks.kingfisher, label: "CLEAN HIT" },
  rust: { points: 150, width: 3.05, height: 2.03, texture: ASSETS.ducks.rust, label: "BANKER" },
  ivory: { points: 250, width: 3.48, height: 2.32, texture: ASSETS.ducks.ivory, label: "RARE SIGHTING" },
};

export function getQuota(round: number) {
  return Math.min(9, 4 + Math.floor(round * 0.75));
}

export function getFlightDuration(round: number) {
  return Math.max(2.25, 4.25 - round * 0.18);
}

export type GamePhase = "title" | "launching" | "paused" | "roundSummary" | "gameOver";
export type TargetStatus = "flying" | "falling" | "escaped" | "resolved";
export type TargetVariant = "kingfisher" | "rust" | "ivory";

export interface GameStats {
  score: number;
  highScore: number;
  round: number;
  hits: number;
  quota: number;
  launched: number;
  streak: number;
  shots: number;
  soundOn: boolean;
  aimAssistOn: boolean;
}

export interface HudActions {
  onStart: () => void;
  onPause: () => void;
  onSound: () => void;
  onAssist: () => void;
  onInstall: () => void;
  onFullscreen: () => void;
}

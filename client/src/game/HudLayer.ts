// Field-Journal Arcade design: all information appears as a tactile brass-and-parchment field instrument, never a generic dashboard.
import { ASSETS } from "@/game/constants";
import type { GamePhase, GameStats, HudActions } from "@/game/types";

export class HudLayer {
  private readonly root: HTMLDivElement;
  private readonly scoreEl: HTMLElement;
  private readonly roundEl: HTMLElement;
  private readonly quotaEl: HTMLElement;
  private readonly shotsEl: HTMLElement;
  private readonly streakEl: HTMLElement;
  private readonly statusEl: HTMLElement;
  private readonly overlayEl: HTMLDivElement;
  private readonly overlayTitle: HTMLElement;
  private readonly overlayCopy: HTMLElement;
  private readonly actionButton: HTMLButtonElement;
  private readonly cursor: HTMLDivElement;
  private readonly soundButton: HTMLButtonElement;
  private readonly assistButton: HTMLButtonElement;
  private action: (() => void) | null = null;
  private cleanups: Array<() => void> = [];

  constructor(parent: HTMLElement, actions: HudActions) {
    this.root = document.createElement("div");
    this.root.className = "game-hud";
    this.root.innerHTML = `
      <div class="hud-topline"><span class="hud-wordmark">WILD MARSH</span><span class="hud-rule"></span><span class="hud-mode">FIELD RANGE 01</span></div>
      <section class="score-ledger" aria-label="Score ledger"><span class="ledger-kicker">FIELD SCORE</span><strong class="ledger-score">000000</strong><span class="ledger-high">BEST 000000</span><span class="ledger-streak">STEADY AIM</span></section>
      <section class="round-plate" aria-label="Round information"><span class="round-caption">CURRENT FLIGHT</span><strong class="round-number">ROUND 01</strong><span class="round-quota">0 / 5 CLEAR</span></section>
      <section class="cartridge-gauge" aria-label="Cartridges remaining"><span class="gauge-caption">CARTRIDGES</span><div class="shells"><i></i><i></i><i></i></div><span class="gauge-key">R / RELOAD</span></section>
      <p class="range-status">RANGE CLOSED — OBSERVE THE WATERLINE</p>
      <div class="hud-controls"><button class="assist-toggle" aria-label="Toggle aim assistance">ASSIST ON</button><button class="sound-toggle" aria-label="Toggle sound">SOUND ON</button><button class="pause-toggle" aria-label="Pause game">PAUSE</button></div>
      <div class="aim-reticle" aria-hidden="true"><span></span><b></b><em></em><i></i></div>
      <section class="field-sheet" aria-live="polite"><div class="sheet-topline"><span>MARSH RANGE NOTES</span><span>EST. 2026</span></div><img class="sheet-logo" src="${ASSETS.logo}" alt="" /><span class="sheet-eyebrow">ORIGINAL ARCADE GALLERY</span><h1>DUCK SHOOTER<br /><i>WILD MARSH</i></h1><p class="sheet-copy">The reeds are moving. Track the flight line, make every cartridge count.</p><button class="range-action">OPEN THE RANGE <span>↗</span></button><p class="sheet-keyline">MOUSE / AIM + FIRE &nbsp; • &nbsp; R / RELOAD &nbsp; • &nbsp; P / PAUSE</p></section>`;
    parent.appendChild(this.root);

    this.scoreEl = this.select(".ledger-score");
    this.roundEl = this.select(".round-number");
    this.quotaEl = this.select(".round-quota");
    this.shotsEl = this.select(".shells");
    this.streakEl = this.select(".ledger-streak");
    this.statusEl = this.select(".range-status");
    this.overlayEl = this.select(".field-sheet");
    this.overlayTitle = this.select("h1", this.overlayEl);
    this.overlayCopy = this.select(".sheet-copy", this.overlayEl);
    this.actionButton = this.select<HTMLButtonElement>(".range-action", this.overlayEl);
    this.cursor = this.select(".aim-reticle");
    this.soundButton = this.select<HTMLButtonElement>(".sound-toggle");
    this.assistButton = this.select<HTMLButtonElement>(".assist-toggle");
    const pauseButton = this.select<HTMLButtonElement>(".pause-toggle");
    this.listen(this.actionButton, "click", () => this.action?.());
    this.listen(pauseButton, "click", actions.onPause);
    this.listen(this.soundButton, "click", actions.onSound);
    this.listen(this.assistButton, "click", actions.onAssist);
  }

  update(stats: GameStats) {
    this.scoreEl.textContent = String(stats.score).padStart(6, "0");
    this.select(".ledger-high").textContent = `BEST ${String(stats.highScore).padStart(6, "0")}`;
    this.roundEl.textContent = `ROUND ${String(stats.round).padStart(2, "0")}`;
    this.quotaEl.textContent = `${stats.hits} / ${stats.quota} CLEAR`;
    this.streakEl.textContent = stats.streak >= 2 ? `STREAK ×${stats.streak}` : "STEADY AIM";
    this.soundButton.textContent = stats.soundOn ? "SOUND ON" : "SOUND OFF";
    this.assistButton.textContent = stats.aimAssistOn ? "ASSIST ON" : "ASSIST OFF";
    this.assistButton.classList.toggle("is-active", stats.aimAssistOn);
    Array.from(this.shotsEl.querySelectorAll("i")).forEach((shell, index) => shell.classList.toggle("spent", index >= stats.shots));
  }

  setStatus(message: string, tone: "quiet" | "teal" | "warning" = "quiet") {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone;
  }

  setCursor(x: number, y: number) { this.cursor.style.transform = `translate(${x}px, ${y}px)`; }
  setAimAssistLock(locked: boolean) { this.cursor.classList.toggle("is-locked", locked); }

  flashCursor(hit: boolean) {
    this.cursor.classList.remove("is-hit", "is-miss");
    void this.cursor.offsetWidth;
    this.cursor.classList.add(hit ? "is-hit" : "is-miss");
  }

  showOverlay(options: { phase: GamePhase; title: string; copy: string; button: string; action: () => void; detail?: string }) {
    this.overlayTitle.innerHTML = options.title;
    this.overlayCopy.textContent = options.copy;
    this.actionButton.innerHTML = `${options.button} <span>↗</span>`;
    this.action = options.action;
    this.overlayEl.dataset.phase = options.phase;
    this.overlayEl.classList.add("is-visible");
    this.select(".sheet-keyline", this.overlayEl).textContent = options.detail ?? "MOUSE / AIM + FIRE  •  A / ASSIST  •  R / RELOAD  •  P / PAUSE";
  }

  hideOverlay() { this.overlayEl.classList.remove("is-visible"); }

  showScoreStamp(points: number, label: string, x: number, y: number) {
    const stamp = document.createElement("div");
    stamp.className = "score-stamp";
    stamp.style.left = `${x}px`;
    stamp.style.top = `${y}px`;
    stamp.innerHTML = `<strong>+${points}</strong><span>${label}</span>`;
    this.root.appendChild(stamp);
    window.setTimeout(() => stamp.remove(), 760);
  }

  private select<T extends Element = HTMLElement>(selector: string, scope: ParentNode = this.root) {
    const node = scope.querySelector<T>(selector);
    if (!node) throw new Error(`HUD element missing: ${selector}`);
    return node;
  }

  private listen(target: EventTarget, event: string, handler: EventListener) {
    target.addEventListener(event, handler);
    this.cleanups.push(() => target.removeEventListener(event, handler));
  }

  dispose() {
    this.cleanups.forEach((cleanup) => cleanup());
    this.root.remove();
  }
}

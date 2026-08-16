// Field-Journal Arcade design: a single explicit round controller keeps the arcade loop crisp while the marsh remains calm.
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import "@babylonjs/core/Culling/ray";
import type { Scene } from "@babylonjs/core/scene";
import { AudioManager } from "@/game/AudioManager";
import { DuckTarget } from "@/game/DuckTarget";
import { Environment } from "@/game/Environment";
import { HudLayer } from "@/game/HudLayer";
import { ROUND_TARGETS, STARTING_SHOTS, STORAGE_KEY, TARGET_DATA, getQuota } from "@/game/constants";
import type { GamePhase, GameStats, TargetVariant } from "@/game/types";

interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export class GameWorld {
  private readonly environment: Environment;
  private readonly hud: HudLayer;
  private readonly audio = new AudioManager();
  private readonly targets: DuckTarget[] = [];
  private phase: GamePhase = "title";
  private previousPhase: GamePhase = "launching";
  private currentTarget: DuckTarget | null = null;
  private launchDelay = 0;
  private demoTimer = 0;
  private readonly demoEnabled = new URLSearchParams(window.location.search).has("demo");
  private stats: GameStats;
  private lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  private deferredInstallPrompt: DeferredInstallPrompt | null = null;
  private readonly onPointerMove: (event: PointerEvent) => void;
  private readonly onPointerDown: (event: PointerEvent) => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly onFullscreenChange: () => void;

  constructor(private readonly scene: Scene, private readonly canvas: HTMLCanvasElement) {
    this.stats = this.makeStats(this.readHighScore());
    this.environment = new Environment(scene);
    const parent = canvas.parentElement;
    if (!parent) throw new Error("Game canvas requires a parent element.");
    this.hud = new HudLayer(parent, { onStart: () => this.startOrRestart(), onPause: () => this.togglePause(), onSound: () => this.toggleSound(), onAssist: () => this.toggleAimAssist(), onInstall: () => this.installGame(), onFullscreen: () => this.toggleFullscreen() });
    this.onPointerMove = (event) => { this.lastPointer = { x: event.clientX, y: event.clientY }; this.hud.setCursor(event.clientX, event.clientY); this.refreshAimLock(); };
    this.onPointerDown = (event) => { event.preventDefault(); this.audio.unlock(); this.shoot(event.clientX, event.clientY); };
    this.onKeyDown = (event) => this.handleKey(event);
    this.onFullscreenChange = () => this.hud.setFullscreenState(Boolean(document.fullscreenElement));
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("beforeinstallprompt", this.onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", this.onAppInstalled);
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
    this.hud.setCursor(window.innerWidth / 2, window.innerHeight / 2);
    this.hud.setInstallState(window.matchMedia("(display-mode: standalone)").matches ? "installed" : "ready");
    this.updateHud();
    this.showTitle();
  }

  update(delta: number) {
    this.environment.update(delta);
    this.refreshAimLock();
    if (this.demoEnabled && this.phase === "title") {
      this.demoTimer += delta;
      if (this.demoTimer > 0.8) this.startOrRestart(true);
    }
    if (this.phase !== "launching") return;
    this.launchDelay -= delta;
    if (!this.currentTarget && this.launchDelay <= 0 && this.stats.launched < ROUND_TARGETS) this.spawnTarget();
    this.currentTarget?.update(delta);
    if (this.currentTarget?.isResolved) this.resolveTarget(this.currentTarget);
    if (this.demoEnabled && this.currentTarget?.status === "flying") {
      this.demoTimer += delta;
      if (this.demoTimer > 0.72) {
        this.demoTimer = 0;
        this.registerHit(this.currentTarget, window.innerWidth * 0.54, window.innerHeight * 0.43);
      }
    }
  }

  startOrRestart(demo = false) {
    if (!demo) this.audio.unlock();
    this.clearTargets();
    this.stats = this.makeStats(Math.max(this.stats.highScore, this.stats.score));
    this.phase = "launching";
    this.launchDelay = 0.7;
    this.demoTimer = 0;
    this.hud.hideOverlay();
    this.hud.setStatus("RANGE OPEN — FOLLOW THE FLIGHT LINE", "teal");
    this.updateHud();
  }

  private makeStats(highScore: number): GameStats {
    return { score: 0, highScore, round: 1, hits: 0, quota: getQuota(1), launched: 0, streak: 0, shots: STARTING_SHOTS, soundOn: true, aimAssistOn: true };
  }

  private spawnTarget() {
    this.stats.launched += 1;
    this.stats.shots = STARTING_SHOTS;
    const variant = this.pickVariant(this.stats.launched);
    this.currentTarget = new DuckTarget(this.scene, variant, this.stats.round, this.stats.launched);
    this.targets.push(this.currentTarget);
    this.audio.quack(variant);
    this.hud.setStatus(`${TARGET_DATA[variant].label} — THREE CARTRIDGES`, "quiet");
    this.updateHud();
  }

  private pickVariant(launch: number): TargetVariant {
    const roll = (Math.sin((this.stats.round * 31 + launch * 17) * 2.73) + 1) / 2;
    if (roll > 0.9) return "ivory";
    if (roll > 0.58) return "rust";
    return "kingfisher";
  }

  private shoot(clientX: number, clientY: number) {
    if (this.phase === "title" || this.phase === "gameOver") { this.startOrRestart(); return; }
    if (this.phase === "roundSummary") { this.nextRound(); return; }
    if (this.phase !== "launching" || !this.currentTarget || this.stats.shots <= 0) return;
    this.stats.shots -= 1;
    this.audio.shot();
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (clientY - rect.top) * (this.canvas.height / rect.height);
    const pick = this.scene.pick(x, y, (mesh) => this.isTargetMesh(mesh));
    const hitTarget = pick?.hit ? this.targets.find((target) => target.mesh === pick.pickedMesh) : undefined;
    const assistedTarget = !hitTarget ? this.getAimAssistTarget(clientX, clientY) : undefined;
    const target = hitTarget?.status === "flying" ? hitTarget : assistedTarget;
    if (target && target.status === "flying") this.registerHit(target, clientX, clientY, Boolean(assistedTarget));
    else {
      this.stats.streak = 0;
      this.audio.miss();
      this.hud.flashCursor(false);
      this.hud.setStatus(this.stats.shots === 0 ? "CARTRIDGES EMPTY — TARGET IS ESCAPING" : "WATERLINE DISTURBED — ADJUST YOUR LEAD", "warning");
    }
    this.updateHud();
  }

  private registerHit(target: DuckTarget, clientX: number, clientY: number, assisted = false) {
    if (!target.hit()) return;
    const data = TARGET_DATA[target.variant];
    const combo = this.stats.streak * 25;
    const points = data.points + combo;
    this.stats.score += points;
    this.stats.highScore = Math.max(this.stats.highScore, this.stats.score);
    this.stats.hits += 1;
    this.stats.streak += 1;
    this.audio.hit();
    this.hud.flashCursor(true);
    this.hud.showScoreStamp(points, assisted ? "TRACKING LOCK" : combo ? `${data.label} • STREAK` : data.label, clientX, clientY);
    this.hud.setStatus(assisted ? `TRACKING LOCK — +${points} FIELD SCORE` : `${data.label} — +${points} FIELD SCORE`, "teal");
    this.updateHud();
  }

  private resolveTarget(target: DuckTarget) {
    const hit = target.wasHit;
    const impactX = target.mesh.position.x;
    const impactY = target.mesh.position.y;
    if (hit) this.environment.pulseWater(impactX, impactY);
    else { this.stats.streak = 0; this.hud.setStatus("TARGET LOST IN THE REEDS", "warning"); }
    target.dispose();
    this.targets.splice(this.targets.indexOf(target), 1);
    this.currentTarget = null;
    this.stats.highScore = Math.max(this.stats.highScore, this.stats.score);
    this.persistHighScore();
    this.updateHud();
    if (this.stats.launched >= ROUND_TARGETS) this.finishRound();
    else this.launchDelay = 0.7;
  }

  private finishRound() {
    if (this.stats.hits >= this.stats.quota) {
      const clean = this.stats.hits === ROUND_TARGETS;
      const bonus = clean ? 700 : this.stats.hits * 45;
      this.stats.score += bonus;
      this.stats.highScore = Math.max(this.stats.highScore, this.stats.score);
      this.persistHighScore();
      this.phase = "roundSummary";
      this.audio.clear();
      this.hud.showOverlay({ phase: "roundSummary", title: clean ? "PERFECT<br /><i>FLIGHT</i>" : "RANGE<br /><i>CLEARED</i>", copy: clean ? `All ten targets recorded. A ${bonus}-point field bonus is entered in the ledger.` : `${this.stats.hits} confirmed sightings clear the quota. ${bonus} bonus points entered.`, button: "NEXT ROUND", action: () => this.nextRound(), detail: "ENTER / NEXT ROUND  •  P / PAUSE  •  M / SOUND" });
      this.hud.setStatus(`ROUND ${this.stats.round} COMPLETE — +${bonus} FIELD BONUS`, "teal");
      this.updateHud();
      return;
    }
    this.phase = "gameOver";
    this.hud.showOverlay({ phase: "gameOver", title: "RANGE<br /><i>COOLED</i>", copy: `${this.stats.hits} confirmed sightings fall short of the ${this.stats.quota} required. The marsh will be ready when you are.`, button: "REOPEN RANGE", action: () => this.startOrRestart(), detail: `FINAL FIELD SCORE ${String(this.stats.score).padStart(6, "0")}  •  ENTER / RESTART` });
    this.hud.setStatus("ROUND REQUIREMENT MISSED — RANGE COOLED", "warning");
  }

  private nextRound() {
    this.stats.round += 1;
    this.stats.hits = 0;
    this.stats.launched = 0;
    this.stats.streak = 0;
    this.stats.shots = STARTING_SHOTS;
    this.stats.quota = getQuota(this.stats.round);
    this.phase = "launching";
    this.launchDelay = 0.85;
    this.hud.hideOverlay();
    this.hud.setStatus(`ROUND ${this.stats.round} — FLIGHTS MOVING FASTER`, "teal");
    this.updateHud();
  }

  private togglePause() {
    if (this.phase === "launching") {
      this.previousPhase = this.phase;
      this.phase = "paused";
      this.hud.showOverlay({ phase: "paused", title: "FIELD NOTE<br /><i>PAUSED</i>", copy: "The water settles. Resume when your eye returns to the horizon.", button: "RESUME RANGE", action: () => this.togglePause(), detail: "P / RESUME  •  M / SOUND" });
    } else if (this.phase === "paused") {
      this.phase = this.previousPhase;
      this.hud.hideOverlay();
      this.hud.setStatus("RANGE RESUMED — TRACK THE FLIGHT LINE", "teal");
    }
  }

  private toggleSound() { this.audio.unlock(); this.stats.soundOn = this.audio.toggle(); this.updateHud(); }
  private async toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await this.canvas.parentElement?.requestFullscreen();
    } catch {
      this.hud.setStatus("FULL SCREEN IS BLOCKED — USE YOUR BROWSER MENU", "warning");
    }
  }
  private readonly onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    this.deferredInstallPrompt = event as DeferredInstallPrompt;
    this.hud.setInstallState("ready");
  };
  private readonly onAppInstalled = () => {
    this.deferredInstallPrompt = null;
    this.hud.setInstallState("installed");
    this.hud.setStatus("WILD MARSH INSTALLED — FIND IT IN YOUR APP LIST", "teal");
  };
  private async installGame() {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      this.hud.setInstallState("installed");
      this.hud.setStatus("WILD MARSH IS ALREADY INSTALLED", "teal");
      return;
    }
    if (!this.deferredInstallPrompt) {
      this.hud.setStatus("USE YOUR BROWSER MENU: INSTALL DUCK SHOOTER: WILD MARSH", "quiet");
      return;
    }
    await this.deferredInstallPrompt.prompt();
    const choice = await this.deferredInstallPrompt.userChoice;
    this.deferredInstallPrompt = null;
    this.hud.setStatus(choice.outcome === "accepted" ? "INSTALL REQUEST ACCEPTED — FINISH IN YOUR BROWSER" : "INSTALL CANCELED — THE RANGE REMAINS OPEN", choice.outcome === "accepted" ? "teal" : "quiet");
  }
  private toggleAimAssist() {
    this.stats.aimAssistOn = !this.stats.aimAssistOn;
    this.hud.setStatus(this.stats.aimAssistOn ? "AIM ASSIST READY — TEAL RETICLE MEANS LOCK" : "AIM ASSIST OFF — DIRECT SHOTS ONLY", this.stats.aimAssistOn ? "teal" : "quiet");
    this.refreshAimLock();
    this.updateHud();
  }

  private handleKey(event: KeyboardEvent) {
    if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
    if (event.key.toLowerCase() === "r" && this.phase === "launching" && this.currentTarget) {
      this.stats.shots = STARTING_SHOTS;
      this.hud.setStatus("CARTRIDGES RESEATED — KEEP THE LINE", "quiet");
      this.updateHud();
    }
    if (event.key.toLowerCase() === "p") this.togglePause();
    if (event.key.toLowerCase() === "m") this.toggleSound();
    if (event.key.toLowerCase() === "a") this.toggleAimAssist();
    if (event.key === "Enter") {
      if (this.phase === "title" || this.phase === "gameOver") this.startOrRestart();
      else if (this.phase === "roundSummary") this.nextRound();
    }
  }

  private isTargetMesh(mesh: AbstractMesh) { return mesh.name.startsWith("duck-"); }
  private refreshAimLock() { this.hud.setAimAssistLock(Boolean(this.getAimAssistTarget(this.lastPointer.x, this.lastPointer.y))); }
  private getAimAssistTarget(clientX: number, clientY: number) {
    const target = this.currentTarget;
    const camera = this.scene.activeCamera;
    if (!this.stats.aimAssistOn || this.phase !== "launching" || !target || target.status !== "flying" || !camera) return undefined;
    const { orthoLeft, orthoRight, orthoTop, orthoBottom } = camera;
    if ([orthoLeft, orthoRight, orthoTop, orthoBottom].some((value) => value === null)) return undefined;
    const rect = this.canvas.getBoundingClientRect();
    const worldWidth = (orthoRight as number) - (orthoLeft as number);
    const worldHeight = (orthoTop as number) - (orthoBottom as number);
    if (!worldWidth || !worldHeight) return undefined;
    const centerX = rect.left + ((target.mesh.position.x - (orthoLeft as number)) / worldWidth) * rect.width;
    const centerY = rect.top + (((orthoTop as number) - target.mesh.position.y) / worldHeight) * rect.height;
    const data = TARGET_DATA[target.variant];
    const radiusX = (data.width * target.mesh.scaling.x * rect.width / worldWidth) * 0.66 + 26;
    const radiusY = (data.height * target.mesh.scaling.y * rect.height / worldHeight) * 0.78 + 22;
    const distance = ((clientX - centerX) / radiusX) ** 2 + ((clientY - centerY) / radiusY) ** 2;
    return distance <= 1 ? target : undefined;
  }
  private updateHud() { this.hud.update(this.stats); }
  private showTitle() {
    this.hud.showOverlay({ phase: "title", title: "DUCK SHOOTER<br /><i>WILD MARSH</i>", copy: "The reeds are moving. Track the flight line; teal reticle means the range is helping you hold a target.", button: "OPEN THE RANGE", action: () => this.startOrRestart(), detail: "MOUSE / AIM + FIRE  •  A / ASSIST  •  R / RELOAD  •  P / PAUSE" });
    this.hud.setStatus("RANGE CLOSED — OBSERVE THE WATERLINE", "quiet");
  }
  private readHighScore() { const value = Number(window.localStorage.getItem(STORAGE_KEY)); return Number.isFinite(value) ? value : 0; }
  private persistHighScore() { window.localStorage.setItem(STORAGE_KEY, String(this.stats.highScore)); }
  private clearTargets() { this.targets.forEach((target) => target.dispose()); this.targets.length = 0; this.currentTarget = null; }

  dispose() {
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("beforeinstallprompt", this.onBeforeInstallPrompt as EventListener);
    window.removeEventListener("appinstalled", this.onAppInstalled);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    this.clearTargets();
    this.environment.dispose();
    this.hud.dispose();
  }
}

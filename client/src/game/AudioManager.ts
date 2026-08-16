export class AudioManager {
  private context: AudioContext | null = null;
  private enabled = true;

  unlock() {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") void this.context.resume();
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  shot() {
    this.tone(124, 0.075, "square", 0.07, 74);
    this.tone(52, 0.11, "triangle", 0.08, 34);
  }

  quack(variant: "kingfisher" | "rust" | "ivory" = "kingfisher") {
    const base = variant === "ivory" ? 360 : variant === "rust" ? 300 : 250;
    this.tone(base, 0.16, "sawtooth", 0.045, base * 0.58);
    window.setTimeout(() => this.tone(base * 0.72, 0.13, "square", 0.028, base * 0.42), 85);
  }

  hit() {
    this.tone(660, 0.09, "sine", 0.075, 900);
    this.tone(990, 0.14, "sine", 0.055, 1240);
  }

  miss() {
    this.tone(170, 0.09, "triangle", 0.035, 118);
  }

  clear() {
    this.tone(523, 0.12, "sine", 0.065, 659);
    window.setTimeout(() => this.tone(784, 0.2, "sine", 0.07, 1047), 110);
  }

  private tone(frequency: number, duration: number, type: OscillatorType, gainValue: number, endFrequency: number) {
    if (!this.context || !this.enabled || this.context.state !== "running") return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), this.context.currentTime + duration);
    gain.gain.setValueAtTime(gainValue, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration + 0.02);
  }
}


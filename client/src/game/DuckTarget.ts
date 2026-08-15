// Field-Journal Arcade design: generated birds remain the readable action silhouette against the scenic marsh.
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";
import { TARGET_DATA, getFlightDuration } from "@/game/constants";
import type { TargetStatus, TargetVariant } from "@/game/types";

export class DuckTarget {
  readonly mesh: Mesh;
  readonly variant: TargetVariant;
  status: TargetStatus = "flying";
  private elapsed = 0;
  private readonly duration: number;
  private readonly direction: number;
  private readonly startX: number;
  private readonly startY: number;
  private readonly arcHeight: number;
  private readonly wave: number;
  private fallVelocity = 0;
  private fallRotation = 0;
  private texture: Texture;
  private material: StandardMaterial;

  constructor(scene: Scene, variant: TargetVariant, round: number, launch: number) {
    this.variant = variant;
    const data = TARGET_DATA[variant];
    const seeded = (Math.sin((round * 12.9898 + launch * 78.233) * 43758.5453) + 1) / 2;
    this.direction = launch % 2 === 0 ? 1 : -1;
    this.startX = this.direction === 1 ? -18 : 18;
    this.startY = -1.1 + seeded * 4.7;
    this.arcHeight = 1.6 + (1 - seeded) * 2.2;
    this.wave = seeded * Math.PI * 2;
    this.duration = getFlightDuration(round) * (0.92 + seeded * 0.18);

    this.mesh = MeshBuilder.CreatePlane(`duck-${round}-${launch}`, { width: data.width, height: data.height }, scene);
    this.mesh.position = new Vector3(this.startX, this.startY, 1.6);
    this.mesh.isPickable = true;
    this.texture = new Texture(data.texture, scene, true, false);
    this.texture.hasAlpha = true;
    this.texture.vScale = -1;
    this.material = new StandardMaterial(`duck-mat-${round}-${launch}`, scene);
    this.material.diffuseTexture = this.texture;
    this.material.emissiveTexture = this.texture;
    this.material.useAlphaFromDiffuseTexture = true;
    this.material.backFaceCulling = false;
    this.material.disableLighting = true;
    this.mesh.material = this.material;
  }

  get isResolved() { return this.status === "resolved"; }
  get wasHit() { return this.status === "falling" || (this.status === "resolved" && this.fallVelocity > 0); }

  update(delta: number) {
    this.elapsed += delta;
    if (this.status === "flying") {
      const progress = Math.min(1, this.elapsed / this.duration);
      this.mesh.position.x = this.startX + this.direction * 37 * progress;
      this.mesh.position.y = this.startY + Math.sin(progress * Math.PI) * this.arcHeight + Math.sin(progress * Math.PI * 3 + this.wave) * 0.46;
      this.mesh.rotation.z = this.direction * (0.12 + Math.cos(progress * Math.PI * 3 + this.wave) * 0.1);
      this.mesh.scaling.y = 1 + Math.sin(this.elapsed * 8 + this.wave) * 0.045;
      if (progress >= 1) {
        this.status = "escaped";
        this.status = "resolved";
      }
      return;
    }
    if (this.status === "falling") {
      this.fallVelocity += 17 * delta;
      this.mesh.position.y -= this.fallVelocity * delta;
      this.mesh.rotation.z += this.fallRotation * delta;
      this.mesh.position.x += this.direction * 1.1 * delta;
      this.mesh.scaling.scaleInPlace(1 - delta * 0.13);
      if (this.mesh.position.y < -10) this.status = "resolved";
    }
  }

  hit() {
    if (this.status !== "flying") return false;
    this.status = "falling";
    this.fallVelocity = 1.5;
    this.fallRotation = this.direction * 5.2;
    this.mesh.isPickable = false;
    return true;
  }

  dispose() {
    this.mesh.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}

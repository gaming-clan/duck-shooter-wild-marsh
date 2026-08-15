// Field-Journal Arcade design: the generated marsh is extended with restrained ink-like reeds, waterlines, and clouds.
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";
import { ASSETS } from "@/game/constants";

export class Environment {
  private readonly decor: AbstractMesh[] = [];
  private time = 0;

  constructor(private readonly scene: Scene) {
    this.makeBackdrop();
    this.makeWaterLines();
    this.makeReeds();
    this.makeClouds();
  }

  update(delta: number) {
    this.time += delta;
    this.decor.forEach((mesh, index) => {
      if (mesh.name.startsWith("reed")) mesh.rotation.z = Math.sin(this.time * 0.72 + index * 0.49) * 0.025;
      if (mesh.name.startsWith("cloud")) {
        mesh.position.x += (index % 2 === 0 ? 1 : -1) * delta * 0.035;
        if (Math.abs(mesh.position.x) > 19) mesh.position.x *= -1;
      }
    });
  }

  pulseWater(x: number, y: number) {
    const ripple = MeshBuilder.CreateDisc(`ripple-${Date.now()}`, { radius: 0.2, tessellation: 36 }, this.scene);
    ripple.position = new Vector3(x, Math.max(-5.2, y), 3.2);
    const material = this.colorMaterial(`ripple-mat-${Date.now()}`, new Color3(0.76, 0.89, 0.82), 0.66);
    ripple.material = material;
    ripple.isPickable = false;
    let age = 0;
    const observer = this.scene.onBeforeRenderObservable.add(() => {
      age += this.scene.getEngine().getDeltaTime() / 1000;
      ripple.scaling.setAll(1 + age * 3.7);
      material.alpha = Math.max(0, 0.66 - age * 0.72);
      if (age > 0.95) {
        this.scene.onBeforeRenderObservable.remove(observer);
        ripple.dispose();
        material.dispose();
      }
    });
  }

  private makeBackdrop() {
    const backdrop = MeshBuilder.CreatePlane("marsh-backdrop", { width: 34, height: 19.2 }, this.scene);
    backdrop.position = new Vector3(0, 0, 9);
    const texture = new Texture(ASSETS.background, this.scene, true, false);
    texture.vScale = -1;
    const material = new StandardMaterial("marsh-background-material", this.scene);
    material.diffuseTexture = texture;
    material.emissiveColor = new Color3(0.78, 0.82, 0.75);
    material.disableLighting = true;
    material.backFaceCulling = false;
    backdrop.material = material;
    backdrop.isPickable = false;
    this.decor.push(backdrop);
  }

  private makeWaterLines() {
    for (let index = 0; index < 18; index += 1) {
      const line = MeshBuilder.CreatePlane(`water-line-${index}`, { width: 3.8 + (index % 4) * 2.2, height: 0.028 }, this.scene);
      line.position = new Vector3(-14 + ((index * 5.1) % 27), -2.2 - (index % 6) * 0.74, 3.9);
      line.material = this.colorMaterial(`water-line-mat-${index}`, new Color3(0.75, 0.9, 0.82), 0.18 + (index % 3) * 0.035);
      line.isPickable = false;
      this.decor.push(line);
    }
  }

  private makeReeds() {
    for (let index = 0; index < 42; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (12.3 + (index % 7) * 0.55);
      const height = 2.1 + (index % 6) * 0.46;
      const reed = MeshBuilder.CreatePlane(`reed-${index}`, { width: 0.12 + (index % 3) * 0.03, height }, this.scene);
      reed.position = new Vector3(x, -5.4 + height / 2, 1.1 + (index % 4) * 0.12);
      reed.rotation.z = side * 0.08;
      reed.material = this.colorMaterial(`reed-mat-${index}`, index % 3 === 0 ? new Color3(0.14, 0.29, 0.19) : new Color3(0.27, 0.37, 0.18), 0.96);
      reed.isPickable = false;
      this.decor.push(reed);
    }
  }

  private makeClouds() {
    for (let index = 0; index < 6; index += 1) {
      const cloud = MeshBuilder.CreateDisc(`cloud-${index}`, { radius: 0.85 + (index % 3) * 0.25, tessellation: 32 }, this.scene);
      cloud.position = new Vector3(-12 + index * 4.6, 5.2 + (index % 2) * 1.1, 7.6);
      cloud.scaling.x = 2.5;
      cloud.scaling.y = 0.6;
      cloud.material = this.colorMaterial(`cloud-mat-${index}`, new Color3(1, 0.89, 0.72), 0.11);
      cloud.isPickable = false;
      this.decor.push(cloud);
    }
  }

  private colorMaterial(name: string, color: Color3, alpha: number) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = color;
    material.emissiveColor = color;
    material.alpha = alpha;
    material.disableLighting = true;
    material.backFaceCulling = false;
    return material;
  }

  dispose() { this.decor.forEach((mesh) => mesh.dispose()); }
}

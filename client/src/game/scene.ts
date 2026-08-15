// Field-Journal Arcade design: a stable orthographic camera frames the marsh like a premium shooting-gallery diorama.
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "@/game/GameWorld";

export interface GameHandle { scene: Scene; dispose: () => void; }

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.08, 0.19, 0.19, 1);
  const camera = new FreeCamera("field-camera", new Vector3(0, 0, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ = 0.1;
  camera.maxZ = 100;
  const resizeCamera = () => {
    const ratio = Math.max(0.7, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    const vertical = 18;
    camera.orthoTop = vertical / 2;
    camera.orthoBottom = -vertical / 2;
    camera.orthoLeft = (-vertical * ratio) / 2;
    camera.orthoRight = (vertical * ratio) / 2;
  };
  resizeCamera();
  const world = new GameWorld(scene, canvas);
  const observer = scene.onBeforeRenderObservable.add(() => { resizeCamera(); world.update(engine.getDeltaTime() / 1000); });
  return { scene, dispose: () => { scene.onBeforeRenderObservable.remove(observer); world.dispose(); scene.dispose(); } };
}


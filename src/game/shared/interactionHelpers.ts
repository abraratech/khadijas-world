import {
  ActionManager,
  type AbstractMesh,
  ExecuteCodeAction,
  type Scene,
} from "@babylonjs/core";

export function registerPickInteraction(
  scene: Scene,
  mesh: AbstractMesh,
  callback: () => void,
): () => void {
  mesh.actionManager ??= new ActionManager(scene);
  const action = mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, callback),
  );
  return () => {
    if (action) mesh.actionManager?.unregisterAction(action);
  };
}

export class DisposableBag {
  private cleanups: Array<() => void> = [];
  private disposed = false;

  add(cleanup: () => void): () => void {
    if (this.disposed) {
      cleanup();
      return cleanup;
    }
    this.cleanups.push(cleanup);
    return cleanup;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const cleanup of this.cleanups.splice(0).reverse()) cleanup();
  }
}

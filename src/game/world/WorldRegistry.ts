import type { RoomId } from "../storage";

export const WORLD_LOCATION_IDS = [
  "home",
  "bedroom",
  "street",
  "cafe",
  "park",
  "grocery",
] as const satisfies readonly RoomId[];

export interface LocationLifecycle<Id extends string = string> {
  id: Id;
  activate(): void;
  deactivate(): void;
  dispose(): void;
}

export class WorldRegistry<T extends LocationLifecycle> {
  private readonly locations = new Map<T["id"], T>();
  private current: T | null = null;
  private disposed = false;

  register(location: T): T {
    if (this.disposed) throw new Error("Cannot register a disposed world.");
    if (this.locations.has(location.id)) {
      throw new Error(`Location "${location.id}" is already registered.`);
    }
    this.locations.set(location.id, location);
    return location;
  }

  get(id: T["id"]): T {
    const location = this.locations.get(id);
    if (!location) throw new Error(`Unknown location "${id}".`);
    return location;
  }

  activate(id: T["id"]): T {
    if (this.disposed) throw new Error("Cannot activate a disposed world.");
    const next = this.get(id);
    if (this.current === next) return next;
    this.current?.deactivate();
    next.activate();
    this.current = next;
    return next;
  }

  active(): T | null {
    return this.current;
  }

  values(): T[] {
    return [...this.locations.values()];
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.current?.deactivate();
    this.current = null;
    for (const location of this.locations.values()) location.dispose();
    this.locations.clear();
  }
}

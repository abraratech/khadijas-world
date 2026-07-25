export interface ExclusiveInteractionSlot {
  id: string;
  occupiedBy: string | null;
}

export class ExclusiveInteractionSlotRegistry<T extends ExclusiveInteractionSlot> {
  constructor(private readonly slots: readonly T[]) {}

  claim(slotId: string, occupantId: string): boolean {
    const slot = this.slots.find((candidate) => candidate.id === slotId);
    if (!slot || (slot.occupiedBy && slot.occupiedBy !== occupantId)) return false;
    this.release(occupantId);
    slot.occupiedBy = occupantId;
    return true;
  }

  release(occupantId: string): void {
    for (const slot of this.slots) {
      if (slot.occupiedBy === occupantId) slot.occupiedBy = null;
    }
  }

  available(slotId: string): boolean {
    const slot = this.slots.find((candidate) => candidate.id === slotId);
    return Boolean(slot && !slot.occupiedBy);
  }
}

import { describe, expect, it } from "vitest";
import {
  descriptorFromMetadata,
  humanizeInteractionId,
  interactionMetadata,
} from "./interactionReadability";

describe("interaction readability", () => {
  it("preserves existing gameplay metadata", () => {
    const result = interactionMetadata(
      { holdableId: "teddy", room: "home" },
      { label: "Teddy bear", hint: "Pick up", icon: "🧸", room: "home" },
    );
    expect(result.holdableId).toBe("teddy");
    expect(result.interactionLabel).toBe("Teddy bear");
  });

  it("rejects incomplete descriptors", () => {
    expect(descriptorFromMetadata({ interactionLabel: "Book" })).toBeNull();
  });

  it("reads safe descriptor fields", () => {
    expect(descriptorFromMetadata({
      interactionLabel: "  Shopping   basket ",
      interactionHint: " Pick up or fill with groceries ",
      interactionIcon: "🧺",
      room: "grocery",
    })).toEqual({
      label: "Shopping basket",
      hint: "Pick up or fill with groceries",
      icon: "🧺",
      room: "grocery",
    });
  });

  it("turns stable IDs into readable names", () => {
    expect(humanizeInteractionId("shop-tea-leaves")).toBe("Tea Leaves");
  });
});

import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createDefaultNpcStates,
  normalizeNpcStates,
} from "./livingCharacters";

describe("Ms. Sana station orientation", () => {
  it("faces into the cafe instead of toward the back wall", () => {
    const defaults = createDefaultNpcStates();

    expect(
      defaults["cafe-worker"].rotationY,
    ).toBe(0);

    expect(
      defaults.shopkeeper.rotationY,
    ).toBe(Math.PI);
  });

  it("repairs the old saved reverse orientation", () => {
    const normalized = normalizeNpcStates({
      "cafe-worker": {
        rotationY: Math.PI,
      },
    });

    expect(
      normalized["cafe-worker"].rotationY,
    ).toBe(0);
  });
});

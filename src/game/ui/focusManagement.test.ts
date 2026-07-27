import { describe, expect, it } from "vitest";
import {
  isTextEntryElement,
  nextFocusIndex,
} from "./focusManagement";

describe("focus management", () => {
  it("wraps forward from the final control", () => {
    expect(nextFocusIndex(4, 3, 1)).toBe(0);
  });

  it("wraps backward from the first control", () => {
    expect(nextFocusIndex(4, 0, -1)).toBe(3);
  });

  it("starts at the first control when focus is outside", () => {
    expect(nextFocusIndex(4, -1, 1)).toBe(0);
  });

  it("starts at the last control when reverse focus is outside", () => {
    expect(nextFocusIndex(4, -1, -1)).toBe(3);
  });

  it("returns no target for an empty focus layer", () => {
    expect(nextFocusIndex(0, -1, 1)).toBe(-1);
  });

  it("recognizes form fields as text-entry targets", () => {
    expect(isTextEntryElement("INPUT")).toBe(true);
    expect(isTextEntryElement("textarea")).toBe(true);
    expect(isTextEntryElement("select")).toBe(true);
    expect(isTextEntryElement("button")).toBe(false);
  });

  it("recognizes contenteditable controls", () => {
    expect(isTextEntryElement("div", true)).toBe(true);
  });
});

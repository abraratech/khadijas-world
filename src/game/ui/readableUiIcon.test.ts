import {
  describe,
  expect,
  it,
} from "vitest";
import { readableUiIcon } from "./readableUiIcon";

describe("readableUiIcon", () => {
  it("keeps correctly decoded icons", () => {
    expect(
      readableUiIcon("\u{1f6cf}\ufe0f"),
    ).toBe("\u{1f6cf}\ufe0f");

    expect(
      readableUiIcon("\u2615"),
    ).toBe("\u2615");
  });

  it("replaces mojibake and empty values", () => {
    expect(
      readableUiIcon(
        "\u00f0\u0178\u203a\ufffd\u00ef\u00b8\ufffd",
      ),
    ).toBe("\u2726");

    expect(readableUiIcon("   ")).toBe("\u2726");
  });
});

import { describe, expect, it } from "vitest";
import { RELEASE } from "./release";

describe("production release metadata", () => {
  it("publishes complete production identifiers", () => {
    expect(RELEASE.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(RELEASE.build).toBe("content-1-neighborhood-adventures");
    expect(RELEASE.channel).toBe("production");
    expect(RELEASE.productionPath).toBe("/");
  });

  it("does not expose placeholder support or policy metadata", () => {
    expect(RELEASE.supportContact.toLowerCase()).not.toContain("pending");
    expect(RELEASE.supportUrl).toMatch(/^https:\/\//);
    expect(RELEASE.privacyDocumentVersion).toBe("1.1");
    expect(RELEASE.accessibilityDocumentVersion).toBe("1.0");
  });
});

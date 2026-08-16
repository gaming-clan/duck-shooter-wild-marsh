import { describe, expect, it } from "vitest";
import { TARGET_DATA, getQuota } from "@/game/constants";

describe("Wild Marsh gameplay rules", () => {
  it("keeps round quotas capped and increasing", () => {
    expect(getQuota(1)).toBe(4);
    expect(getQuota(5)).toBe(7);
    expect(getQuota(20)).toBe(9);
  });

  it("provides a bundled texture and positive score for every duck variant", () => {
    for (const target of Object.values(TARGET_DATA)) {
      expect(target.texture).toMatch(/^\/wild-marsh-assets\/duck-.*\.png$/);
      expect(target.points).toBeGreaterThan(0);
      expect(target.width).toBeGreaterThan(0);
      expect(target.height).toBeGreaterThan(0);
    }
  });
});

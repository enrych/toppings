import { expect } from "chai";
import { formatRuntime } from "../../../../src/content_scripts/lib/formatRuntime";

describe("formatRuntime", () => {
  it("should format runtime with days, hours, minutes, and seconds", () => {
    const runtime = 186185; // 2 days, 3 hours, 43 minutes, and 5 seconds
    const result = formatRuntime(runtime);
    expect(result).to.equal("2 days, 3 hours, 43 minutes, 5 seconds");
  });

  it("should format runtime with hours, minutes, and seconds", () => {
    const runtime = 3725; // 1 hour, 2 minutes, and 5 seconds
    const result = formatRuntime(runtime);
    expect(result).to.equal("1 hour, 2 minutes, 5 seconds");
  });

  it("should format runtime with minutes and seconds", () => {
    const runtime = 185; // 3 minutes and 5 seconds
    const result = formatRuntime(runtime);
    expect(result).to.equal("3 minutes, 5 seconds");
  });

  it("should format runtime with seconds", () => {
    const runtime = 45; // 45 seconds
    const result = formatRuntime(runtime);
    expect(result).to.equal("45 seconds");
  });

  it("should format runtime with 0 seconds", () => {
    const runtime = 0; // 0 seconds
    const result = formatRuntime(runtime);
    expect(result).to.equal("0 seconds");
  });

  it("should handle singular and plural units correctly", () => {
    const runtime = 90065; // 1 day, 1 hour, 1 minute, and 5 seconds
    const result = formatRuntime(runtime);
    expect(result).to.equal("1 day, 1 hour, 1 minute, 5 seconds");
  });

  it("should format runtime with multiple units correctly", () => {
    const runtime = 86461; // 1 day, 1 minute, 1 second
    const result = formatRuntime(runtime);
    expect(result).to.equal("1 day, 1 minute, 1 second");
  });

  it("should format runtime with hours and seconds", () => {
    const runtime = 3601; // 1 hour, 1 second
    const result = formatRuntime(runtime);
    expect(result).to.equal("1 hour, 1 second");
  });
});

import { expect } from "chai";
import { getWebAppContext } from "../../../src/background/webAppContext";
import { type WebAppContext } from "../../../src/background/webAppContext";

describe("getWebAppContext", () => {
  it("should return correct info for a supported YouTube playlist URL", () => {
    const testCase1 = "https://www.youtube.com/playlist?list=PL1234567890";
    const expectedResult1: WebAppContext = {
      appName: "youtube",
      isSupported: true,
      contextData: {
        webAppURL: {
          href: testCase1,
          origin: "https://www.youtube.com",
          protocol: "https:",
          route: ["playlist"],
          searchParams: new URLSearchParams("list=PL1234567890"),
        },
        contentId: "PL1234567890",
      },
    };
    console.log(getWebAppContext(testCase1));
    console.log(expectedResult1);
    expect(getWebAppContext(testCase1)).to.deep.equal(expectedResult1);
  });

  it("should return correct info for a supported YouTube video URL", () => {
    const testCase2 = "https://www.youtube.com/watch?v=ABCDEFGHIJK";
    const expectedResult2: WebAppContext = {
      appName: "youtube",
      isSupported: true,
      contextData: {
        webAppURL: {
          href: testCase2,
          origin: "https://www.youtube.com",
          protocol: "https:",
          route: ["watch"],
          searchParams: new URLSearchParams("v=ABCDEFGHIJK"),
        },
        contentId: "ABCDEFGHIJK",
      },
    };
    expect(getWebAppContext(testCase2)).to.deep.equal(expectedResult2);
  });

  it("should return unsupported for an unsupported URL", () => {
    const testCase3 = "https://example.com/";
    const expectedResult3: WebAppContext = {
      appName: null,
      isSupported: false,
      contextData: {
        webAppURL: {
          href: testCase3,
          origin: "https://example.com",
          protocol: "https:",
          route: [""],
          searchParams: new URLSearchParams(""),
        },
      },
    };
    expect(getWebAppContext(testCase3)).to.deep.equal(expectedResult3);
  });
});

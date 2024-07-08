import { expect } from "chai";
import sinon from "sinon";
import {
  getWebAppContext,
  WebAppContext,
} from "../../../../src/modules/background/webAppContext";
import youtubeWorkerConfig from "../../../../src/modules/content_scripts/workers/youtube/config";

describe("getWebAppContext", () => {
  describe("YouTube Parser", () => {
    const chromeMock = {
      storage: {
        sync: {
          get: sinon
            .stub()
            .yields({ workers: { youtube: youtubeWorkerConfig } }),
        },
      },
    };
    global.chrome = chromeMock as any;
    it("should return correct info for a supported YouTube playlist URL", async () => {
      const testCase1 = "https://www.youtube.com/playlist?list=PL1234567890";
      const expectedResult1: WebAppContext = {
        isSupported: true,
        appName: "youtube",
        workerConfig: youtubeWorkerConfig,
        contextData: {
          webAppURL: new URL(testCase1),
          activeRoute: "playlist",
          payload: { playlistID: "PL1234567890" },
        },
      };
      expect(await getWebAppContext(testCase1)).to.deep.equal(expectedResult1);
    });

    it("should return correct info for a supported YouTube video URL", async () => {
      const testCase2 = "https://www.youtube.com/watch?v=ABCDEFGHIJK";
      const expectedResult2: WebAppContext = {
        isSupported: true,
        appName: "youtube",
        workerConfig: youtubeWorkerConfig,
        contextData: {
          webAppURL: new URL(testCase2),
          activeRoute: "watch",
          payload: {
            videoID: "ABCDEFGHIJK",
          },
        },
      };
      expect(await getWebAppContext(testCase2)).to.deep.equal(expectedResult2);
    });

    it("should return unsupported for an unsupported URL", async () => {
      const testCase3 = "https://example.com/";
      const expectedResult3: WebAppContext = {
        isSupported: false,
        appName: null,
      };
      expect(await getWebAppContext(testCase3)).to.deep.equal(expectedResult3);
    });
  });
});

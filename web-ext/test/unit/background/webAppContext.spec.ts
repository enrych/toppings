import { expect } from "chai";
import sinon from "sinon";
import {
  getWebAppContext,
  WebAppContext,
} from "../../../src/background/webAppContext";
import youtubeConfig from "../../../src/content_scripts/webApps/youtube/webApp.config";

describe("getWebAppContext", () => {
  describe("YouTube Parser", () => {
    let chromeMock: any;
    let fetchStub: sinon.SinonStub;

    beforeEach(() => {
      chromeMock = {
        storage: {
          sync: {
            get: sinon.stub().yields({ webApps: { youtube: youtubeConfig } }),
          },
        },
      };
      global.chrome = chromeMock as any;

      fetchStub = sinon.stub(global, "fetch");
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should return correct info for a supported YouTube playlist URL", async () => {
      const testCase1 = "https://www.youtube.com/playlist?list=PL1234567890";

      fetchStub.resolves({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            num_videos: "50",
            playlist_id: "PL1234567890",
            avg_runtime: 300,
            total_runtime: 15000,
          },
        }),
      });

      const expectedResult1: WebAppContext = {
        isSupported: true,
        appName: "youtube",
        webAppConfig: youtubeConfig,
        contextData: {
          webAppURL: new URL(testCase1),
          activeRoute: "playlist",
          payload: {
            playlistId: "PL1234567890",
            averageRuntime: 300,
            totalRuntime: 15000,
            totalVideos: "50",
          },
        },
      };

      expect(await getWebAppContext(testCase1)).to.deep.equal(expectedResult1);
      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.calledWith(sinon.match.string)).to.be.true;
    });

    it("should return correct info for a supported YouTube video URL", async () => {
      const testCase2 = "https://www.youtube.com/watch?v=ABCDEFGHIJK";

      const expectedResult2: WebAppContext = {
        isSupported: true,
        appName: "youtube",
        webAppConfig: youtubeConfig,
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

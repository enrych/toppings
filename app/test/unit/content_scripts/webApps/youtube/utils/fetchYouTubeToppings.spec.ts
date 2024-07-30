import { expect } from "chai";
import { SERVER_BASE_URI } from "../../../../../../src/content_scripts/webApps/youtube/utils/fetchYouTubeToppings";

describe("SERVER_BASE_URI", () => {
  it("should use correct server URI", () => {
    expect(SERVER_BASE_URI).to.equal("https://toppings.onrender.com");
  });
});

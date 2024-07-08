import { expect } from "chai";
import { SERVER_BASE_URI } from "../../../../src/store";

describe("SERVER_BASE_URI", () => {
  it("should use correct server URI", () => {
    expect(SERVER_BASE_URI).to.equal("https://toppings.pythonanywhere.com/v1");
  });
});

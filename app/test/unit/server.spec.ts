import { expect } from "chai";
import { BASE_URI } from "../../src/server";

describe("BASE_URI", () => {
  it("should use correct server URI", () => {
    expect(BASE_URI).to.equal("https://toppings.pythonanywhere.com/v1");
  });
});

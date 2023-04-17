import { add } from "../add";

describe("src/utils/add.ts", () => {
  it("test add function", () => {
    expect(add(1, 2)).toBe(3);
  });
});

import { add } from "../add";

describe("src/utils/__test__/add.test.ts", () => {
  it("test add function", () => {
    expect(add(1, 2)).toBe(3);
  });
});

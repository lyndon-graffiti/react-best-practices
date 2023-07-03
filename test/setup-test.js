import "@testing-library/jest-dom";
import { toMatchDiffSnapshot } from "snapshot-diff";

expect.extend({ toMatchDiffSnapshot });

beforeEach(() => {
  jest.restoreAllMocks();
});

// -- module mock
jest.mock("lodash-es", () => {
  return jest.requireActual("lodash");
});

window.HTMLCanvasElement.prototype.getContext = () => {};

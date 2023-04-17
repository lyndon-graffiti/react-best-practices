import ImageComponent from "..";
import { render, act } from "@testing-library/react";

const setup = () => {
  // @ts-ignore
  global.Image = class {
    constructor() {
      setTimeout(() => {
        // @ts-ignore
        if (this.src === "failed") {
          // @ts-ignore
          this.onerror("error");
        } else {
          // @ts-ignore
          this.onload();
        }
      }, 100);
    }
  };
};

describe("src/components/Image/index.tsx", () => {
  beforeAll(() => {
    setup();
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("render image success", async () => {
    const { container, asFragment } = render(
      <ImageComponent src="success.url" />
    );
    expect(container.querySelector(".ant-spin-dot")).toBeTruthy();
    await act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelector(".ant-spin-dot")).toBeFalsy();
    expect(asFragment()).toMatchSnapshot();
  });

  it("render image failed", async () => {
    const { container, asFragment } = render(<ImageComponent src="failed" />);
    expect(container.querySelector(".ant-spin-dot")).toBeTruthy();
    await act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelector(".ant-spin-dot")).toBeFalsy();
    expect(asFragment()).toMatchSnapshot();
  });
});

import { render, screen } from "@testing-library/react";
import VirtualScrollContainer from "..";
import type { VariableSizeList } from "react-window";

describe("virtual scroll container", () => {
  const stub = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useFakeTimers();
  });

  it("should render", () => {
    const { container } = render(
      <div style={{ height: 400 }}>
        <VirtualScrollContainer
          initialLoading={false}
          reload={stub}
          loadMore={stub}
          noMore={true}
          list={["123"]}
          getItemHeight={() => 100}
          renderItem={(item) => item}
          getKey={(ele) => ele}
        />
      </div>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("render empty", () => {
    const { container } = render(
      <div style={{ height: 400 }}>
        <VirtualScrollContainer
          initialLoading={false}
          reload={stub}
          loadMore={stub}
          renderEmpty={<div id="empty">empty</div>}
          noMore={true}
          list={[]}
          getItemHeight={() => 100}
          renderItem={(item) => item}
          getKey={(ele) => ele}
        />
      </div>
    );
    expect(container.querySelector("#empty")).toBeTruthy();
  });

  it("render more", () => {
    render(
      <div style={{ height: 400 }}>
        <VirtualScrollContainer
          initialLoading={false}
          reload={stub}
          loadMore={stub}
          noMore={true}
          list={["1"]}
          getItemHeight={() => 100}
          renderItem={(item) => item}
          getKey={(ele) => ele}
        />
      </div>
    );
    expect(screen.getByText("没有更多了")).toBeTruthy();
  });

  it("no more", () => {
    render(
      <div style={{ height: 400 }}>
        <VirtualScrollContainer
          initialLoading={false}
          reload={stub}
          loadMore={stub}
          noMore={false}
          list={["1"]}
          getItemHeight={() => 100}
          renderItem={(item) => item}
          getKey={(ele) => ele}
        />
      </div>
    );
    expect(screen.getByText("上拉加载更多")).toBeTruthy();
  });

  it("scroll and virtual render", () => {
    let virtualList: VariableSizeList | null;
    const reload = jest.fn();
    const loadMore = jest.fn();
    const { container, rerender } = render(
      <div style={{ height: 400 }}>
        <VirtualScrollContainer
          ref={(r) => (virtualList = r)}
          initialLoading={false}
          reload={reload}
          loadMore={loadMore}
          noMore={false}
          list={[{ id: 1 }, { id: 2 }, { id: 3 }]}
          getItemHeight={() => 100}
          renderItem={(item) => <div className="test-item">{item.id}</div>}
          getKey={(ele) => ele.id}
        />
      </div>
    );

    expect(container.querySelectorAll(".test-item").length).toBe(3);

    rerender(
      <div style={{ height: 400 }}>
        <VirtualScrollContainer
          ref={(r) => (virtualList = r)}
          initialLoading={false}
          reload={reload}
          loadMore={loadMore}
          noMore={false}
          list={[
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
            { id: 6 },
          ]}
          getItemHeight={() => 100}
          renderItem={(item) => <div className="test-item">{item.id}</div>}
          getKey={(ele) => ele.id}
        />
      </div>
    );
    let count = 0;
    expect(container.querySelectorAll(".test-item").length).toBe(4);
    container.querySelectorAll(".test-item").forEach((ele, i) => {
      expect(ele.innerHTML).toBe(`${i + 1}`);
      count += 1;
    });
    expect(count).toBe(4);
    virtualList!.scrollTo(900);
    expect(container.querySelectorAll(".test-item").length).toBe(3);
    container.querySelectorAll(".test-item").forEach((ele, i) => {
      expect(ele.innerHTML).toBe(`${i + 1 + 3}`);
      count += 1;
    });
    expect(count).toBe(7);
  });
});

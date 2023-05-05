import { PullToRefresh, Empty } from "antd-mobile";
import { useDebounceFn, useLatest, useMemoizedFn, useSize } from "ahooks";
import React, {
  CSSProperties,
  forwardRef,
  memo,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { VariableSizeList, ListOnScrollProps, areEqual } from "react-window";
import styles from "./index.module.scss";
import LoadingIndicator from "./loadingIndicator";
import { useInViewport } from "ahooks";
import { noop } from "lodash-es";

export interface Props<T extends any = any> {
  /** 下拉加载列表数据，可直接使用 useInfiniteScroll 的 reloadAsync */
  reload?: () => Promise<any>;
  /** 加载更多方法，可直接使用 useInfiniteScroll 的 loadMoreAsync */
  loadMore: () => Promise<any>;
  /** 没有更多了 */
  noMore: boolean;
  /** 列表数据 */
  list: T[];
  /** 当卡片高度可被计算时，传入此高度可以提高性能 */
  getItemHeight?: (item: T, index: number) => number;
  /** 当卡片高度需要自动计算时，不在 viewport 中未被渲染的卡片使用的默认高度 */
  estimateHeight?: number;
  /** 渲染卡片的函数，卡片的渲染被 deep memo，当需要更新卡片数据时，确保 getKey 的返回值会变化 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 渲染列表耗尽时的组件，默认 “没有更多了”，不带样式 */
  renderNoMore?: React.ReactNode;
  /** 渲染列表为空时的占位组件 */
  renderEmpty?: React.ReactNode;
  /** 两个卡片之间留空的距离，默认 16px */
  itemGap?: number;
  /** 卡片的渲染被 deep memo，当需要更新卡片数据时，确保 getKey 的返回值会变化 */
  getKey: (item: T, index: number) => React.Key;
  /** 是否在初始加载，初始加载时，不渲染 Empty 占位符 */
  initialLoading: boolean;
  /** Ref to attach to the outer container element. This is an advanced property. */
  outerRef?: React.Ref<any>;
  /** 外部容器的样式 */
  style?: React.CSSProperties;
  /** 滚动回调 */
  onScroll?: (e: ListOnScrollProps) => void;
  /** "下拉加载更多" | "加载更多" | "没有更多了" 区域，在虚拟列表中占用的高度 */
  indicatorHeight?: number;
  /** 是否开启下拉刷新 */
  pullRefresh?: boolean;
  /** 外部容器的高度，传入数字，默认占满父容器 */
  containerHeight?: number;
  /** 不渲染 "下拉加载更多" | "加载更多" | "没有更多了" 的区域 */
  noIndicator?: boolean;
  /**卡片曝光触发 */
  inViewerCallback?: (inView: boolean, item: T) => void;
}

export type VirtualListRef = VariableSizeList & {
  /** 未指定高度，采用自动计算的方式时，通知某个元素的高度发生变化需要重新计算 */
  updateHeight: (index: number, height: number) => void;
  /** 完全重置列表 */
  forceReset: () => void;
};

const Card = ({
  index,
  style,
  data,
}: {
  index: number;
  style: CSSProperties;
  data?: any;
}) => {
  let ref = useRef();
  const [inViewport] = useInViewport(ref);
  const { listRef, setHeightCache, getHeightCache, onCardInView, virtualList } =
    data;

  useEffect(() => {
    if (inViewport) {
      onCardInView(inViewport, listRef.current[index]);
    }
  }, [inViewport]);

  return (
    <div
      ref={(r) => {
        //@ts-ignore
        ref.current = r;
        if (!getHeightCache(index)) {
          setHeightCache(index, (r?.firstChild as any)?.clientHeight ?? 0);
          virtualList.current?.resetAfterIndex?.(index);
        }
      }}
      style={style}
    >
      {data.memoizedRender(listRef.current[index], index)}
    </div>
  );
};

const ItemCard = memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: CSSProperties;
    data?: any;
  }) => {
    const {
      isInitialLoading,
      isEmpty,
      isLoadingElement,
      renderEmptyRef,
      renderNoMoreRef,
      noMoreRef,
      loadingMoreRef,
      noIndicator,
    } = data;
    if (isInitialLoading()) {
      return null;
    }
    if (isEmpty(index)) {
      return <div className={styles.empty}>{renderEmptyRef.current}</div>;
    }
    if (isLoadingElement(index)) {
      if (noIndicator) {
        return null;
      }
      return (
        <LoadingIndicator
          renderNoMore={renderNoMoreRef.current}
          style={style}
          noMore={noMoreRef.current}
          loading={loadingMoreRef.current}
        />
      );
    }
    return <Card index={index} style={style} data={data} />;
  },
  areEqual
);

function ScrollContainer<T>(props: Props<T>, ref: Ref<VirtualListRef>) {
  const container = useRef<HTMLDivElement>(null);
  const {
    reload,
    list = [],
    getItemHeight,
    renderItem,
    itemGap = 16,
    indicatorHeight = 16,
    loadMore,
    noMore,
    getKey,
    renderEmpty = <Empty />,
    renderNoMore = "没有更多了",
    outerRef,
    style,
    onScroll,
    pullRefresh = true,
    estimateHeight = 100,
    containerHeight,
    noIndicator = false,
    inViewerCallback = noop,
  } = props;
  const [reloading, setReloading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allowRefresh, setAllowRefresh] = useState(true);
  const virtualList = useRef<
    VariableSizeList & { inViewerCallback?: (i: boolean, item: T) => void }
  >(null);
  const size = useSize(container);
  const heightCache = useRef<Record<string, number>>({});
  const getKeyRef = useLatest(getKey);
  const [key, setKey] = useState(0);

  const forceReset = useMemoizedFn(() => {
    heightCache.current = {};
    virtualList.current?.resetAfterIndex?.(0);
    virtualList.current?.scrollTo?.(0);
    setKey((k) => k + 1);
  });

  useImperativeHandle(ref, () =>
    Object.assign(virtualList.current!, {
      updateHeight: (index: number, height: number) => {
        setHeightCache(index, height);
        virtualList.current?.resetAfterIndex?.(index);
      },
      forceReset,
    })
  );

  const getHeight = useMemoizedFn((item: T, index: number) => {
    if (!getItemHeight) {
      const cache = heightCache.current[getKeyRef.current(item, index)];
      return cache || estimateHeight;
    }
    return getItemHeight(item, index);
  });

  useEffect(() => {
    virtualList.current?.resetAfterIndex?.(0);
  }, [size]);

  useEffect(() => {
    virtualList.current?.resetAfterIndex?.(0);
  }, [list.map((ele, index) => getKeyRef.current(ele, index)).join(",")]);

  const refreshWithLoading = useMemoizedFn(
    () =>
      new Promise(() => {
        setReloading(true);
        reload?.().finally(() => {
          setReloading(false);
        });
      })
  );

  // INFO: 性能优化，卡片内用到的方法全部 memo
  const isEmpty = useMemoizedFn((i: number) => i === list.length && i === 0);
  const isInitialLoading = useMemoizedFn(() => props.initialLoading);
  const isLoadingElement = useMemoizedFn(
    (i: number) => i === list.length && i !== 0
  );
  const memoizedRender = useMemoizedFn(renderItem);
  const listRef = useLatest(list);
  const renderEmptyRef = useLatest(renderEmpty);
  const renderNoMoreRef = useLatest(renderNoMore);
  const noMoreRef = useLatest(noMore);
  const loadingMoreRef = useLatest(loadingMore);
  const setHeightCache = useMemoizedFn(
    (index, height) =>
      (heightCache.current[getKeyRef.current(listRef.current[index], index)!] =
        height)
  );
  const onCardInView = useMemoizedFn(inViewerCallback);
  const getHeightCache = useMemoizedFn((index) => {
    return heightCache.current[
      getKeyRef.current(listRef.current[index], index)!
    ];
  });

  // see: https://react-window.vercel.app/#/examples/list/memoized-list-items
  const itemData = useMemo(() => {
    return {
      isInitialLoading,
      isEmpty,
      isLoadingElement,
      memoizedRender,
      listRef,
      renderEmptyRef,
      renderNoMoreRef,
      noMoreRef,
      loadingMoreRef,
      setHeightCache,
      getHeightCache,
      virtualList,
      noIndicator,
      onCardInView,
    };
  }, []);

  const { run: loadMoreWithLoading } = useDebounceFn(
    () => {
      if (noMore) {
        return;
      }
      setLoadingMore(true);
      loadMore().finally(() => {
        setLoadingMore(false);
      });
    },
    { wait: 300 }
  );

  const VirtualList = (
    <VariableSizeList
      key={key}
      ref={virtualList}
      outerRef={outerRef}
      overscanCount={3}
      onItemsRendered={(e) => {
        if (e.overscanStopIndex >= list.length) {
          loadMoreWithLoading();
        }
      }}
      onScroll={(e) => {
        if (onScroll) {
          onScroll(e);
        }
        setAllowRefresh(e.scrollOffset <= 0);
      }}
      itemKey={(index) =>
        list[index]
          ? getKeyRef.current(list[index], index)
          : `loading-indicator-${Date.now()}`
      }
      style={style}
      itemData={itemData}
      height={containerHeight || size?.height || 0}
      width={"100%"}
      itemCount={list.length + 1}
      itemSize={(i) =>
        i === list.length ? indicatorHeight : getHeight(list[i], i) + itemGap
      }
    >
      {ItemCard}
    </VariableSizeList>
  );

  return (
    <div ref={container} className={styles.pullContainer}>
      {pullRefresh ? (
        <PullToRefresh disabled={!allowRefresh} onRefresh={refreshWithLoading}>
          {VirtualList}
        </PullToRefresh>
      ) : (
        VirtualList
      )}
    </div>
  );
}

/**
 * 这是一个功能组件，只包含最基础的样式，需要修改样式请通过 className 传入，不要直接修改这个组件的基础样式，会影响两端的列表
 */
export default forwardRef(ScrollContainer) as <T>(
  p: Props<T> & { ref?: Ref<VirtualListRef> }
) => JSX.Element;

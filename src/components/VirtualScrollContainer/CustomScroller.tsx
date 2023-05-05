import React, {
  useRef,
  useEffect,
  RefObject,
  memo,
  forwardRef,
  Ref,
  useImperativeHandle,
} from "react";
import ScrollContainer, { Props, VirtualListRef } from ".";

type EndElement = HTMLElement | null | undefined;
export type DomLikeElement =
  | RefObject<EndElement>
  | EndElement
  | (() => EndElement);

interface WindowScrollerProps<T extends any = any>
  extends Omit<Props<T>, "outerRef" | "ref" | "list"> {
  scrollElement: DomLikeElement;
  /** 自定义滚动容器视口高度差 */
  getInitialScrollViewportDeltaInPx?: (boundingTop: number) => number;
  list: T[];
}

const isRef = (ele: DomLikeElement): ele is RefObject<EndElement> => {
  return (
    !!ele &&
    typeof ele === "object" &&
    "current" in (ele as RefObject<EndElement>)
  );
};

const getElement = (ele: DomLikeElement): EndElement => {
  if (typeof ele === "function") {
    return ele();
  }
  if (isRef(ele)) {
    return ele?.current;
  }
  return ele;
};

/**
 * 这是一个功能组件，支持传入自定义滚动容器，只包含最基础的样式，需要修改样式请通过 className 传入，不要直接修改这个组件的基础样式，会影响两端的列表
 */
const _CustomScroller = (
  props: WindowScrollerProps,
  ref: Ref<VirtualListRef>
) => {
  const {
    scrollElement,
    getInitialScrollViewportDeltaInPx = (ele) => ele,
    ...rest
  } = props;
  const virtualListRef = useRef<VirtualListRef | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    // @ts-ignore
    () => {
      return {
        ...(virtualListRef.current || {}),
        forceReset: () => {
          virtualListRef.current?.forceReset?.();
          try {
            const element = getElement(scrollElement);
            if (element) {
              element.scrollTop = 0;
            }
          } catch (e) {
            // element may unmount during forceReset
          }
        },
      };
    },
    []
  );

  useEffect(() => {
    const element = getElement(scrollElement);
    if (element) {
      const initialOffset = getInitialScrollViewportDeltaInPx(
        outerRef.current?.getBoundingClientRect().top || 0
      );
      const handleWindowScroll = () => {
        const scrollTop = (element?.scrollTop || 0) - initialOffset;
        if (virtualListRef) {
          virtualListRef.current?.scrollTo(scrollTop);
        }
      };
      element.addEventListener("scroll", handleWindowScroll, true);
      return () => {
        if (element) {
          element.removeEventListener("scroll", handleWindowScroll, true);
        }
      };
    }
    return () => {};
  }, []);

  return (
    <ScrollContainer
      {...rest}
      ref={virtualListRef}
      outerRef={outerRef}
      containerHeight={window.innerHeight}
      style={{ height: "100%", ...props.style }}
    />
  );
};

export const CustomScroller = memo(forwardRef(_CustomScroller)) as <T>(
  p: WindowScrollerProps<T> & { ref?: Ref<VirtualListRef> }
) => JSX.Element;

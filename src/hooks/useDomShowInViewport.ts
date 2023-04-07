import { useInViewport } from "ahooks";
import { useEffect, useRef } from "react";

const useDomShowInViewport = <T extends HTMLDivElement>(
  onShow: () => void,
  once: boolean = true
) => {
  const domRef = useRef<T>(null);
  const showed = useRef<boolean>(false);
  const [, ratio] = useInViewport(domRef, {
    threshold: [1],
  });

  useEffect(() => {
    if (ratio === 1 && !showed.current) {
      if (once) {
        showed.current = true;
      }
      onShow();
    }
  }, [ratio]);

  return { domRef };
};

export default useDomShowInViewport;

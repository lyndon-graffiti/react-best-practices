import { useRequest } from "ahooks";
import { Spin } from "antd";
import { ImgHTMLAttributes, ReactNode, memo, useMemo } from "react";

interface Props extends Partial<ImgHTMLAttributes<HTMLImageElement>> {
  // 加载中兜底图，false 可关闭
  renderLoading?: ReactNode;
  // 加载失败兜底图，false 可关闭
  renderError?: ReactNode;
  loadingDelay?: number;
}

const cache = new Set();

export const getImage = async (src: string): Promise<string> => {
  if (cache.has(src)) {
    return src;
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      cache.has(src);
      resolve(src);
    };
    image.onerror = (e) => {
      reject(e);
    };
  });
};

const MyImage = (props: Props) => {
  const {
    src = "",
    width = "100%",
    height = "100%",
    loadingDelay = 50,
    style,
    renderLoading = <Spin />,
    // TODO：替换为业务错误组件
    renderError = <Spin />,
    ...rest
  } = props || {};

  const image = useRequest(() => getImage(src), {
    loadingDelay,
    refreshDeps: [src],
  });

  const imageDiv = useMemo(
    () => (
      <div
        style={{
          width,
          height,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundImage: `url(${src})`,
          flexShrink: 0,
          ...style,
        }}
      />
    ),
    []
  );

  if (cache.has(src)) {
    return imageDiv;
  }

  if (image.error && !image.loading && renderError !== false) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width,
          height,
          ...style,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          image.refresh();
        }}
      >
        {renderError}
      </div>
    );
  }

  if (!image.data && renderLoading !== false) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width,
          height,
          ...style,
        }}
        {...(rest as any)}
      >
        {renderLoading}
      </div>
    );
  }

  return imageDiv;
};

export default memo(MyImage);

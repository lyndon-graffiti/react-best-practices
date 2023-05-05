import React, { CSSProperties, useMemo } from "react";
import styles from "./index.module.scss";

interface Props {
  loading: boolean;
  noMore: boolean;
  renderNoMore?: React.ReactNode;
  style: CSSProperties;
}

export default (props: Props) => {
  const text = useMemo(() => {
    if (props.loading) {
      return "加载中";
    }
    if (props.noMore) {
      return props.renderNoMore || "没有更多了";
    }
    return "上拉加载更多";
  }, [props.loading, props.noMore]);
  return (
    <div style={props.style} className={styles.indicator}>
      {text}
    </div>
  );
};

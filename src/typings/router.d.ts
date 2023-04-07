interface RouteConfig {
  name?: string;
  // 子路由的实际路径是父路由 + 子路由拼接而成
  path?: string;
  key: string;
  component?: ComponentType<any>;
  exact?: boolean;
  redirectTo?: string;
  isMenu?: boolean;
  icon?: ReactNode;
  children?: RouteConfig[];
  // 如果页面只是一个外链页面，可以使用这个参数，快速实现接入
  iframeSrc?: string;
  // 外链页面 iframe 容器样式自定义
  iframeStyle?: React.CSSProperties;
  // 是否使用 native 的导航栏，移动端生效
  useNativeNavBar?: boolean;
  // 当返回值满足 `Boolean(result) === true` 时，页面路由不会变动
  onMenuClick?(route: RouteConfig): unknown;
}

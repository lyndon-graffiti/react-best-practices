import { Page } from "../../models/page";

const Main = () => {
  const {
    state: { test },
    onChange,
  } = Page.useContainer();
  return <div onClick={onChange}>{test}</div>;
};

export default Main;

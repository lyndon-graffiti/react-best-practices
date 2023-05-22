import { Page } from "./models/page";
import Main from "./views/main";

export default () => (
  <Page.Provider>
    <Main />
  </Page.Provider>
);

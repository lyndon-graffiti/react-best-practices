import { useState } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const [test, setTest] = useState("页面不见了");

  const onChange = () => {
    setTest("404");
  };

  return {
    state: {
      test,
    },
    onChange,
  };
};

export const Page = createContainer(useContainer);

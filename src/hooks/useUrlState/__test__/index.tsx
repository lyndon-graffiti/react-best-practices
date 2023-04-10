import { render } from "@testing-library/react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import useUrlState, { Options } from "..";

export const setup = (
  initialEntries: MemoryRouterProps["initialEntries"],
  initialState: any = {},
  options?: Options
) => {
  const res = {} as any;

  const Component = () => {
    const [state, setState] = useUrlState(initialState, options);
    Object.assign(res, { state, setState });
    return null;
  };

  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Component />
    </MemoryRouter>
  );

  return res;
};

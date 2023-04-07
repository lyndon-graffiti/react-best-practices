import { useMemoizedFn, useUpdate } from "ahooks";
import { ParseOptions, StringifyOptions } from "query-string";
import { parse, stringify } from "query-string/base";
import { SetStateAction, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface Options {
  navigateMode?: "push" | "replace";
  parseOptions?: ParseOptions;
  stringifyOptions?: StringifyOptions;
}

const baseParseConfig: ParseOptions = {
  parseNumbers: false,
  parseBooleans: false,
};

const baseStringifyConfig: StringifyOptions = {
  skipNull: false,
  skipEmptyString: false,
};

type UrlState = Record<string, any>;

const useUrlState = <S extends UrlState = UrlState>(
  initialState?: S | (() => S),
  options?: Options
) => {
  type State = Partial<{ [key in keyof S]: any }>;
  const {
    navigateMode = "replace",
    parseOptions,
    stringifyOptions,
  } = options || {};

  const mergedParseOptions = { ...baseParseConfig, ...parseOptions };
  const mergedStringifyOptions = {
    ...baseStringifyConfig,
    ...stringifyOptions,
  };

  const location = useLocation();

  const navigate = useNavigate();

  const update = useUpdate();

  const initialStateRef = useRef(
    typeof initialState === "function"
      ? (initialState as () => S)()
      : initialState || {}
  );

  const queryFromUrl = useMemo(
    () => parse(location.search, mergedParseOptions),
    [location.search]
  );

  const targetQuery: State = useMemo(
    () => ({
      ...initialStateRef.current,
      ...queryFromUrl,
    }),
    [queryFromUrl]
  );

  const setState = (s: SetStateAction<State>) => {
    const newQuery = typeof s === "function" ? s(targetQuery) : s;

    update();
    navigate(
      `${location.pathname}?${stringify(
        { ...queryFromUrl, ...newQuery },
        mergedStringifyOptions
      )}`,
      {
        replace: navigateMode === "replace",
      }
    );
  };

  return [targetQuery, useMemoizedFn(setState)] as const;
};

export default useUrlState;

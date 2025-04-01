import { Option } from "fp-ts/lib/Option.js";

class SearchOnlineParams {
  constructor(
    public query: string,
    public code: Option<string>,
    public depth: "shallow" | "medium" | "deep",
    public mode: "normal" | "error_fix",
  ) {}
}

export { SearchOnlineParams };

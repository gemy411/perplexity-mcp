import { Option } from "fp-ts/lib/Option.js";

class SearchOnlineParams {
  constructor(
    public query: string,
    public code: Option<string>,
    public depth: "shallow" | "medium" | "deep",
  ) {}
}

export { SearchOnlineParams };

import { Option } from "fp-ts/lib/Option.js";

export class SearchRemoteParams {
  constructor(
    public query: string,
    public systemMessage: Option<string>,
    public depth: "shallow" | "medium" | "deep",
  ) {}
}
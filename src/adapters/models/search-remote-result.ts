export interface Citation {
  uri: string;
  title: string;
}

export class SearchRemoteResult {
  constructor(
    public message: string,
    public citations: Citation[] = [],
    public searchQueries: string[] = []
  ) {}
}
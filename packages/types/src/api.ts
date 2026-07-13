export interface ApiProblem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: Readonly<Record<string, readonly string[]>>;
}

export interface PagedResponse<TItem> {
  items: readonly TItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

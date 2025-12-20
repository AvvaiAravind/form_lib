// src/hooks/async-select.types.ts

export interface AsyncOption {
  label: string;
  value: string;
  id?: string;
  _id?: string;
  disabled?: boolean;
  badgeLabel?: string;
  [key: string]: any;
}

export interface AsyncSelectFetchParams {
  search?: string;
  page: number;
  pageSize: number;
}

export interface AsyncSelectFetchResult {
  items: AsyncOption[];
  hasMore: boolean;
  total: number;
}

export type AsyncSelectFetchFunction = (
  params: AsyncSelectFetchParams
) => Promise<AsyncSelectFetchResult>;

// src/hooks/useInfiniteOptions.ts

import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  AsyncOption,
  AsyncSelectFetchFunction,
  AsyncSelectFetchResult,
} from "./async-select.types";

interface UseInfiniteOptionsProps {
  queryKey: string[];
  fetchFn: AsyncSelectFetchFunction;
  pageSize?: number;
  search?: string;
  enabled?: boolean;
}

interface UseInfiniteOptionsReturn {
  options: AsyncOption[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  error: Error | null;
  refetch: () => void;
}

export function useInfiniteOptions({
  queryKey,
  fetchFn,
  pageSize = 10,
  search = "",
  enabled = true,
}: UseInfiniteOptionsProps): UseInfiniteOptionsReturn {
  const query = useInfiniteQuery<
    AsyncSelectFetchResult, // The data returned by queryFn
    Error, // Error type
    InfiniteData<AsyncSelectFetchResult>, // Transformed data type
    string[], // QueryKey type
    number // PageParam type
  >({
    queryKey: [...queryKey, search],
    queryFn: async ({ pageParam }) => {
      return await fetchFn({
        search,
        page: pageParam,
        pageSize,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const flattenedOptions = useMemo(() => {
    if (!query.data) return [];
    return query.data.pages.flatMap((page) => page.items);
  }, [query.data]);

  return {
    options: flattenedOptions,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  };
}

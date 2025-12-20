// src/api/mock-comments.api.ts

import { AsyncSelectFetchFunction } from "./async-select.types";

export const fetchMockComments: AsyncSelectFetchFunction = async ({
  search,
  page,
  pageSize,
}) => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/comments"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    const allComments = await response.json();

    // Filter by search
    const filtered = search
      ? allComments.filter(
          (comment: any) =>
            comment.name.toLowerCase().includes(search.toLowerCase()) ||
            comment.email.toLowerCase().includes(search.toLowerCase())
        )
      : allComments;

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComments = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    return {
      items: paginatedComments.map((comment: any) => ({
        label: comment.name,
        value: String(comment.id),
        badgeLabel: comment.id <= 50 ? "💬" : undefined,
        email: comment.email,
        body: comment.body,
      })),
      hasMore,
      total: filtered.length,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

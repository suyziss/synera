import type { Comment, Post, User } from "./models";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface UserDto extends User {
  createdAt: string;
}

export interface PostDto extends Omit<Post, "author" | "comments"> {
  author: UserDto;
  comments: CommentDto[];
}

export interface CommentDto extends Omit<Comment, "author"> {
  author: UserDto;
}

export interface CreatePostRequest {
  body: string;
  mediaIds?: string[];
}

export interface CreateCommentRequest {
  body: string;
}

export interface SendMessageRequest {
  conversationId: string;
  body: string;
  clientMessageId: string;
}

/**
 * Stable resource paths for the future HTTP adapter.
 * These contracts are transport-level and intentionally know nothing about React.
 */
export const API_V1 = {
  currentUser: "/api/v1/me",
  feed: "/api/v1/feed",
  posts: "/api/v1/posts",
  post: (postId: string) => `/api/v1/posts/${postId}`,
  comments: (postId: string) => `/api/v1/posts/${postId}/comments`,
  users: "/api/v1/users",
  user: (userId: string) => `/api/v1/users/${userId}`,
  follow: (userId: string) => `/api/v1/users/${userId}/follow`,
  conversations: "/api/v1/conversations",
  messages: (conversationId: string) => `/api/v1/conversations/${conversationId}/messages`,
  notifications: "/api/v1/notifications"
} as const;

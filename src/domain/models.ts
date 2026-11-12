export type ThemePreference = "system" | "light" | "dark";
export type NavigationSection = "home" | "explore" | "messages" | "notifications" | "profile";

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location?: string;
  followers: number;
  following: number;
  verified?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: User;
  body: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  likedByMe: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface PlatformRepository {
  getFeed(): Promise<Post[]>;
  publishPost(body: string): Promise<Post>;
  toggleLike(postId: string): Promise<void>;
  addComment(postId: string, body: string): Promise<Comment>;
  getConversations(): Promise<Conversation[]>;
}
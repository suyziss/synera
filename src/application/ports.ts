import type { Comment, Conversation, PlatformRepository, Post } from "../domain/models";

export class SocialUseCases {
  constructor(private readonly repository: PlatformRepository) {}

  loadFeed(): Promise<Post[]> {
    return this.repository.getFeed();
  }

  publish(body: string): Promise<Post> {
    const normalized = body.trim();
    if (!normalized) throw new Error("A post cannot be empty.");
    if (normalized.length > 500) throw new Error("Posts are limited to 500 characters.");
    return this.repository.publishPost(normalized);
  }

  toggleLike(postId: string): Promise<void> {
    return this.repository.toggleLike(postId);
  }

  comment(postId: string, body: string): Promise<Comment> {
    const normalized = body.trim();
    if (!normalized) throw new Error("A comment cannot be empty.");
    if (normalized.length > 240) throw new Error("Comments are limited to 240 characters.");
    return this.repository.addComment(postId, normalized);
  }

  conversations(): Promise<Conversation[]> {
    return this.repository.getConversations();
  }
}
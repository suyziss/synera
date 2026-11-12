import type { Comment, Conversation, PlatformRepository, Post, User } from "../domain/models";

export const currentUser: User = {
  id: "me",
  name: "Alex Morgan",
  handle: "alexmorgan",
  avatar: "https://i.pravatar.cc/120?img=12",
  bio: "Collecting little moments. Building things with intention.",
  location: "Bishkek",
  followers: 1280,
  following: 384,
  verified: true
};

const elena: User = {
  id: "u1", name: "Elena Rivera", handle: "elenar", avatar: "https://i.pravatar.cc/120?img=47",
  bio: "Visual storyteller · finding beauty in the everyday", followers: 8420, following: 612, verified: true
};
const noah: User = {
  id: "u2", name: "Noah Williams", handle: "noahw", avatar: "https://i.pravatar.cc/120?img=11",
  bio: "Design, architecture and slow mornings.", followers: 2140, following: 490
};
const mina: User = {
  id: "u3", name: "Mina Park", handle: "minapark", avatar: "https://i.pravatar.cc/120?img=44",
  bio: "A little bit of everything.", followers: 5310, following: 720
};

const seedPosts: Post[] = [
  {
    id: "p1", author: elena,
    body: "A quiet corner, warm light, and nowhere else to be. Trying to make more room for moments like this.",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1200&q=85",
    createdAt: "18 min ago", likes: 248, likedByMe: false,
    comments: [{ id: "c1", author: noah, body: "This feels like a deep breath.", createdAt: "12 min ago" }]
  },
  {
    id: "p2", author: noah,
    body: "A small reminder: good design is often less about adding something new and more about knowing what to leave out.",
    createdAt: "1 hour ago", likes: 96, likedByMe: true, comments: []
  },
  {
    id: "p3", author: mina,
    body: "Weekend notes — soft skies, long walks, and a camera roll full of things I almost walked past.",
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=85",
    createdAt: "3 hours ago", likes: 412, likedByMe: false, comments: []
  }
];

const seedConversations: Conversation[] = [
  { id: "d1", participant: elena, lastMessage: "That sounds lovely. Let's do it!", time: "2m", unread: 2 },
  { id: "d2", participant: noah, lastMessage: "Sent you the references.", time: "1h", unread: 0 },
  { id: "d3", participant: mina, lastMessage: "Have a wonderful weekend ✨", time: "1d", unread: 0 }
];

const STORAGE_KEY = "synera-demo-v1";

function readPosts(): Post[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as Post[] : seedPosts;
  } catch {
    return seedPosts;
  }
}

function savePosts(posts: Post[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch { /* Storage is optional in this prototype. */ }
}

export class DemoPlatformRepository implements PlatformRepository {
  async getFeed(): Promise<Post[]> {
    return readPosts();
  }

  async publishPost(body: string): Promise<Post> {
    const post: Post = {
      id: crypto.randomUUID(), author: currentUser, body, createdAt: "just now",
      likes: 0, comments: [], likedByMe: false
    };
    const posts = [post, ...readPosts()];
    savePosts(posts);
    return post;
  }

  async toggleLike(postId: string): Promise<void> {
    const posts = readPosts().map(post => post.id === postId
      ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) }
      : post);
    savePosts(posts);
  }

  async addComment(postId: string, body: string): Promise<Comment> {
    const comment: Comment = { id: crypto.randomUUID(), author: currentUser, body, createdAt: "just now" };
    const posts = readPosts().map(post => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post);
    savePosts(posts);
    return comment;
  }

  async getConversations(): Promise<Conversation[]> {
    return seedConversations;
  }
}
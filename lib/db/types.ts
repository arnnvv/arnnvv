export type User = {
  id: number;
  google_id: string;
  email: string;
  name: string;
  picture: string;
};

export type Session = {
  id: string;
  user_id: number;
  expires_at: Date;
};

export type BlogSummary = {
  id: number;
  title: string;
  slug: string;
  created_at: Date;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  description: string;
  created_at: Date;
};

export type Comment = {
  id: number;
  blog_id: number;
  user_id: number;
  parent_comment_id: number | null;
  content: string;
  created_at: Date;
  updated_at: Date;
};

export type CommentLike = {
  user_id: number;
  comment_id: number;
  created_at: Date;
};

export type CommentWithDetails = Comment & {
  user_name: string;
  user_picture: string;
  like_count: number;
  is_liked_by_current_user: boolean;
  reply_count: number;
};

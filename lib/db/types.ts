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

export type ProjectTechnology = {
  id: number;
  project_id: number;
  technology: string;
};

export type ProjectLink = {
  id: number;
  project_id: number;
  link_type: string;
  url: string;
};

export type Project = {
  id: number;
  title: string;
  description: string;
};

export type ProjectWithDetails = Project & {
  technologies: string[];
  links: Array<{ link_type: string; url: string }>;
};

export type SessionValidationResult =
  | { user: User; session: Session }
  | { user: null; session: null };

export type ActionResult = {
  success: boolean;
  message: string;
};

export interface ListItem {
  key: string;
  content: string;
  children: ListBlock;
}

export type ListBlock = {
  key: string;
  listType: "ul" | "ol";
  start?: number;
  items: ListItem[];
};

export type ContentBlock =
  | {
      type: "header";
      key: string;
      level: number;
      content: string;
    }
  | {
      type: "paragraph";
      key: string;
      content: string;
    }
  | {
      type: "code";
      key: string;
      content: string;
    }
  | {
      type: "blockquote";
      key: string;
      content: string[];
    }
  | {
      type: "image";
      key: string;
      src: string;
      alt: string;
      title?: string;
    }
  | {
      type: "table";
      key: string;
      headers: string[];
      alignments: string[];
      rows: string[][];
    }
  | {
      type: "hr";
      key: string;
    }
  | ({
      type: "list";
    } & ListBlock);

export interface SmtpConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export enum SmtpState {
  GREETING,
  EHLO,
  AUTH,
  AUTH_USER,
  AUTH_PASS,
  MAIL_FROM,
  RCPT_TO,
  DATA,
  BODY,
  QUIT,
  DONE,
}

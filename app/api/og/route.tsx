import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import type { BlogPost } from "@/lib/db/types";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const result = await db`
    SELECT id, title, slug, description, created_at
    FROM arnnvv_blogs
    WHERE slug = ${slug}
    LIMIT 1
  `;

  if (result.length === 0) {
    return new Response("Post not found", { status: 404 });
  }

  const post = result[0] as BlogPost | undefined;

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  if (!post.title || !post.description || !post.created_at) {
    console.error("Post missing required fields:", {
      title: !!post.title,
      description: !!post.description,
      created_at: !!post.created_at,
    });
    return new Response("Post data incomplete", { status: 500 });
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.created_at));

  const excerptRaw = post.description.replace(/\n+/g, " ").substring(0, 280);
  const readTime = `${Math.max(1, Math.ceil(post.description.length / 1000))} min read`;
  const excerpt = `${excerptRaw.substring(
    0,
    Math.min(excerptRaw.length, excerptRaw.lastIndexOf(" ")),
  )}...`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "#f9fafb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "60px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              fontWeight: 700,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#6b7280",
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            Published on {formattedDate}
          </p>
          <p
            style={{
              fontSize: "28px",
              lineHeight: 1.6,
              color: "#374151",
              textAlign: "left",
            }}
          >
            {excerpt}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
              fontSize: "22px",
              color: "#6b7280",
              fontWeight: 500,
              marginTop: "auto",
            }}
          >
            <div style={{ display: "flex" }}>Read more on the blog</div>
            <div style={{ display: "flex" }}>{readTime}</div>
          </div>
        </div>
      </div>
    ),
  );
}

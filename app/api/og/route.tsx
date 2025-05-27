import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/app/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const post = await getBlogPostBySlug(slug);

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

  const contentLines =
    post.description
      .replace(/\n+/g, " ")
      .substring(0, 600)
      .split(". ")
      .slice(0, 3)
      .join(". ") + (post.description.length > 600 ? "..." : "");

  const readTime = `${Math.max(1, Math.ceil(post.description.length / 1000))} min read`;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#09090b",
        color: "#fafafa",
        padding: "60px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#fafafa",
            marginBottom: "16px",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            fontSize: "18px",
            color: "#a1a1aa",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          {`Published on ${formattedDate}`}
        </div>

        <div
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#e4e4e7",
            flex: 1,
            textAlign: "left",
            marginBottom: "30px",
          }}
        >
          {contentLines}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "24px",
            borderTop: "1px solid #27272a",
            fontSize: "16px",
            color: "#71717a",
          }}
        >
          <div style={{ display: "flex" }}>Read more on the blog</div>
          <div style={{ display: "flex" }}>{readTime}</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": "auto",
      },
    },
  );
}

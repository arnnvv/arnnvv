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

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1f2937",
        color: "white",
        padding: "40px",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {post.title}
      </div>
      <div
        style={{
          fontSize: "20px",
          opacity: 0.8,
        }}
      >
        Arnav Sharma's Blog
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

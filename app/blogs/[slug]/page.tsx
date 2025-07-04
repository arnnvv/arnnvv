import { type JSX, Suspense } from "react";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/app/actions";
import { formatDate } from "@/lib/date";
import { formatContent } from "@/lib/format";
import type { Metadata } from "next";
import { CommentSection } from "@/components/CommentSection";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const excerpt =
    post.description.length > 150
      ? `${post.description.substring(0, 150).replace(/\s+\S*$/, "")}...`
      : post.description;

  const imageUrl = `https://www.arnnvv.sbs/api/og?slug=${slug}`;

  return {
    title: post.title,
    description: excerpt,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: post.title,
      description: excerpt,
      type: "article",
      publishedTime: post.created_at.toISOString(),
      authors: ["Arnav Sharma"],
      url: `https://www.arnnvv.sbs/blogs/${post.slug}`,
      images: [
        {
          url: imageUrl,
          alt: post.title,
          type: "image/jpeg",
        },
      ],
      siteName: "arnnvv",
    },
    twitter: {
      title: post.title,
      description: excerpt,
      card: "summary_large_image",
      images: [
        {
          url: imageUrl,
          alt: post.title,
          type: "image/jpeg",
        },
      ],
      creator: "@arnnnvvv",
      creatorId: "@arnnnvvv",
      site: "@arnnnvvv",
    },
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDescription = formatContent(post.description);

  return (
    <main className="flex-grow relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <article className="prose prose-zinc dark:prose-invert lg:prose-xl mx-auto">
          <header className="mb-8 text-center not-prose">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-50 !mb-2">
              {post.title}
            </h1>
            <p className="text-md text-gray-500 dark:text-zinc-400 mt-2">
              Published on {formatDate(post.created_at)}
            </p>
          </header>
          <div>{formattedDescription}</div>
        </article>

        <div className="max-w-4xl mx-auto mt-16">
          <Suspense
            fallback={
              <div className="h-64 bg-muted/20 rounded animate-pulse" />
            }
          >
            <CommentSection blogId={post.id} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

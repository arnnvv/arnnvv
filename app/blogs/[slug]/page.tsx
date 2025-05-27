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

function BlogPostSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse max-w-3xl mx-auto">
      <div className="h-10 bg-gray-300 dark:bg-zinc-600 rounded w-3/4 mx-auto mb-4" />
      <div className="h-6 bg-gray-300 dark:bg-zinc-600 rounded w-1/2 mx-auto mb-8" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-5/6" />
        <div className="h-20 bg-gray-300 dark:bg-zinc-700 rounded w-full mt-6" />
        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-2/3" />
      </div>
    </div>
  );
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

  const imageUrl = `https://arnnvv.vercel.app/api/og?slug=${slug}`;

  return {
    title: `${post.title} | Arnav Sharma`,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      type: "article",
      publishedTime: post.created_at.toISOString(),
      authors: ["Arnav Sharma"],
      url: `https://arnnvv.vercel.app/blogs/${post.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: [imageUrl],
    },
  };
}

async function BlogPostItem({ slug }: { slug: string }): Promise<JSX.Element> {
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }
  const formattedDescription = formatContent(post.description);
  return (
    <>
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
      <div className="max-w-3xl mx-auto">
        <CommentSection blogId={post.id} />
      </div>
    </>
  );
}

async function BlogPostPageContent({
  params,
}: BlogPostPageProps): Promise<JSX.Element> {
  const { slug } = await params;

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <Suspense fallback={<BlogPostSkeleton />}>
        <BlogPostItem slug={slug} />
      </Suspense>
    </main>
  );
}

export default function BlogPostPage(props: BlogPostPageProps): JSX.Element {
  return (
    <Suspense fallback={<BlogPostSkeleton />}>
      <BlogPostPageContent {...props} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { cache, type JSX, Suspense } from "react";
import { getBlogPostBySlug } from "@/app/actions/blog-actions";
import { CommentSection } from "@/components/CommentSection";
import { formatDate } from "@/lib/date";
import { db } from "@/lib/db";
import { formatContent } from "@/lib/format";
import { wrapWordsWithTransition } from "@/lib/transitions";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const result = (await db`
      SELECT slug
      FROM arnnvv_blogs
      ORDER BY created_at DESC
    `) as Array<{ slug: string }>;

    return result.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export const generateMetadata = cache(
  async ({ params }: BlogPostPageProps): Promise<Metadata> => {
    "use cache";
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
      alternates: {
        canonical: `https://www.arnnvv.sbs/blogs/${post.slug}`,
      },
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
        modifiedTime: post.updated_at.toISOString(),
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
  },
);

const BlogPostContent = cache(
  async ({ slug }: { slug: string }): Promise<JSX.Element> => {
    "use cache";
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      notFound();
    }

    const formattedDescription = formatContent(post.description);
    const excerpt =
      post.description.length > 150
        ? `${post.description.substring(0, 150).replace(/\s+\S*$/, "")}...`
        : post.description;
    const imageUrl = `https://www.arnnvv.sbs/api/og?slug=${post.slug}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: excerpt,
      image: imageUrl,
      author: {
        "@type": "Person",
        name: "Arnav Sharma",
        url: "https://www.arnnvv.sbs",
      },
      publisher: {
        "@type": "Person",
        name: "Arnav Sharma",
        url: "https://www.arnnvv.sbs",
      },
      datePublished: post.created_at.toISOString(),
      dateModified: post.updated_at.toISOString(),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.arnnvv.sbs/blogs/${post.slug}`,
      },
    };

    return (
      <>
        <Script
          id={`blog-schema-${post.slug}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(jsonLd)}
        </Script>
        <article className="prose prose-zinc dark:prose-invert lg:prose-xl mx-auto">
          <header className="mb-8 text-center not-prose">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-50 mb-2">
              {wrapWordsWithTransition(post.title, `blog-title-${post.slug}`)}
            </h1>
            <p className="text-md text-gray-500 dark:text-zinc-400 mt-2">
              Published on{" "}
              <span
                style={{
                  viewTransitionName: `blog-date-${post.slug}`,
                }}
              >
                {formatDate(post.created_at)}
              </span>
            </p>
          </header>
          <div>{formattedDescription}</div>
        </article>
      </>
    );
  },
);

export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="grow relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <BlogPostContent slug={slug} />

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

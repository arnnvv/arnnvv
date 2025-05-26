import { type JSX, Suspense } from "react";
import Link from "next/link";
import { getBlogSummaries } from "@/app/actions";
import { formatDate } from "@/lib/date";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Writings | Arnav Sharma",
  description: "A collection of thoughts, stories, and articles.",
};

function BlogListSkeleton(): JSX.Element {
  const skeletonItems = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

  return (
    <div className="space-y-6 animate-pulse">
      {skeletonItems.map((id) => (
        <div
          key={id}
          className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm"
        >
          <div className="h-6 bg-gray-300 dark:bg-zinc-600 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

async function BlogList(): Promise<JSX.Element> {
  const blogs = await getBlogSummaries();

  if (blogs.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-zinc-400">
        No blog posts yet. Stay tuned!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {blogs.map((blog) => (
        <article
          key={blog.id}
          className="p-4 sm:p-6 border border-gray-200 dark:border-zinc-700 rounded-lg hover:shadow-lg transition-shadow duration-200 ease-in-out"
        >
          <Link href={`/blogs/${blog.slug}`} className="group">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {blog.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Published on {formatDate(blog.created_at)}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function BlogsPage(): JSX.Element {
  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-zinc-50">
        My Writings
      </h1>
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </main>
  );
}

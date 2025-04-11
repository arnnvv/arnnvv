"use client";

import { useLinkStatus } from "next/link";
import Link from "next/link";
import { type JSX, useEffect, useState } from "react";

function LoadingIndicator(): JSX.Element | null {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100); //If page loads before 100ms don't show loader
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

export function ContactLink(): JSX.Element {
  const { pending } = useLinkStatus();

  return (
    <div className="relative inline-block">
      <Link
        href="/contact"
        className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
        aria-label="Contact me"
      >
        contact me
      </Link>
      {pending && <LoadingIndicator />}
    </div>
  );
}

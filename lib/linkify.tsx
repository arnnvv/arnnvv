import Image from "next/image";
import type { ReactNode } from "react";
import { URL_REGEX } from "./constants";
import { getSafeUrl, isImageUrl } from "./url";

export function linkifyText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const urlString = match[0];
    const index = match.index as number;

    if (lastIndex < index) {
      parts.push(text.slice(lastIndex, index));
    }

    const safeUrl = getSafeUrl(urlString);

    if (safeUrl) {
      const href = safeUrl.href;
      if (isImageUrl(safeUrl)) {
        parts.push(
          <div
            key={`img-container-${index}`}
            className="relative w-full max-w-sm aspect-video my-2 rounded overflow-hidden"
          >
            <Image
              src={href}
              alt="User-provided image"
              fill
              className="object-contain"
            />
          </div>,
        );
      } else {
        parts.push(
          <a
            key={`link-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {urlString}
          </a>,
        );
      }
    } else {
      parts.push(urlString);
    }

    lastIndex = index + urlString.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

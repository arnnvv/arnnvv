import type { ReactNode } from "react";

const urlRegex = /\bhttps?:\/\/[^\s<>"'`]+/gi;

const isSafeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isImageUrl = (url: string) => {
  try {
    const { pathname } = new URL(url);
    if (/\.svg$/i.test(pathname)) {
      return false;
    }
    return /\.(jpe?g|png|gif|webp|bmp)$/i.test(pathname);
  } catch {
    return false;
  }
};

export const linkifyText = (text: string): ReactNode => {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlRegex)) {
    const { 0: url, index } = match;
    if (index === undefined) continue;

    if (lastIndex < index) {
      parts.push(text.slice(lastIndex, index));
    }

    if (isSafeUrl(url)) {
      if (isImageUrl(url)) {
        parts.push(
          <img
            key={`img-${index}`}
            src={url}
            alt=""
            className="max-w-full h-auto my-2"
            loading="lazy"
          />,
        );
      } else {
        parts.push(
          <a
            key={`link-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {url}
          </a>,
        );
      }
    } else {
      parts.push(url);
    }

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

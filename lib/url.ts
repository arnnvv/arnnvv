export function getSafeUrl(urlString: string): URL | null {
  try {
    const url = new URL(urlString);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function isImageUrl(url: URL) {
  const pathname = url.pathname.toLowerCase();
  if (pathname.endsWith(".svg")) {
    return false;
  }
  return /\.(jpe?g|png|gif|webp|bmp)$/i.test(pathname);
}

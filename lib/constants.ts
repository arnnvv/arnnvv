export const SESSION_COOKIE_NAME = "session" as const;
export const SESSION_MAX_AGE_SECONDS = 2592000 as const; // 60 * 60 * 24 * 30
export const SESSION_REFRESH_THRESHOLD_SECONDS = 1296000 as const; // 60 * 60 * 24 * 15

export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google_oauth_state" as const;
export const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME =
  "google_code_verifier" as const;
export const GOOGLE_OAUTH_NONCE_COOKIE_NAME = "google_oauth_nonce" as const;
export const GOOGLE_TOKEN_ENDPOINT =
  "https://oauth2.googleapis.com/token" as const;
export const GOOGLE_ACCOUNTS_AUTH_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth" as const;
export const GOOGLE_REVOKE_ENDPOINT =
  "https://oauth2.googleapis.com/revoke" as const;
export const GOOGLE_OID_ENDPOINT =
  "https://accounts.google.com/.well-known/openid-configuration" as const;

export const OAUTH_COOKIE_MAX_AGE_SECONDS = 600 as const; // 60 * 10
export const THEME_STORAGE_KEY = "theme" as const;

export const IP_HEADERS = [
  "CF-Connecting-IP",
  "x-vercel-forwarded-for",
  "x-real-ip",
  "x-forwarded-for",
] as const;

export const URL_REGEX = /\bhttps?:\/\/[^\s<>"'`]+/gi;

export const SOCIAL_LINKS = [
  {
    name: "@arnnnvvv",
    url: "https://x.com/arnnnvvv",
  },
  {
    name: "github",
    url: "https://github.com/arnnvv",
  },
  {
    name: "linkedin",
    url: "https://www.linkedin.com/in/arnav-sharma-142716261",
  },
] as const;

export const APP_BASE_URL = "https://www.arnnvv.sbs" as const;

export const FORMATTER_CONFIG = {
  styling: {
    header: [
      "text-3xl font-bold mt-6 mb-4",
      "text-2xl font-bold mt-6 mb-4",
      "text-xl font-bold mt-6 mb-4",
      "text-lg font-bold mt-6 mb-4",
      "text-base font-bold mt-6 mb-4",
      "text-sm font-bold mt-6 mb-4",
    ],
    paragraph: "mb-4 leading-relaxed",
    codeBlock: {
      pre: "bg-muted text-gray-800 dark:text-gray-200 p-4 my-4 rounded-lg overflow-x-auto",
      code: "font-mono text-sm",
    },
    blockquote:
      "border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 text-gray-600 dark:text-gray-400",
    image: {
      figure: "my-6",
      container:
        "relative w-full aspect-video overflow-hidden rounded-lg shadow-lg dark:shadow-black/50",
      image: "object-contain",
      caption:
        "mt-3 text-sm text-center text-gray-500 dark:text-gray-400 italic",
    },
    hr: "my-6 border-t-2 border-gray-200 dark:border-gray-700",
    list: {
      ul: "list-disc list-inside mb-4 pl-4",
      ol: "list-decimal list-inside mb-4 pl-4",
      listItem: "mb-2",
      checkbox: "mr-2 align-middle",
    },
    table: {
      container: "my-6 overflow-x-auto",
      table: "w-full text-left border-collapse",
      th: "p-4 border-b-2 border-gray-200 dark:border-gray-700 pb-3 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider",
      tr: "border-b border-gray-200 dark:border-gray-800",
      td: "p-4",
    },
    inline: {
      code: "font-mono bg-muted text-red-500 dark:text-red-400 px-1 py-0.5 rounded",
      link: "text-blue-600 dark:text-blue-400 hover:underline",
      image: "inline-block relative w-5 h-5 align-middle mx-1",
    },
  },
  regex: {
    inline:
      /(!?\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~| {2,}\n)/g,
    header: /^(#+)\s(.*)/,
    blockquote: /^>\s?(.*)/,
    listItem: /^(\s*)(\*|-|\d+\.)\s(.*)/,
    taskListItem: /^\[( |x)\]\s(.*)/,
    codeFence: /^```/,
    hr: /^(---|\*\*\*|___)\s*$/,
    tableRow: /^\s*\|.*\|\s*$/,
    tableSeparator: /^\s*\|?.*[-:]+.*\|?\s*$/,
    image: /^!\[(.*?)]\((.*?)(?:\s+"(.*?)")?\)\s*$/,
  },
} as const;

export const SMTP_CODES = {
  GREETING: 220,
  OK: 250,
  AUTH_SUCCESS: 235,
  AUTH_PROMPT: 334,
  DATA_READY: 354,
  GOODBYE: 221,
} as const;

export const CONNECTION_TIMEOUT = 10000 as const;
export const MAX_CONTENT_LENGTH = 1_048_576 as const; // 1 MB
export const MAX_NESTING_DEPTH = 20 as const;
export const MAX_INLINE_TOKENS = 1000 as const;
export const DANGEROUS_HTML_PATTERN = /<(\w+)[^>]*>|<\/\w+>/i;
export const BLOGS_PER_PAGE = 5 as const;
export const PARSING_TIMEOUT_MS = 5000 as const;

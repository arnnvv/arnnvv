import Image from "next/image";
import { cache, type JSX, type ReactNode } from "react";
import { FORMATTER_CONFIG as CONFIG, PARSING_TIMEOUT_MS } from "./constants";
import type {
  ContentBlock,
  InlineToken,
  ListBlock,
  ListItem,
} from "./db/types";

const SECURITY_CONFIG = {
  allowedImageDomains: ["*"] as string[],
  allowedLinkDomains: ["*"] as string[],

  dangerousProtocols: /^(javascript|data|vbscript|file|ftp|tel):/i,

  safeProtocols: {
    link: /^(https?:|mailto:|#$)/i,
    image: /^(https?:)/i,
  },

  maxUrlLength: 2048,

  maxNestingDepth: 10,
  maxInlineTokens: 1000,
  maxContentLength: 100000,
} as const;

function sanitizeTextContent(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\uFEFF/g, "");
}

function isDomainAllowed(hostname: string, allowedDomains: string[]): boolean {
  if (allowedDomains.includes("*")) return true;
  if (allowedDomains.length === 0) return false;

  return allowedDomains.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const baseDomain = allowed.slice(2);
      return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
    }
    return hostname === allowed;
  });
}

function sanitizeUrl(
  raw: string | undefined | null,
  type: "link" | "image" = "link",
): string {
  if (!raw) return "#";

  const urlStr = String(raw).trim();

  if (urlStr.length > SECURITY_CONFIG.maxUrlLength) {
    console.warn("URL exceeds maximum length");
    return "#";
  }

  if (SECURITY_CONFIG.dangerousProtocols.test(urlStr)) {
    console.warn("Blocked dangerous protocol:", urlStr.substring(0, 50));
    return "#";
  }

  if (/^\/[^/]|^\.\.?\/|^#/.test(urlStr)) {
    if (urlStr.includes("..")) {
      const normalized = urlStr
        .replace(/\/\.\.\//g, "/")
        .replace(/\/\.\//g, "/");
      return normalized;
    }
    return urlStr;
  }

  try {
    const url = new URL(urlStr);

    const protocolRegex =
      type === "image"
        ? SECURITY_CONFIG.safeProtocols.image
        : SECURITY_CONFIG.safeProtocols.link;

    if (!protocolRegex.test(url.protocol)) {
      console.warn("Blocked unsafe protocol:", url.protocol);
      return "#";
    }

    if (type === "image" && url.protocol === "mailto:") {
      return "#";
    }

    const allowedDomains =
      type === "image"
        ? SECURITY_CONFIG.allowedImageDomains
        : SECURITY_CONFIG.allowedLinkDomains;

    if (!isDomainAllowed(url.hostname, allowedDomains)) {
      console.warn("Blocked domain not in allowlist:", url.hostname);
      return "#";
    }

    const sanitizedHref = Array.from(url.href)
      .filter((ch) => {
        const code = ch.charCodeAt(0);
        return code >= 0x20 && code !== 0x7f;
      })
      .join("");
    return sanitizedHref;
  } catch (e) {
    console.warn(`Invalid URL format: ${e}`, urlStr.substring(0, 50));
    return urlStr.startsWith("#") ? urlStr : "#";
  }
}

function withTimeout<T>(fn: () => T, timeoutMs: number, fallback: T): T {
  const startTime = Date.now();
  try {
    const result = fn();
    if (Date.now() - startTime > timeoutMs) {
      console.error("Operation exceeded timeout");
      return fallback;
    }
    return result;
  } catch (error) {
    console.error("Operation failed:", error);
    return fallback;
  }
}

function tokenizeInlineContent(text: string, depth = 0): InlineToken[] {
  if (depth > SECURITY_CONFIG.maxNestingDepth) {
    return [{ type: "text", content: sanitizeTextContent(text) }];
  }

  const tokens: InlineToken[] = [];
  let position = 0;
  let tokenCount = 0;

  const maxIterations = text.length * 2;
  let iterations = 0;

  while (
    position < text.length &&
    tokenCount < SECURITY_CONFIG.maxInlineTokens
  ) {
    if (++iterations > maxIterations) {
      console.error("Tokenization exceeded max iterations");
      break;
    }

    const remaining = text.slice(position);

    if (remaining.startsWith("***") || remaining.startsWith("___")) {
      const marker = remaining.slice(0, 3);
      const endIndex = remaining.indexOf(marker, 3);
      if (endIndex !== -1 && endIndex < 1000) {
        const content = remaining.slice(3, endIndex);
        if (content.length > 0 && content.length < 500) {
          tokens.push({
            type: "boldItalic",
            content: sanitizeTextContent(content),
            children: tokenizeInlineContent(content, depth + 1),
          });
          position += endIndex + 3;
          tokenCount++;
          continue;
        }
      }
    }

    if (remaining.startsWith("**") || remaining.startsWith("__")) {
      const marker = remaining.slice(0, 2);
      const endIndex = remaining.indexOf(marker, 2);
      if (endIndex !== -1 && endIndex < 1000) {
        const content = remaining.slice(2, endIndex);
        if (content.length > 0 && content.length < 500) {
          tokens.push({
            type: "bold",
            content: sanitizeTextContent(content),
            children: tokenizeInlineContent(content, depth + 1),
          });
          position += endIndex + 2;
          tokenCount++;
          continue;
        }
      }
    }

    if (remaining.startsWith("*") || remaining.startsWith("_")) {
      const marker = remaining[0];
      if (marker) {
        const endIndex = remaining.indexOf(marker, 1);
        if (endIndex !== -1 && endIndex < 1000) {
          const content = remaining.slice(1, endIndex);
          if (content.length > 0 && content.length < 500) {
            tokens.push({
              type: "italic",
              content: sanitizeTextContent(content),
              children: tokenizeInlineContent(content, depth + 1),
            });
            position += endIndex + 1;
            tokenCount++;
            continue;
          }
        }
      }
    }

    if (remaining.startsWith("~~")) {
      const endIndex = remaining.indexOf("~~", 2);
      if (endIndex !== -1 && endIndex < 1000) {
        const content = remaining.slice(2, endIndex);
        if (content.length > 0 && content.length < 500) {
          tokens.push({
            type: "strikethrough",
            content: sanitizeTextContent(content),
            children: tokenizeInlineContent(content, depth + 1),
          });
          position += endIndex + 2;
          tokenCount++;
          continue;
        }
      }
    }

    if (remaining.startsWith("`")) {
      const endIndex = remaining.indexOf("`", 1);
      if (endIndex !== -1 && endIndex < 500) {
        const content = remaining.slice(1, endIndex);
        tokens.push({
          type: "code",
          content: sanitizeTextContent(content),
        });
        position += endIndex + 1;
        tokenCount++;
        continue;
      }
    }

    if (remaining.startsWith("![") || remaining.startsWith("[")) {
      const isImage = remaining.startsWith("![");
      const closeBracket = remaining.indexOf("]");
      const openParen = remaining.indexOf("(", closeBracket);

      if (
        closeBracket !== -1 &&
        closeBracket < 200 &&
        openParen === closeBracket + 1
      ) {
        const closeParen = remaining.indexOf(")", openParen);
        if (closeParen !== -1 && closeParen < 500) {
          const textOrAlt = remaining.slice(isImage ? 2 : 1, closeBracket);
          const urlPart = remaining.slice(openParen + 1, closeParen);
          const urlParts = urlPart.split(/\s+/);
          const src = urlParts[0];
          const titleParts = urlParts.slice(1);
          const title = titleParts.join(" ").replace(/["']/g, "");

          if (src) {
            if (isImage) {
              tokens.push({
                type: "image",
                alt: sanitizeTextContent(textOrAlt),
                url: sanitizeUrl(src, "image"),
                title: sanitizeTextContent(title),
              });
            } else {
              tokens.push({
                type: "link",
                content: sanitizeTextContent(textOrAlt),
                url: sanitizeUrl(src, "link"),
                title: sanitizeTextContent(title),
                children: tokenizeInlineContent(textOrAlt, depth + 1),
              });
            }
            position += closeParen + 1;
            tokenCount++;
            continue;
          }
        }
      }
    }

    if (remaining.startsWith("  \n")) {
      tokens.push({ type: "linebreak" });
      position += 3;
      tokenCount++;
      continue;
    }

    const specialChars = /[*_~`![\]]/;
    const nextSpecial = remaining.search(specialChars);

    if (nextSpecial === -1) {
      tokens.push({
        type: "text",
        content: sanitizeTextContent(remaining),
      });
      break;
    } else if (nextSpecial > 0) {
      tokens.push({
        type: "text",
        content: sanitizeTextContent(remaining.slice(0, nextSpecial)),
      });
      position += nextSpecial;
      tokenCount++;
    } else {
      const char = remaining[0];
      tokens.push({
        type: "text",
        content: sanitizeTextContent(char ?? ""),
      });
      position += 1;
      tokenCount++;
    }
  }

  return tokens;
}

function renderInlineTokens(
  tokens: InlineToken[],
  keySeed: string,
): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keySeed}-${index}`;

    switch (token.type) {
      case "text":
        return token.content;

      case "bold":
        return (
          <strong key={key}>
            {renderInlineTokens(token.children || [], `${key}-b`)}
          </strong>
        );

      case "italic":
        return (
          <em key={key}>
            {renderInlineTokens(token.children || [], `${key}-i`)}
          </em>
        );

      case "boldItalic":
        return (
          <strong key={key}>
            <em>{renderInlineTokens(token.children || [], `${key}-bi`)}</em>
          </strong>
        );

      case "strikethrough":
        return (
          <del key={key}>
            {renderInlineTokens(token.children || [], `${key}-s`)}
          </del>
        );

      case "code":
        return (
          <code key={key} className={CONFIG.styling.inline.code}>
            {token.content}
          </code>
        );

      case "link":
        if (token.url === "#") {
          return (
            <span key={key} className={CONFIG.styling.inline.link}>
              {renderInlineTokens(token.children || [], `${key}-l`)}
            </span>
          );
        }
        return (
          <a
            key={key}
            href={token.url}
            title={token.title}
            className={CONFIG.styling.inline.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {renderInlineTokens(token.children || [], `${key}-l`)}
          </a>
        );

      case "image":
        if (token.url === "#" || !token.url) {
          return (
            <span key={key} className={CONFIG.styling.inline.image}>
              [Image blocked: invalid URL]
            </span>
          );
        }
        return (
          <span
            key={key}
            className={CONFIG.styling.inline.image}
            title={token.title}
          >
            <Image
              src={token.url}
              alt={token.alt || ""}
              fill
              className={CONFIG.styling.image.image}
            />
          </span>
        );

      case "linebreak":
        return <br key={key} />;

      default:
        return null;
    }
  });
}

function renderInlineContent(text: string, keySeed: string): ReactNode[] {
  if (!text) return [];

  const tokens = tokenizeInlineContent(text);
  return renderInlineTokens(tokens, keySeed);
}

function renderList(list: ListBlock): JSX.Element {
  const ListTag = list.listType;
  return (
    <ListTag
      key={list.key}
      start={list.start}
      className={CONFIG.styling.list[ListTag]}
    >
      {list.items.map((item) => {
        const taskMatch = item.content.match(CONFIG.regex.taskListItem);
        const content = taskMatch?.[2] ?? item.content;
        const isChecked = taskMatch?.[1] === "x";
        return (
          <li key={item.key} className={CONFIG.styling.list.listItem}>
            {taskMatch && (
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                className={CONFIG.styling.list.checkbox}
                aria-label={`Task item: ${sanitizeTextContent(content)}`}
              />
            )}
            {renderInlineContent(content, item.key)}
            {item.children &&
              item.children.items.length > 0 &&
              renderList(item.children)}
          </li>
        );
      })}
    </ListTag>
  );
}

function renderTable(
  table: Extract<ContentBlock, { type: "table" }>,
): JSX.Element {
  const getAlignmentClass = (align: string) => {
    if (align === "text-center") return "text-center";
    if (align === "text-right") return "text-right";
    return "text-left";
  };

  return (
    <div key={table.key} className={CONFIG.styling.table.container}>
      <table className={CONFIG.styling.table.table}>
        <thead>
          <tr>
            {table.headers.map((header, index) => (
              <th
                key={`${table.key}-th-${index}`}
                className={`${CONFIG.styling.table.th} ${getAlignmentClass(
                  table.alignments[index] ?? "text-left",
                )}`}
              >
                {renderInlineContent(header, `${table.key}-th-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={`${table.key}-tr-${rowIndex}`}
              className={CONFIG.styling.table.tr}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${table.key}-td-${rowIndex}-${cellIndex}`}
                  className={`${CONFIG.styling.table.td} ${getAlignmentClass(
                    table.alignments[cellIndex] ?? "text-left",
                  )}`}
                >
                  {renderInlineContent(
                    cell,
                    `${table.key}-td-${rowIndex}-${cellIndex}`,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(block: ContentBlock): JSX.Element | null {
  switch (block.type) {
    case "header": {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      const className = CONFIG.styling.header[block.level - 1];
      if (!className) return null;
      return (
        <Tag key={block.key} className={className}>
          {renderInlineContent(block.content, block.key)}
        </Tag>
      );
    }
    case "paragraph": {
      return (
        <p key={block.key} className={CONFIG.styling.paragraph}>
          {renderInlineContent(block.content, block.key)}
        </p>
      );
    }
    case "code": {
      return (
        <pre key={block.key} className={CONFIG.styling.codeBlock.pre}>
          <code className={CONFIG.styling.codeBlock.code}>
            {sanitizeTextContent(block.content)}
          </code>
        </pre>
      );
    }
    case "blockquote": {
      return (
        <blockquote key={block.key} className={CONFIG.styling.blockquote}>
          {block.content.map((b) => renderBlock(b))}
        </blockquote>
      );
    }
    case "hr": {
      return <hr key={block.key} className={CONFIG.styling.hr} />;
    }
    case "list": {
      return renderList(block);
    }
    case "table": {
      return renderTable(block);
    }
    case "image": {
      const sanitizedSrc = sanitizeUrl(block.src, "image");
      if (sanitizedSrc === "#") {
        return (
          <figure key={block.key} className={CONFIG.styling.image.figure}>
            <div className={CONFIG.styling.image.container}>
              [Image blocked: invalid or disallowed URL]
            </div>
          </figure>
        );
      }
      return (
        <figure key={block.key} className={CONFIG.styling.image.figure}>
          <div className={CONFIG.styling.image.container}>
            <Image
              src={sanitizedSrc}
              alt={sanitizeTextContent(block.alt)}
              title={sanitizeTextContent(block.title ?? "")}
              fill
              className={CONFIG.styling.image.image}
            />
          </div>
          {block.title && (
            <figcaption className={CONFIG.styling.image.caption}>
              {sanitizeTextContent(block.title)}
            </figcaption>
          )}
        </figure>
      );
    }
    default: {
      return null;
    }
  }
}

function getIndent(line: string): number {
  const match = line.match(/^\s*/);
  return match?.[0] ? Math.min(match[0].length, 100) : 0;
}

function parseToBlocks(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let i = 0;

  const maxBlocks = 10000;
  let blockCount = 0;

  while (i < lines.length && blockCount < maxBlocks) {
    blockCount++;
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }
    const key = `block-${i}`;

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (CONFIG.regex.codeFence.test(line)) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const currentLine = lines[i];
        if (
          currentLine === undefined ||
          CONFIG.regex.codeFence.test(currentLine)
        )
          break;
        codeLines.push(currentLine);
        i++;
      }
      blocks.push({
        type: "code",
        key,
        content: codeLines.join("\n").slice(0, 50000),
      });
      i++;
      continue;
    }

    const headerMatch = line.match(CONFIG.regex.header);
    if (headerMatch) {
      const levelText = headerMatch[1];
      const contentText = headerMatch[2];
      if (levelText && contentText) {
        blocks.push({
          type: "header",
          key,
          level: Math.min(levelText.length, 6),
          content: contentText,
        });
        i++;
        continue;
      }
    }

    if (CONFIG.regex.blockquote.test(line)) {
      const bqLines: string[] = [];
      while (i < lines.length && bqLines.length < 1000) {
        const currentLine = lines[i];
        if (currentLine === undefined) break;
        if (CONFIG.regex.blockquote.test(currentLine)) {
          bqLines.push(currentLine.replace(/^>\s?/, ""));
          i++;
        } else {
          const nextLine = lines[i + 1];
          if (
            currentLine.trim() === "" &&
            nextLine !== undefined &&
            CONFIG.regex.blockquote.test(nextLine)
          ) {
            bqLines.push("");
            i++;
          } else {
            break;
          }
        }
      }
      blocks.push({
        type: "blockquote",
        key,
        content: parseToBlocks(bqLines.join("\n")),
      });
      continue;
    }

    if (CONFIG.regex.hr.test(line)) {
      blocks.push({ type: "hr", key });
      i++;
      continue;
    }

    if (CONFIG.regex.listItem.test(line)) {
      const listStack: { list: ListBlock; indent: number }[] = [];
      let listEndIndex = i;
      while (listEndIndex < lines.length && listEndIndex - i < 1000) {
        const currentLine = lines[listEndIndex];
        if (currentLine === undefined) break;
        if (
          currentLine.trim() === "" ||
          CONFIG.regex.listItem.test(currentLine)
        ) {
          listEndIndex++;
        } else {
          break;
        }
      }
      const listLines = lines.slice(i, listEndIndex);
      i = listEndIndex;

      listLines.forEach((itemLine, index) => {
        if (itemLine.trim() === "") return;
        const match = itemLine.match(CONFIG.regex.listItem);
        if (!match) return;

        const indent = getIndent(itemLine);
        const marker = match[2];
        const content = match[3];
        if (marker === undefined || content === undefined) return;
        const newItem: ListItem = {
          key: `${key}-item-${index}`,
          content: content,
        };

        while (listStack.length > 0) {
          const topOfStack = listStack[listStack.length - 1];
          if (topOfStack && indent < topOfStack.indent) {
            listStack.pop();
          } else {
            break;
          }
        }

        const topOfStack = listStack[listStack.length - 1];
        if (!topOfStack || indent > topOfStack.indent) {
          const listType = marker.match(/\d/) ? "ol" : "ul";
          const start = listType === "ol" ? parseInt(marker, 10) : undefined;
          const newList: ListBlock = {
            key: `${key}-list-${index}`,
            listType,
            start,
            items: [newItem],
          };

          if (topOfStack) {
            const parentList = topOfStack.list;
            const lastParentItem =
              parentList.items[parentList.items.length - 1];
            if (lastParentItem) {
              lastParentItem.children = newList;
            }
          }
          listStack.push({ list: newList, indent });
        } else {
          topOfStack.list.items.push(newItem);
        }
      });

      const rootList = listStack[0];
      if (rootList) {
        blocks.push({ type: "list", ...rootList.list });
      }
      continue;
    }

    const imageMatch = line.match(CONFIG.regex.image);
    if (imageMatch) {
      const [, alt = "", src = "", title = ""] = imageMatch;
      blocks.push({ type: "image", key, src, alt, title });
      i++;
      continue;
    }

    const nextLine = lines[i + 1];
    if (
      CONFIG.regex.tableRow.test(line) &&
      nextLine !== undefined &&
      CONFIG.regex.tableSeparator.test(nextLine)
    ) {
      const tableLines = [line];
      let temp_i = i + 1;
      while (temp_i < lines.length && tableLines.length < 500) {
        const currentLine = lines[temp_i];
        if (
          currentLine === undefined ||
          !CONFIG.regex.tableRow.test(currentLine)
        )
          break;
        tableLines.push(currentLine);
        temp_i++;
      }
      const headerLine = tableLines[0];
      const separatorLine = tableLines[1];
      if (headerLine && separatorLine) {
        const headers = headerLine
          .split("|")
          .slice(1, -1)
          .map((s) => s.trim().slice(0, 200));
        const alignments = separatorLine
          .split("|")
          .slice(1, -1)
          .map((s) => {
            const cell = s.trim();
            if (cell.startsWith(":") && cell.endsWith(":"))
              return "text-center";
            if (cell.endsWith(":")) return "text-right";
            return "text-left";
          });
        const rows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .split("|")
            .slice(1, -1)
            .map((s) => s.trim().slice(0, 200)),
        );
        blocks.push({ type: "table", key, headers, alignments, rows });
        i = temp_i;
        continue;
      }
    }

    const paraLines: string[] = [line];
    i++;
    while (i < lines.length && paraLines.length < 100) {
      const currentLine = lines[i];
      if (
        currentLine === undefined ||
        currentLine.trim() === "" ||
        Object.values(CONFIG.regex).some((r) => r.test(currentLine))
      ) {
        break;
      }
      paraLines.push(currentLine);
      i++;
    }
    blocks.push({ type: "paragraph", key, content: paraLines.join("\n") });
  }

  return blocks;
}

const _formatContentUncached = (
  content?: string | null,
): (JSX.Element | null)[] => {
  if (!content) {
    return [];
  }

  if (content.length > SECURITY_CONFIG.maxContentLength) {
    console.error(
      `Content exceeds maximum length of ${SECURITY_CONFIG.maxContentLength}`,
    );
    return [
      <p key="error-length" style={{ color: "red", fontFamily: "monospace" }}>
        Error: Content exceeds size limit.
      </p>,
    ];
  }

  try {
    const blocks = withTimeout(
      () => parseToBlocks(content),
      PARSING_TIMEOUT_MS,
      [],
    );

    if (blocks.length === 0 && content.trim().length > 0) {
      console.error("Parsing failed or timed out");
      return [
        <p
          key="error-timeout"
          style={{ color: "red", fontFamily: "monospace" }}
        >
          Error: Content could not be processed.
        </p>,
      ];
    }

    return blocks.map((block) => renderBlock(block));
  } catch (error) {
    console.error("Content formatting error:", error);
    return [
      <p
        key="error-formatting"
        style={{ color: "red", fontFamily: "monospace" }}
      >
        Error: Unable to render content.
      </p>,
    ];
  }
};

export const formatContent = cache(_formatContentUncached);

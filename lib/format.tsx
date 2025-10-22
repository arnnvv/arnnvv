import Image from "next/image";
import { cache, type JSX, type ReactNode } from "react";
import {
  FORMATTER_CONFIG as CONFIG,
  DANGEROUS_HTML_PATTERN,
  MAX_CONTENT_LENGTH,
  MAX_INLINE_TOKENS,
  MAX_NESTING_DEPTH,
} from "./constants";
import type {
  ContentBlock,
  InlineToken,
  ListBlock,
  ListItem,
} from "./db/types";

function sanitizeTextContent(text: string): string {
  return text.replace(DANGEROUS_HTML_PATTERN, "");
}

function sanitizeUrl(raw: string | undefined | null): string {
  const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file|ftp):/i;
  const SAFE_PROTOCOLS = /^(https:|http:|mailto:)$/i;
  const SAFE_RELATIVE_PREFIXES = /^\/|^\.\/|^\.\.\/|^#/;

  if (!raw) return "#";

  const urlStr = String(raw).trim();

  if (DANGEROUS_PROTOCOLS.test(urlStr)) {
    return "#";
  }

  if (SAFE_RELATIVE_PREFIXES.test(urlStr)) {
    return urlStr;
  }

  try {
    const url = new URL(urlStr);
    if (SAFE_PROTOCOLS.test(url.protocol)) {
      return url.href;
    }
    return "#";
  } catch {
    return urlStr.startsWith("#") ? urlStr : "#";
  }
}

function tokenizeInlineContent(text: string, depth = 0): InlineToken[] {
  if (depth > MAX_NESTING_DEPTH) {
    return [{ type: "text", content: sanitizeTextContent(text) }];
  }

  const tokens: InlineToken[] = [];
  let position = 0;
  let tokenCount = 0;

  while (position < text.length && tokenCount < MAX_INLINE_TOKENS) {
    const remaining = text.slice(position);

    if (remaining.startsWith("***") || remaining.startsWith("___")) {
      const marker = remaining.slice(0, 3);
      const endIndex = remaining.indexOf(marker, 3);
      if (endIndex !== -1) {
        const content = remaining.slice(3, endIndex);
        if (content.length > 0) {
          tokens.push({
            type: "boldItalic",
            content,
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
      if (endIndex !== -1) {
        const content = remaining.slice(2, endIndex);
        if (content.length > 0) {
          tokens.push({
            type: "bold",
            content,
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
      const endIndex = remaining.indexOf(marker, 1);
      if (endIndex !== -1) {
        const content = remaining.slice(1, endIndex);
        if (content.length > 0) {
          tokens.push({
            type: "italic",
            content,
            children: tokenizeInlineContent(content, depth + 1),
          });
          position += endIndex + 1;
          tokenCount++;
          continue;
        }
      }
    }

    if (remaining.startsWith("~~")) {
      const endIndex = remaining.indexOf("~~", 2);
      if (endIndex !== -1) {
        const content = remaining.slice(2, endIndex);
        if (content.length > 0) {
          tokens.push({
            type: "strikethrough",
            content,
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
      if (endIndex !== -1) {
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

      if (closeBracket !== -1 && openParen === closeBracket + 1) {
        const closeParen = remaining.indexOf(")", openParen);
        if (closeParen !== -1) {
          const textOrAlt = remaining.slice(isImage ? 2 : 1, closeBracket);
          const urlPart = remaining.slice(openParen + 1, closeParen);
          const [src, ...titleParts] = urlPart.split(/\s+/);
          const title = titleParts.join(" ").replace(/"/g, "");

          if (isImage) {
            tokens.push({
              type: "image",
              alt: sanitizeTextContent(textOrAlt),
              url: sanitizeUrl(src),
              title: sanitizeTextContent(title),
            });
          } else {
            tokens.push({
              type: "link",
              content: sanitizeTextContent(textOrAlt),
              url: sanitizeUrl(src),
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
      tokens.push({
        type: "text",
        content: sanitizeTextContent(remaining[0]),
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
        return (
          <a
            key={key}
            href={token.url}
            title={token.title}
            className={CONFIG.styling.inline.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderInlineTokens(token.children || [], `${key}-l`)}
          </a>
        );

      case "image":
        return (
          <span
            key={key}
            className={CONFIG.styling.inline.image}
            title={token.title}
          >
            <Image
              src={token.url || "#"}
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
        const content = taskMatch ? taskMatch[2] : item.content;
        const isChecked = taskMatch ? taskMatch[1] === "x" : false;
        return (
          <li key={item.key} className={CONFIG.styling.list.listItem}>
            {taskMatch && (
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                className={CONFIG.styling.list.checkbox}
                aria-label={`Task item: ${content}`}
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
                  table.alignments[index],
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
                    table.alignments[cellIndex],
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
      return (
        <Tag key={block.key} className={CONFIG.styling.header[block.level - 1]}>
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
          <code className={CONFIG.styling.codeBlock.code}>{block.content}</code>
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
      return (
        <figure key={block.key} className={CONFIG.styling.image.figure}>
          <div className={CONFIG.styling.image.container}>
            <Image
              src={sanitizeUrl(block.src)}
              alt={block.alt}
              title={block.title}
              fill
              className={CONFIG.styling.image.image}
            />
          </div>
          {block.title && (
            <figcaption className={CONFIG.styling.image.caption}>
              {block.title}
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
  return match ? match[0].length : 0;
}

function parseToBlocks(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const key = `block-${i}`;
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (CONFIG.regex.codeFence.test(line)) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !CONFIG.regex.codeFence.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", key, content: codeLines.join("\n") });
      i++;
      continue;
    }
    const headerMatch = line.match(CONFIG.regex.header);
    if (headerMatch) {
      blocks.push({
        type: "header",
        key,
        level: Math.min(headerMatch[1].length, 6),
        content: headerMatch[2],
      });
      i++;
      continue;
    }
    if (CONFIG.regex.blockquote.test(line)) {
      const bqLines: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i];
        if (CONFIG.regex.blockquote.test(currentLine)) {
          bqLines.push(currentLine.replace(/^>\s?/, ""));
          i++;
        } else if (
          currentLine.trim() === "" &&
          i + 1 < lines.length &&
          CONFIG.regex.blockquote.test(lines[i + 1])
        ) {
          bqLines.push("");
          i++;
        } else {
          break;
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
      while (
        listEndIndex < lines.length &&
        (lines[listEndIndex].trim() === "" ||
          CONFIG.regex.listItem.test(lines[listEndIndex]))
      ) {
        listEndIndex++;
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
        const newItem: ListItem = {
          key: `${key}-item-${index}`,
          content: content,
        };

        while (
          listStack.length > 0 &&
          indent < listStack[listStack.length - 1].indent
        ) {
          listStack.pop();
        }

        if (
          listStack.length === 0 ||
          indent > listStack[listStack.length - 1].indent
        ) {
          const listType = marker.match(/\d/) ? "ol" : "ul";
          const start = listType === "ol" ? parseInt(marker, 10) : undefined;
          const newList: ListBlock = {
            key: `${key}-list-${index}`,
            listType,
            start,
            items: [newItem],
          };

          if (listStack.length > 0) {
            const parentList = listStack[listStack.length - 1].list;
            const lastParentItem =
              parentList.items[parentList.items.length - 1];
            lastParentItem.children = newList;
          }
          listStack.push({ list: newList, indent });
        } else {
          listStack[listStack.length - 1].list.items.push(newItem);
        }
      });

      if (listStack.length > 0) {
        blocks.push({ type: "list", ...listStack[0].list });
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
    if (
      CONFIG.regex.tableRow.test(line) &&
      i + 1 < lines.length &&
      CONFIG.regex.tableSeparator.test(lines[i + 1])
    ) {
      const tableLines = [line];
      let temp_i = i + 1;
      while (
        temp_i < lines.length &&
        CONFIG.regex.tableRow.test(lines[temp_i])
      ) {
        tableLines.push(lines[temp_i]);
        temp_i++;
      }
      const headers = tableLines[0]
        .split("|")
        .slice(1, -1)
        .map((s) => s.trim());
      const alignments = tableLines[1]
        .split("|")
        .slice(1, -1)
        .map((s) => {
          const cell = s.trim();
          if (cell.startsWith(":") && cell.endsWith(":")) return "text-center";
          if (cell.endsWith(":")) return "text-right";
          return "text-left";
        });
      const rows = tableLines.slice(2).map((rowLine) =>
        rowLine
          .split("|")
          .slice(1, -1)
          .map((s) => s.trim()),
      );
      blocks.push({ type: "table", key, headers, alignments, rows });
      i = temp_i;
      continue;
    }
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !Object.values(CONFIG.regex).some((r) => r.test(lines[i]))
    ) {
      paraLines.push(lines[i]);
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
  if (content.length > MAX_CONTENT_LENGTH) {
    console.error("Content exceeds maximum length and will not be rendered.");
    return [
      <p key="error-length" style={{ color: "red" }}>
        Error: Content is too large to display.
      </p>,
    ];
  }

  try {
    const blocks = parseToBlocks(content);
    return blocks.map((block) => renderBlock(block));
  } catch (error) {
    console.error("Error formatting content:", error);
    return [
      <p key="error-formatting" style={{ color: "red" }}>
        Error: Failed to format content.
      </p>,
    ];
  }
};

export const formatContent = cache(_formatContentUncached);

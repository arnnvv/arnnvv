import Image from "next/image";
import { cache, type JSX, type ReactNode } from "react";
import { FORMATTER_CONFIG as CONFIG, MAX_CONTENT_LENGTH } from "./constants";
import type { ContentBlock, ListBlock, ListItem } from "./db/types";

function sanitizeUrl(raw: string | undefined | null): string {
  const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;
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

  const url = new URL(urlStr);
  if (SAFE_PROTOCOLS.test(url.protocol)) {
    return url.href;
  }

  return "#";
}

function renderInlineContent(text: string, keySeed: string): ReactNode[] {
  if (!text) return [];

  const tokens = [];
  let cursor = 0;

  while (cursor < text.length) {
    const remainingText = text.slice(cursor);

    if (remainingText.startsWith("***") || remainingText.startsWith("___")) {
      const marker = remainingText.slice(0, 3);
      const endMarkerIndex = remainingText.indexOf(marker, 3);
      if (endMarkerIndex !== -1) {
        const content = remainingText.slice(3, endMarkerIndex);
        tokens.push(
          <strong key={`${keySeed}-${cursor}`}>
            <em>{renderInlineContent(content, `${keySeed}-${cursor}-bi`)}</em>
          </strong>,
        );
        cursor += endMarkerIndex + 3;
        continue;
      }
    }

    if (remainingText.startsWith("**") || remainingText.startsWith("__")) {
      const marker = remainingText.slice(0, 2);
      const endMarkerIndex = remainingText.indexOf(marker, 2);
      if (endMarkerIndex !== -1) {
        const content = remainingText.slice(2, endMarkerIndex);
        tokens.push(
          <strong key={`${keySeed}-${cursor}`}>
            {renderInlineContent(content, `${keySeed}-${cursor}-b`)}
          </strong>,
        );
        cursor += endMarkerIndex + 2;
        continue;
      }
    }

    if (remainingText.startsWith("*") || remainingText.startsWith("_")) {
      const marker = remainingText[0];
      const endMarkerIndex = remainingText.indexOf(marker, 1);
      if (endMarkerIndex !== -1) {
        const content = remainingText.slice(1, endMarkerIndex);
        tokens.push(
          <em key={`${keySeed}-${cursor}`}>
            {renderInlineContent(content, `${keySeed}-${cursor}-i`)}
          </em>,
        );
        cursor += endMarkerIndex + 1;
        continue;
      }
    }

    if (remainingText.startsWith("~~")) {
      const endMarkerIndex = remainingText.indexOf("~~", 2);
      if (endMarkerIndex !== -1) {
        const content = remainingText.slice(2, endMarkerIndex);
        tokens.push(
          <del key={`${keySeed}-${cursor}`}>
            {renderInlineContent(content, `${keySeed}-${cursor}-s`)}
          </del>,
        );
        cursor += endMarkerIndex + 2;
        continue;
      }
    }

    if (remainingText.startsWith("`")) {
      const endMarkerIndex = remainingText.indexOf("`", 1);
      if (endMarkerIndex !== -1) {
        const content = remainingText.slice(1, endMarkerIndex);
        tokens.push(
          <code
            key={`${keySeed}-${cursor}`}
            className={CONFIG.styling.inline.code}
          >
            {content}
          </code>,
        );
        cursor += endMarkerIndex + 1;
        continue;
      }
    }

    if (remainingText.startsWith("[") || remainingText.startsWith("![")) {
      const isImage = remainingText.startsWith("!");
      const closeBracketIndex = remainingText.indexOf("]");
      const openParenIndex = remainingText.indexOf("(", closeBracketIndex);

      if (
        closeBracketIndex !== -1 &&
        openParenIndex === closeBracketIndex + 1
      ) {
        const closeParenIndex = remainingText.indexOf(")", openParenIndex);
        if (closeParenIndex !== -1) {
          const textOrAlt = remainingText.slice(
            isImage ? 2 : 1,
            closeBracketIndex,
          );
          const urlPart = remainingText.slice(
            openParenIndex + 1,
            closeParenIndex,
          );
          const [src, ...titleParts] = urlPart.split(/\s+/);
          const title = titleParts.join(" ").replace(/"/g, "");

          if (isImage) {
            tokens.push(
              <span
                key={`${keySeed}-${cursor}`}
                className={CONFIG.styling.inline.image}
                title={title}
              >
                <Image
                  src={sanitizeUrl(src)}
                  alt={textOrAlt}
                  fill
                  className={CONFIG.styling.image.image}
                />
              </span>,
            );
          } else {
            tokens.push(
              <a
                key={`${keySeed}-${cursor}`}
                href={sanitizeUrl(src)}
                title={title}
                className={CONFIG.styling.inline.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderInlineContent(textOrAlt, `${keySeed}-${cursor}-l`)}
              </a>,
            );
          }
          cursor += closeParenIndex + 1;
          continue;
        }
      }
    }

    if (remainingText.startsWith("  \n")) {
      tokens.push(<br key={`${keySeed}-${cursor}`} />);
      cursor += 3;
      continue;
    }

    const nextMarker = remainingText
      .slice(1)
      .search(/(\*{1,3}|_{1,3}|~~|`|!?\[| {2,}\n)/);
    const textEnd = nextMarker === -1 ? remainingText.length : nextMarker + 1;
    tokens.push(remainingText.slice(0, textEnd));
    cursor += textEnd;
  }

  return tokens;
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
  const blocks = parseToBlocks(content);
  return blocks.map((block) => renderBlock(block));
};

export const formatContent = cache(_formatContentUncached);

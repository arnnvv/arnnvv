import type { JSX } from "react";

export function wrapWordsWithTransition(
  title: string,
  prefix: string,
  className?: string,
): JSX.Element[] {
  const wordCounts: { [key: string]: number } = {};
  return title.split(" ").map((origWord) => {
    const word = origWord.toLowerCase().replace(/[^a-z0-9\s-_]/g, "");

    const count = wordCounts[word] ?? 0;
    wordCounts[word] = (wordCounts[word] ?? 0) + 1;

    const uniqueName = `${prefix}-${word}-${count}`;

    return (
      <span
        key={uniqueName}
        className={className}
        style={{
          viewTransitionName: uniqueName,
          display: "inline-block",
        }}
      >
        {`${origWord}\u00A0`}
      </span>
    );
  });
}

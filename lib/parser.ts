class ParseError extends Error {
  constructor(
    public path: string[],
    public expectedType: string,
    public receivedValue: unknown,
  ) {
    const receivedType = receivedValue === null ? "null" : typeof receivedValue;
    const message = `Validation failed at path "${path.join(
      ".",
    )}": Expected type "${expectedType}", but received type "${receivedType}" with value: ${JSON.stringify(
      receivedValue,
    )}`;
    super(message);
    this.name = "ParseError";
  }
}

export class ObjectParser {
  private data: unknown;

  constructor(data: unknown) {
    if (typeof data !== "object" || data === null) {
      throw new TypeError("ObjectParser must be initialized with an object.");
    }
    this.data = data;
  }

  private get(path: string[]): unknown {
    let value = this.data;
    for (const key of path) {
      if (
        typeof value !== "object" ||
        value === null ||
        !Object.hasOwn(value, key)
      ) {
        return undefined;
      }
      value = (value as Record<string, unknown>)[key];
    }
    return value;
  }

  private getTyped<T>(
    type: "string" | "number" | "boolean",
    path: string[],
  ): T {
    const value = this.get(path);

    if (value === undefined || value === null) {
      throw new ParseError(path, type, value);
    }

    if (typeof value !== type) {
      throw new ParseError(path, type, value);
    }

    return value as T;
  }

  public getString(...path: string[]): string {
    return this.getTyped<string>("string", path);
  }

  public getNumber(...path: string[]): number {
    return this.getTyped<number>("number", path);
  }
}

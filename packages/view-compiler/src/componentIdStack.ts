class ComponentIdStack {
  private static readonly stack: string[] = [];

  static push(id: string): void {
    this.stack.push(id);
  }

  static peek(): string | null {
    return this.stack[this.stack.length - 1] ?? null;
  }

  static pop(): string | null {
    return this.stack.pop() ?? null;
  }
}

export { ComponentIdStack };

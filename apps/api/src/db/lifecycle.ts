export function createDatabaseLifecycle<T extends { $disconnect(): Promise<void> }>(factory: () => T) {
  let client: T | undefined;
  let closed = false;
  let closing: Promise<void> | undefined;
  return {
    get(): T {
      if (closed) throw new Error("Database client is shutting down");
      return client ??= factory();
    },
    close(): Promise<void> {
      closed = true;
      return closing ??= client ? client.$disconnect() : Promise.resolve();
    }
  };
}

import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createApp } from "./app.js";

test("GET /health reports live API", async () => {
  const server = createApp().listen(0);
  try {
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      service: "amplifyworld-api",
      status: "ok"
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("unknown route returns 404", async () => {
  const server = createApp().listen(0);
  try {
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/no-route`);
    assert.equal(response.status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("Module 12 endpoints fail closed when database and collection are unconfigured", async () => {
  const server = createApp().listen(0);
  try {
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    for (const [method, path] of [
      ["POST", "/api/v1/inquiries"], ["GET", "/api/v1/posts"], ["GET", "/api/v1/projects"]
    ]) {
      const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { method });
      assert.equal(response.status, 503);
      const payload = await response.json() as { error?: { code: string } };
      assert.ok(payload.error?.code);
    }
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

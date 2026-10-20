import assert from "node:assert/strict";
import test from "node:test";
import { BRAND_NAME, SERVICES } from "../dist/index.js";

test("brand and service taxonomy", () => {
  assert.equal(BRAND_NAME, "AmplifyWorld");
  assert.equal(SERVICES.length, 6);
  assert.equal(new Set(SERVICES.map((service) => service.id)).size, 6);
});

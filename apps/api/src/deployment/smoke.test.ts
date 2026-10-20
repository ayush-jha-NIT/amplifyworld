import assert from "node:assert/strict";
import test from "node:test";
import { smokeDeployment } from "./smoke.js";
const fetcher = (async (url: URL) => {
  const path = url.pathname;
  if (path==="/health")return new Response('{"service":"amplifyworld-api","status":"ok"}',{status:200});
  if (path==="/api/v1/ready")return new Response('{"error":{"code":"DATABASE_UNAVAILABLE"}}',{status:503});
  if (path==="/contact")return new Response("<h1>Contact AmplifyWorld</h1>",{status:200});
  return new Response("<h1>AmplifyWorld</h1>",{status:200});
}) as typeof fetch;

test("read-only smoke accepts explicit non-DB health-only deployment",async()=>{
 const result=await smokeDeployment("https://website.example","https://api.example",false,fetcher);
 assert.equal(result.length,4);
 assert.ok(result.every(x=>x.verified));
});
test("smoke cannot falsely claim database readiness when DB is absent",async()=>{
 await assert.rejects(smokeDeployment("https://website.example","https://api.example",true,fetcher),/api\/ready/);
});
test("smoke rejects unknown and unsafe destination origins before network calls",async()=>{
 await assert.rejects(smokeDeployment("http://example.com","https://api.example",false,fetcher),/HTTPS origin/);
 await assert.rejects(smokeDeployment("https://website.example/unsafe","https://api.example",false,fetcher),/HTTPS origin/);
 await assert.rejects(smokeDeployment("https://name:pass@example.com","https://api.example",false,fetcher),/HTTPS origin/);
});

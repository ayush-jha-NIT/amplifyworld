import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");
test("admin noindex and OIDC PKCE flow without persistent access token",()=>{
  const page=read("app/admin/page.tsx"),src=read("components/admin/admin-console.tsx");
  assert.match(page,/index: false/);
  for(const t of ["NEXT_PUBLIC_ADMIN_OIDC_CLIENT_ID","code_challenge_method","SHA-256","amplifyworld-admin-pkce","sessionStorage.removeItem","setToken("])assert.ok(src.includes(t),t);
  assert.ok(!src.includes("localStorage"));
});
test("console exposes editorial workflows, respects server-reported admin role",()=>{
  const src=read("components/admin/admin-console.tsx");
  for(const t of ["ADMIN","EDITOR","publish","unpublish","archive","review","audit","categoryId"])assert.ok(src.includes(t),t);
});

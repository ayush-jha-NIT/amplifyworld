import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Marketing routes have truthful canonical and structured metadata",()=>{
 for(const p of ["app/page.tsx","app/about/page.tsx","app/contact/page.tsx"]){
  const content=read(p);
  assert.match(content,/alternates: \{ canonical/);
  assert.match(content,/openGraph:/);
  assert.match(content,/StructuredData/);
 }
 for(const p of ["app/blog/page.tsx","app/portfolio/page.tsx","app/admin/page.tsx"]){
  assert.match(read(p),/index: false/);
 }
});
test("Preview routing, late motion and image priority are safe",()=>{
 assert.match(read("app/robots.ts"),/disallow: "\/"/);
 assert.match(read("app/sitemap.ts"),/marketingRoutes/);
 assert.match(read("components/home/section-reveal.tsx"),/observer\?\.disconnect/);
 assert.match(read("components/home/section-reveal.tsx"),/motion.removeEventListener/);
 assert.match(read("app/portfolio/page.tsx"),/loading="lazy"/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { absolutePublicUrl, marketingRoutes, marketingWebPage, siteOrigin, structuredEntity } from "../lib/site";

const configured = {
  SITE_INDEXING_ENABLED: "true", NEXT_PUBLIC_SITE_URL: "https://amplify.example/"
};

test("SEO indexing fails closed in previews and without verified explicit activation", () => {
  assert.equal(siteOrigin({}), null);
  assert.equal(siteOrigin({ NEXT_PUBLIC_SITE_URL: configured.NEXT_PUBLIC_SITE_URL }), null);
  assert.equal(siteOrigin({ ...configured, VERCEL_ENV: "preview" }), null);
  assert.equal(siteOrigin({ ...configured, VERCEL_ENV: "development" }), null);
  assert.equal(siteOrigin({ ...configured, NEXT_PUBLIC_SITE_URL: "http://example.com/" }), null);
  assert.equal(siteOrigin({ ...configured, NEXT_PUBLIC_SITE_URL: "https://example.com/other" }), null);
  assert.equal(siteOrigin({ ...configured, NEXT_PUBLIC_SITE_URL: "https://foo:bar@example.com/" }), null);
  assert.equal(siteOrigin({ ...configured, NEXT_PUBLIC_SITE_URL: "https://localhost/" }), null);
  assert.equal(siteOrigin(configured)?.href, "https://amplify.example/");
});

test("canonical URL helper includes only approved, query-free local routes", () => {
  assert.deepEqual(marketingRoutes, ["/", "/about", "/contact"]);
  assert.equal(absolutePublicUrl("/about", configured), "https://amplify.example/about");
  assert.equal(absolutePublicUrl("/contact", configured), "https://amplify.example/contact");
  assert.equal(absolutePublicUrl("/", configured), "https://amplify.example/");
  assert.equal(absolutePublicUrl("//untrusted.test", configured), null);
  assert.equal(absolutePublicUrl("/blog?article=demo", configured), null);
  assert.equal(absolutePublicUrl("/contact", {}), null);
});

test("JSON-LD serialization never emits raw HTML tags or unsafe external claims", () => {
  assert.equal(structuredEntity({ name: "<script>bad</script>" }).includes("<script>"), false);
  const original = JSON.parse(structuredEntity({ title: "<div>safe</div>" })) as { title: string };
  assert.equal(original.title, "<div>safe</div>");
  assert.equal(marketingWebPage("/", "Test", "Test"), null); // no live indexing env by default
});

/** Read-only deploy probes. No customer data, login, email or database mutation. */
type Fetcher = typeof fetch;
export type SmokeResult = { path: string; status: number; verified: boolean };

function parseOrigin(raw: string | undefined): URL {
  if (!raw) throw new Error("A verified production URL is required");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.origin !== raw || !url.hostname.includes(".") ||
    url.username || url.password || url.search || url.hash) {
    throw new Error("Production smoke URLs must be a plain HTTPS origin");
  }
  return url;
}
export async function smokeDeployment(
  webUrl: string | undefined, apiUrl: string | undefined,
  expectDb: boolean, request: Fetcher = fetch
): Promise<SmokeResult[]> {
  const web = parseOrigin(webUrl);
  const api = parseOrigin(apiUrl);
  const checks = [
    { path:"web/", url:new URL("/",web), status:200, expected:"AmplifyWorld" },
    { path:"web/contact",url:new URL("/contact",web),status:200,expected:"Contact" },
    { path:"api/health",url:new URL("/health",api),status:200,expected:"amplifyworld-api" },
    { path:"api/ready",url:new URL("/api/v1/ready",api),status:expectDb?200:503,expected:expectDb?'"ready"':"DATABASE_UNAVAILABLE"}
  ];
  const results: SmokeResult[] = [];
  for (const probe of checks) {
    const response = await request(probe.url, {
      method:"GET", redirect:"error", cache:"no-store",
      signal:AbortSignal.timeout(10_000)
    });
    const body = (await response.text()).slice(0,150_000);
    const verified = response.status === probe.status && body.includes(probe.expected);
    results.push({path:probe.path,status:response.status,verified});
    if (!verified) throw new Error("Deployment smoke failure on "+probe.path+" (HTTP "+response.status+")");
  }
  return results;
}

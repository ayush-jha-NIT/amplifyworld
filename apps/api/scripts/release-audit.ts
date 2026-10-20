import "dotenv/config";
import { readFileSync } from "node:fs";
import { evaluateRelease, parseReleaseEvidence, releaseProfiles } from "../src/release/audit.js";
import type { ReleaseProfile } from "../src/release/audit.js";

// The tool evaluates operator-attested evidence; it NEVER asserts that external
// URLs work, nor logs the evidence file contents/credentials/contact data.
const [profileArg, file] = process.argv.slice(2);
if (!profileArg || !(profileArg in releaseProfiles) || !file) {
  console.error("Usage: pnpm release:audit <preview|public-site|full-production> <evidence-file.json>");
  process.exitCode=2;
} else {
  try {
    const body: unknown=JSON.parse(readFileSync(file,"utf8"));
    const evidence=parseReleaseEvidence(body);
    const result=evaluateRelease(evidence,profileArg as ReleaseProfile);
    console.info("Release readiness:",result.profile);
    console.info("Reported gates:",result.gatesReportedPassed+"/"+result.gatesRequired);
    if (result.missing.length){
      console.error("Blocked gates:",result.missing.join(", "));
      process.exitCode=1;
    } else {
      console.info("All mandatory claims have links. MANUAL verification and signoff still required.");
    }
  } catch {
    console.error("Release audit input is invalid or unavailable; review the evidence template.");
    process.exitCode=2;
  }
}

/**
 * Module 18 release handover gates. Operator claims are NOT independent
 * verification: evidence links must be checked by a human before sign-off.
 * The release tool never contacts cloud resources, reads secrets or changes data.
 */
export const gateNames = [
  "githubCiGreen",
  "frontendDeployed",
  "frontendSmokeVerified",
  "approvedPublicContent",
  "mobileManualReview",
  "securityReview",
  "rollbackPlanTested",
  "apiDeployed",
  "apiHealthVerified",
  "dedicatedNeon",
  "migrationsApplied",
  "leastPrivilegeVerified",
  "databaseReadinessVerified",
  "adminIdentityVerified",
  "privacyAndRetentionApproved",
  "cleanupJobVerified",
  "inquiryEndToEndVerified",
  "resendSenderVerified",
  "notificationWorkerVerified",
  "emailDeliveryVerified",
  "seoCanonicalVerified"
] as const;
export type GateName = (typeof gateNames)[number];
export type GateEvidence = { status: "blocked" | "passed"; evidenceUrl?: string };
export type ReleaseEvidence = {
  schemaVersion: 1;
  sourceCommit: string;
  gates: Record<GateName, GateEvidence>;
};
export type ReleaseProfile = "preview" | "public-site" | "full-production";

const preview = [
  "githubCiGreen", "frontendDeployed", "frontendSmokeVerified",
  "approvedPublicContent", "mobileManualReview", "securityReview",
  "rollbackPlanTested"
] as const satisfies readonly GateName[];
const publicSite = [
  ...preview, "apiDeployed", "apiHealthVerified", "dedicatedNeon",
  "migrationsApplied", "leastPrivilegeVerified", "databaseReadinessVerified"
] as const satisfies readonly GateName[];
const fullProduction = [
  ...publicSite, "adminIdentityVerified", "privacyAndRetentionApproved",
  "cleanupJobVerified", "inquiryEndToEndVerified", "resendSenderVerified",
  "notificationWorkerVerified", "emailDeliveryVerified", "seoCanonicalVerified"
] as const satisfies readonly GateName[];

export const releaseProfiles: Record<ReleaseProfile, readonly GateName[]> = {
  preview, "public-site": publicSite, "full-production": fullProduction
};

function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function safeEvidenceUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.length > 800) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && Boolean(u.hostname.includes(".")) &&
      !u.username && !u.password && !u.hash &&
      !u.searchParams.has("token") && !u.searchParams.has("key") &&
      !u.searchParams.has("secret") && !u.searchParams.has("password");
  } catch { return false; }
}
export function parseReleaseEvidence(data: unknown): ReleaseEvidence {
  if (!object(data) || data.schemaVersion !== 1 || !object(data.gates) ||
    typeof data.sourceCommit !== "string" ||
    (data.sourceCommit !== "" && !/^[0-9a-f]{40}$/i.test(data.sourceCommit))) {
    throw new Error("Release evidence has an invalid version, source SHA or gate object");
  }
  const allowed = new Set<string>(gateNames);
  if (Object.keys(data.gates).some(key => !allowed.has(key))) {
    throw new Error("Release evidence contains an unknown gate");
  }
  const result = {} as Record<GateName, GateEvidence>;
  for (const key of gateNames) {
    const raw = data.gates[key];
    if (!object(raw) || !["blocked", "passed"].includes(String(raw.status))) {
      throw new Error("Release evidence gate invalid: " + key);
    }
    if (raw.status === "passed" && (!safeEvidenceUrl(raw.evidenceUrl) || !data.sourceCommit)) {
      throw new Error("Passed gate must have HTTPS evidence and source commit: " + key);
    }
    if (raw.evidenceUrl && !safeEvidenceUrl(raw.evidenceUrl)) {
      throw new Error("Unsafe evidence URL: " + key);
    }
    result[key] = { status: raw.status as GateEvidence["status"],
      ...(typeof raw.evidenceUrl === "string" ? { evidenceUrl: raw.evidenceUrl } : {}) };
  }
  return { schemaVersion: 1, sourceCommit: data.sourceCommit, gates: result };
}
export function evaluateRelease(evidence: ReleaseEvidence, profile: ReleaseProfile) {
  const requirements = releaseProfiles[profile];
  const missing = requirements.filter(name => evidence.gates[name].status !== "passed");
  return {
    profile,
    eligibleForHumanSignoff: missing.length === 0,
    gatesRequired: requirements.length,
    gatesReportedPassed: requirements.length - missing.length,
    missing
  };
}

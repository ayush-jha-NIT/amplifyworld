import assert from "node:assert/strict";
import test from "node:test";
import { assertDeploymentEnvironment, deploymentIssues } from "./config.js";

const origin = "https://amplifyworld.example";
const db = "postgresql://limited:secret@db.example.net/amplify?sslmode=verify-full";
const active = {
  NODE_ENV: "production", CLIENT_ORIGIN: origin, TRUST_PROXY_HOPS: "1",
  DATABASE_URL: db, INQUIRY_COLLECTION_ENABLED: "true",
  INQUIRY_PRIVACY_POLICY_APPROVED: "true", INQUIRY_RETENTION_DAYS: "30",
  INQUIRY_RETENTION_CLEANUP_ENABLED: "true",
  INQUIRY_ABUSE_HASH_SECRET: "private-value-with-at-least-32-characters"
};
test("production health-only API can start while live inquiry services stay disabled", () => {
  assert.deepEqual(deploymentIssues({ NODE_ENV: "production", CLIENT_ORIGIN: origin,
    INQUIRY_COLLECTION_ENABLED: "false", INQUIRY_EMAIL_ENABLED: "false" }), []);
  assert.doesNotThrow(() => assertDeploymentEnvironment({
    NODE_ENV:"production", CLIENT_ORIGIN:origin, INQUIRY_COLLECTION_ENABLED:"false"
  }));
});
test("production rejects absent or insecure browser origins and privileged migration URL", () => {
  assert.ok(deploymentIssues({NODE_ENV:"production"}).includes("CLIENT_ORIGIN"));
  assert.ok(deploymentIssues({...active, CLIENT_ORIGIN:"https://example.com/"}).includes("CLIENT_ORIGIN"));
  assert.ok(deploymentIssues({...active, CLIENT_ORIGIN:"http://localhost:3000"}).includes("CLIENT_ORIGIN"));
  assert.ok(deploymentIssues({...active, DIRECT_URL:db}).includes("MIGRATION_CREDENTIALS_NOT_ALLOWED_ON_API"));
});
test("production collection requires TLS, privacy, retention, deletion task and trusted proxy", () => {
  assert.deepEqual(deploymentIssues(active), []);
  assert.ok(deploymentIssues({...active, DATABASE_URL:"postgresql://limited:secret@db.example.net/amplify?sslmode=disable"}).includes("DATABASE_URL_TLS"));
  assert.ok(deploymentIssues({...active, INQUIRY_RETENTION_CLEANUP_ENABLED:"false"}).includes("INQUIRY_RETENTION_CLEANUP_ENABLED"));
  assert.ok(deploymentIssues({...active, TRUST_PROXY_HOPS:"0"}).includes("TRUST_PROXY_HOPS"));
  assert.ok(deploymentIssues({...active, INQUIRY_RETENTION_DAYS:"0"}).includes("INQUIRY_RETENTION_DAYS"));
  assert.ok(deploymentIssues({...active, INQUIRY_PRIVACY_POLICY_APPROVED:"false"}).includes("INQUIRY_PRIVACY_POLICY_APPROVED"));
});
test("Resend cannot become active without verified configuration and worker confirmation", () => {
  const enabled = {...active, INQUIRY_EMAIL_ENABLED:"true", RESEND_API_KEY:"re_private-credential",
    RESEND_FROM_EMAIL:"sender@example.org", INQUIRY_NOTIFY_EMAIL:"inbox@example.org",
    INQUIRY_NOTIFICATION_WORKER_CONFIRMED:"true"};
  assert.deepEqual(deploymentIssues(enabled,"worker"),[]);
  assert.ok(deploymentIssues({...enabled, INQUIRY_NOTIFICATION_WORKER_CONFIRMED:"false"}).includes("INQUIRY_NOTIFICATION_WORKER_CONFIRMED"));
  assert.ok(deploymentIssues({...enabled, RESEND_FROM_EMAIL:"not-an-email"}).includes("RESEND_FROM_EMAIL"));
  assert.ok(deploymentIssues({...enabled, INQUIRY_EMAIL_ENABLED:"false"},"worker").includes("INQUIRY_EMAIL_ENABLED"));
});
test("no credential values or private emails appear in reported issues",()=>{
  const issues = deploymentIssues({ ...active, DATABASE_URL:"postgresql://secret:EXTRAPRIVATE@host/secret?sslmode=disable",
    INQUIRY_EMAIL_ENABLED:"true", INQUIRY_NOTIFY_EMAIL:"private-operator@example.org"});
  const serialized = JSON.stringify(issues);
  assert.doesNotMatch(serialized,/EXTRAPRIVATE|private-operator|secret:|re_private/);
});

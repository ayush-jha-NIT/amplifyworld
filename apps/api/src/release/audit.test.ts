import assert from "node:assert/strict";
import test from "node:test";
import { evaluateRelease, gateNames, parseReleaseEvidence } from "./audit.js";
const proof="https://github.com/ayush-jha-NIT/amplifyworld/actions/runs/123";
const sha="a".repeat(40);
const fixture=()=>({schemaVersion:1,sourceCommit:"",
  gates:Object.fromEntries(gateNames.map(g=>[g,{status:"blocked",evidenceUrl:""}]))});
test("fresh release evidence is blocked by default, including front-end only",()=>{
 const record=parseReleaseEvidence(fixture());
 for(const phase of ["preview","public-site","full-production"] as const){
  const result=evaluateRelease(record,phase);
  assert.equal(result.eligibleForHumanSignoff,false);
  assert.ok(result.gatesRequired > 0);
 }
});
test("release gate rejects unreviewed and missing evidence",()=>{
 const obj=fixture();obj.sourceCommit=sha;
 obj.gates.githubCiGreen={status:"passed",evidenceUrl:""};
 assert.throws(()=>parseReleaseEvidence(obj),/HTTPS evidence/);
 obj.gates.githubCiGreen.evidenceUrl=proof;
 assert.equal(parseReleaseEvidence(obj).gates.githubCiGreen.status,"passed");
 obj.gates.githubCiGreen.evidenceUrl="http://github.com/review";
 assert.throws(()=>parseReleaseEvidence(obj),/HTTPS evidence/);
 obj.gates.githubCiGreen.evidenceUrl="https://foo:password@example.com/";
 assert.throws(()=>parseReleaseEvidence(obj),/HTTPS evidence/);
 obj.gates.githubCiGreen.evidenceUrl="https://example.org/?token=secret";
 assert.throws(()=>parseReleaseEvidence(obj),/HTTPS evidence/);
});
test("preview, public-site and full production have independently escalating obligations",()=>{
 const obj=fixture();obj.sourceCommit=sha;
 for(const k of gateNames)obj.gates[k]={status:"passed",evidenceUrl:proof};
 const record=parseReleaseEvidence(obj);
 for(const phase of ["preview","public-site","full-production"] as const){
  assert.equal(evaluateRelease(record,phase).eligibleForHumanSignoff,true);
 }
 obj.gates.emailDeliveryVerified.status="blocked";
 const changed=parseReleaseEvidence(obj);
 assert.equal(evaluateRelease(changed,"preview").eligibleForHumanSignoff,true);
 assert.equal(evaluateRelease(changed,"public-site").eligibleForHumanSignoff,true);
 assert.equal(evaluateRelease(changed,"full-production").eligibleForHumanSignoff,false);
});
test("unknown checks and inconsistent object shape fail closed",()=>{
 const obj=fixture();
 (obj.gates as Record<string,unknown>).someUnknownGate={status:"passed",evidenceUrl:proof};
 assert.throws(()=>parseReleaseEvidence(obj),/unknown gate/);
 delete (obj.gates as Record<string,unknown>).someUnknownGate;
 obj.schemaVersion=3;
 assert.throws(()=>parseReleaseEvidence(obj),/invalid version/);
});

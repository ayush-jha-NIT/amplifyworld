import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import express from "express";
import test from "node:test";
import { createAdminRouter } from "./router.js";
import { verifyOidcSubject } from "./auth.js";

const { privateKey, publicKey }=generateKeyPairSync("rsa",{modulusLength:2048});
const jwk=publicKey.export({format:"jwk"});
const env={ADMIN_OIDC_ISSUER:"https://login.example.org/tenant",ADMIN_OIDC_AUDIENCE:"amplify-api",
  ADMIN_OIDC_JWKS_URL:"https://login.example.org/keys"};
const fetcher=(async()=>new Response(JSON.stringify({keys:[{...jwk,kid:"unit",use:"sig",alg:"RS256"}]}),{status:200})) as typeof fetch;
function token(changes:Record<string,unknown>={},headerChanges:Record<string,unknown>={}) {
  const part=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString("base64url");
  const header=part({alg:"RS256",kid:"unit",typ:"JWT",...headerChanges});
  const claims=part({iss:env.ADMIN_OIDC_ISSUER,aud:env.ADMIN_OIDC_AUDIENCE,sub:"admin-subject",
    exp:Math.floor(Date.now()/1000)+2400,iat:Math.floor(Date.now()/1000),...changes});
  const message=header+"."+claims;
  return message+"."+sign("RSA-SHA256",Buffer.from(message),privateKey).toString("base64url");
}
test("valid RSA signed OIDC token verifies only correct subject",async()=>{
  assert.equal(await verifyOidcSubject(token(),env,fetcher),"admin-subject");
  assert.equal(await verifyOidcSubject(token({aud:"wrong"}),env,fetcher),null);
  assert.equal(await verifyOidcSubject(token({iss:"https://evil.example.org"}),env,fetcher),null);
  assert.equal(await verifyOidcSubject(token({exp:100}),env,fetcher),null);
  assert.equal(await verifyOidcSubject(token({nbf:Math.floor(Date.now()/1000)+1000}),env,fetcher),null);
  assert.equal(await verifyOidcSubject(token({sub:""}),env,fetcher),null);
  assert.equal(await verifyOidcSubject(token({}, {alg:"none"}),env,fetcher),null);
  assert.equal(await verifyOidcSubject(token().slice(0,-3)+"BAD",env,fetcher),null);
  assert.equal(await verifyOidcSubject("not-a-jwt",env,fetcher),null);
});
test("OIDC fails closed with missing credentials or insecure issuer",async()=>{
  assert.equal(await verifyOidcSubject(token(),{},fetcher),null);
  assert.equal(await verifyOidcSubject(token(),{...env,ADMIN_OIDC_ISSUER:"http://login.example.org/tenant"},fetcher),null);
});
async function requestAs(auth:()=>Promise<{id:string;role:"EDITOR"|"ADMIN"}|null>,testRequest:(url:string)=>Promise<void>) {
  const app=express();
  app.use(express.json());
  app.use("/api/v1/admin",createAdminRouter(auth));
  const server=app.listen(0);
  try {
    await once(server,"listening");
    const address=server.address() as AddressInfo;
    await testRequest("http://127.0.0.1:"+address.port);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
}
test("private admin routes deny unauthenticated requests and editor approval",async()=>{
  await requestAs(async()=>null,async url=>{
    const response=await fetch(url+"/api/v1/admin/me");
    assert.equal(response.status,401);
    assert.equal((await response.json() as {error:{code:string}}).error.code,"UNAUTHORIZED");
  });
  await requestAs(async()=>({id:"1fcf30f5-1c0b-4b6a-bb7a-ed9287af37dd",role:"EDITOR"}),async url=>{
    assert.equal((await fetch(url+"/api/v1/admin/posts/not-an-id/publish",{method:"POST",
      headers:{"Content-Type":"application/json"},body:"{}"})).status,403);
    assert.equal((await fetch(url+"/api/v1/admin/audit")).status,403);
    assert.equal((await fetch(url+"/api/v1/admin/categories",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({slug:"test",name:"Test"})})).status,403);
  });
});

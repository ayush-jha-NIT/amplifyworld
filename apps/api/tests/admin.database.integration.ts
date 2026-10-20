import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import express from "express";
import { after, before, test } from "node:test";
import { getDatabase, disconnectDatabase } from "../src/db/client.js";
import { createAdminRouter } from "../src/admin/router.js";

const db=getDatabase();
const seed=randomUUID().slice(0,8);
let editorId="",administratorId="",categoryId="",postId="",projectId="";
let base="",server:ReturnType<ReturnType<typeof express>["listen"]>;
let role:"EDITOR"|"ADMIN"="EDITOR";
const api=(path:string,method="GET",body:unknown=undefined)=>
  fetch(base+"/api/v1/admin/"+path,{method,headers:{"Content-Type":"application/json"},
    ...(body!==undefined?{body:JSON.stringify(body)}:{})});
before(async()=>{
  const editor=await db.adminUser.create({data:{email:"m14-editor-"+seed+"@example.invalid",
    displayName:"Module 14 Editor",authProvider:"test",authSubject:"editor-"+seed,role:"EDITOR",isActive:true}});
  editorId=editor.id;
  const admin=await db.adminUser.create({data:{email:"m14-admin-"+seed+"@example.invalid",
    displayName:"Module 14 Admin",authProvider:"test",authSubject:"admin-"+seed,role:"ADMIN",isActive:true}});
  administratorId=admin.id;
  const app=express();app.use(express.json());
  app.use("/api/v1/admin",createAdminRouter(async()=>({id:role==="ADMIN"?administratorId:editorId,role})));
  server=app.listen(0);await once(server,"listening");
  base="http://127.0.0.1:"+(server.address() as AddressInfo).port;
});
after(async()=>{
  if(server)await new Promise<void>(resolve=>server.close(()=>resolve()));
  if(postId)await db.post.deleteMany({where:{id:postId}});
  if(projectId)await db.project.deleteMany({where:{id:projectId}});
  if(categoryId)await db.category.deleteMany({where:{id:categoryId}});
  await db.auditEvent.deleteMany({where:{actorId:{in:[editorId,administratorId]}}});
  await db.adminUser.deleteMany({where:{id:{in:[editorId,administratorId]}}});
  await disconnectDatabase();
});
test("editor cannot create category; admin can create audited taxonomy",async()=>{
  assert.equal((await api("categories","POST",{slug:"m14-"+seed,name:"Private taxonomy"})).status,403);
  role="ADMIN";
  const result=await api("categories","POST",{slug:"m14-"+seed,name:"Private taxonomy"});
  assert.equal(result.status,201);
  categoryId=(await result.json() as {item:{id:string}}).item.id;
  role="EDITOR";
});
test("editor creates a draft and cannot publish, audit entry written in same transaction",async()=>{
  const result=await api("posts","POST",{slug:"m14-post-"+seed,title:"Real draft article",
    excerpt:"Reviewed original excerpt",body:"An original content example.",categoryId});
  assert.equal(result.status,201);
  const saved=await result.json() as {item:{id:string;status:string;publishedAt:null}};
  postId=saved.item.id;
  assert.equal(saved.item.status,"DRAFT");
  assert.equal(saved.item.publishedAt,null);
  assert.equal((await api("posts/"+postId+"/publish","POST",{})).status,403);
  assert.equal((await db.auditEvent.count({where:{entityId:postId,action:"CREATE"}})),1);
  assert.equal((await api("posts","POST",{slug:"bad",title:"Bad",categoryId,
    status:"PUBLISHED"})).status,422);
  assert.equal((await api("posts","POST",{slug:"bad",title:"Bad",categoryId,
    body:"<script>alert(1)</script>"})).status,422);
});
test("administrator publishes, editor cannot mutate a published post, then admin unpublishes",async()=>{
  role="ADMIN";
  assert.equal((await api("posts/"+postId+"/publish","POST",{})).status,200);
  const released=await db.post.findUniqueOrThrow({where:{id:postId}});
  assert.equal(released.status,"PUBLISHED");
  assert.ok(released.publishedAt);
  role="EDITOR";
  assert.equal((await api("posts/"+postId,"PATCH",{title:"Unreviewed change"})).status,409);
  role="ADMIN";
  assert.equal((await api("posts/"+postId+"/unpublish","POST",{})).status,200);
  role="EDITOR";
  assert.equal((await api("posts/"+postId,"PATCH",{title:"Improved draft title"})).status,200);
  assert.equal((await db.auditEvent.count({where:{entityId:postId}})),4);
});
test("project requires administrator claims review before publishing, edits reset review",async()=>{
  const result=await api("projects","POST",{slug:"m14-project-"+seed,name:"Draft project",
    description:"Published project description",body:"Case study with permission."});
  assert.equal(result.status,201);
  projectId=(await result.json() as {item:{id:string}}).item.id;
  role="ADMIN";
  assert.equal((await api("projects/"+projectId+"/publish","POST",{})).status,422);
  assert.equal((await api("projects/"+projectId+"/review","POST",{})).status,200);
  role="EDITOR";
  assert.equal((await api("projects/"+projectId,"PATCH",{body:"Revised content"})).status,200);
  assert.equal((await db.project.findUniqueOrThrow({where:{id:projectId}})).claimsReviewedAt,null);
  role="ADMIN";
  assert.equal((await api("projects/"+projectId+"/publish","POST",{})).status,422);
  assert.equal((await api("projects/"+projectId+"/review","POST",{})).status,200);
  assert.equal((await api("projects/"+projectId+"/publish","POST",{})).status,200);
  assert.equal((await api("projects/"+projectId+"/archive","POST",{})).status,200);
  const record=await db.project.findUniqueOrThrow({where:{id:projectId}});
  assert.equal(record.status,"ARCHIVED");
  assert.equal(record.publishedAt,null);
});
test("audit log is visible only to administrator and contains identifiers, not inquiry contents",async()=>{
  role="EDITOR";assert.equal((await api("audit")).status,403);
  role="ADMIN";
  const answer=await api("audit");
  assert.equal(answer.status,200);
  const body=await answer.json() as {items:Array<{action:string;entityType:string;entityId:string}>};
  assert.ok(body.items.some(row=>row.entityId===postId));
  assert.ok(body.items.some(row=>row.entityId===projectId));
  assert.ok(!JSON.stringify(body).includes("contact@example.org"));
});

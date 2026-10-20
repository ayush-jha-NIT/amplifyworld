import { Router } from "express";
import type { Response } from "express";
import { getDatabase } from "../db/client.js";
import type { AdminActor, Authenticator } from "./auth.js";
import { oidcAuthenticate, protect } from "./auth.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Entity = "post" | "project";
type Fields = Record<string, unknown>;
type SafeResult = { code: number; message: string; key: string };
function rejection(code: number, key: string, message: string): SafeResult { return { code, key, message }; }
function bad(res: Response, state: SafeResult) {
  res.status(state.code).json({ error: { code: state.key, message: state.message } });
}
function record(value: unknown): value is Fields {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function textField(input: Fields, name: string, max: number, required = false): string | null | undefined {
  if (!(name in input)) return undefined;
  const val = input[name];
  if (val === null && !required) return null;
  if (typeof val !== "string") throw rejection(422, "INVALID_CONTENT", "Invalid content fields.");
  const trimmed = val.trim();
  if (trimmed.length > max || (required && !trimmed) || /<[a-zA-Z!/]/.test(trimmed)) {
    throw rejection(422, "INVALID_CONTENT", "Invalid content fields. Use plain text or Markdown, not HTML.");
  }
  return trimmed;
}
function keysOnly(data: Fields, permitted: string[]) {
  if (Object.keys(data).some(key => !permitted.includes(key))) {
    throw rejection(422, "INVALID_CONTENT", "Unsupported content fields.");
  }
}
function urlField(obj: Fields, name: string): string | null | undefined {
  const s = textField(obj, name, 2048);
  if (!s) return s;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" || u.username || u.password || u.hash) throw Error();
    return u.href;
  } catch {
    throw rejection(422, "INVALID_URL", "Use a public HTTPS URL.");
  }
}
function strId(value: unknown): string {
  if (typeof value !== "string" || !idPattern.test(value)) throw rejection(400,"INVALID_ID","Invalid content identifier.");
  return value;
}
function validSlug(value: string | null | undefined, max: number) {
  if (!value || value.length > max || !slugPattern.test(value)) {
    throw rejection(422, "INVALID_SLUG", "Use a lowercase hyphenated slug.");
  }
  return value;
}

const postFields = ["slug","title","excerpt","body","categoryId","coverImageUrl","coverImageAlt","seoTitle","seoDescription"];
const projectFields = ["slug","name","description","body","clientName","websiteUrl","seoTitle","seoDescription"];
function parsePost(body: unknown, creation: boolean) {
  if (!record(body)) throw rejection(422,"INVALID_CONTENT","Invalid content fields.");
  keysOnly(body, postFields);
  const parsed = {
    slug: textField(body,"slug",160, true),
    title: textField(body,"title",200,true),
    excerpt: textField(body,"excerpt",500),
    body: textField(body,"body",100_000),
    categoryId: textField(body,"categoryId",36,true),
    coverImageUrl: urlField(body,"coverImageUrl"),
    coverImageAlt: textField(body,"coverImageAlt",300),
    seoTitle: textField(body,"seoTitle",70),
    seoDescription: textField(body,"seoDescription",170)
  };
  if (parsed.slug !== undefined) validSlug(parsed.slug,160);
  if (parsed.categoryId !== undefined) strId(parsed.categoryId);
  if (creation && (!parsed.slug || !parsed.title || !parsed.categoryId)) throw rejection(422,"INVALID_CONTENT","Slug, title and category are required.");
  if (parsed.coverImageUrl && !parsed.coverImageAlt) throw rejection(422,"INVALID_CONTENT","Image alt text is required.");
  return Object.fromEntries(Object.entries(parsed).filter(([,v])=>v!==undefined));
}
function parseProject(body: unknown, creation: boolean) {
  if (!record(body)) throw rejection(422,"INVALID_CONTENT","Invalid content fields.");
  keysOnly(body, projectFields);
  const parsed = {
    slug: textField(body,"slug",160,true),
    name: textField(body,"name",200,true),
    description: textField(body,"description",1000),
    body: textField(body,"body",100_000),
    clientName: textField(body,"clientName",150),
    websiteUrl: urlField(body,"websiteUrl"),
    seoTitle: textField(body,"seoTitle",70),
    seoDescription: textField(body,"seoDescription",170)
  };
  if (parsed.slug!==undefined) validSlug(parsed.slug,160);
  if (creation && (!parsed.slug || !parsed.name)) throw rejection(422,"INVALID_CONTENT","Slug and project name are required.");
  return Object.fromEntries(Object.entries(parsed).filter(([,v])=>v!==undefined));
}
function actor(res: Response): AdminActor { return res.locals.actor as AdminActor; }
function handle(res: Response, failure: unknown) {
  if (record(failure) && typeof failure.code==="number" && typeof failure.key==="string" &&
    typeof failure.message==="string") { bad(res,failure as SafeResult); return; }
  const code=record(failure) ? failure.code : null;
  if (code==="P2002") { bad(res,rejection(409,"SLUG_TAKEN","Slug already exists.")); return; }
  if (code==="P2003") { bad(res,rejection(422,"REFERENCE_NOT_FOUND","Select a valid category.")); return; }
  if (code==="P2034") { bad(res,rejection(409,"CONFLICT","Content changed concurrently. Retry.")); return; }
  bad(res,rejection(503,"ADMIN_UNAVAILABLE","Content operation could not be completed."));
}
async function action(entity: Entity, id: string, kind: "publish"|"unpublish"|"archive"|"review", person: AdminActor) {
  const db=getDatabase();
  return db.$transaction(async tx=>{
    const existing=entity==="post" ? await tx.post.findUnique({where:{id}}) :
      await tx.project.findUnique({where:{id}});
    if (!existing) throw rejection(404,"NOT_FOUND","Content was not found.");
    if (kind==="review" && entity==="post") throw rejection(404,"NOT_FOUND","Operation unavailable.");
    if (kind==="publish") {
      if (existing.status !== "DRAFT") throw rejection(409,"INVALID_STATE","Only drafts can be published.");
      if (entity==="post") {
        const post=existing as Awaited<ReturnType<typeof tx.post.findUnique>>;
        if (!post?.body.trim() || !post.excerpt.trim()) throw rejection(422,"PUBLISH_BLOCKED","An article needs reviewed body and excerpt.");
      } else {
        const project=existing as Awaited<ReturnType<typeof tx.project.findUnique>>;
        if (!project?.description.trim() || !project.body.trim() || !project.claimsReviewedAt) {
          throw rejection(422,"PUBLISH_BLOCKED","A project needs content and documented claim review.");
        }
      }
    }
    if (kind==="review") {
      if (existing.status!=="DRAFT") throw rejection(409,"INVALID_STATE","Only draft projects can be reviewed.");
      await tx.project.update({where:{id},data:{claimsReviewedAt:new Date()}});
    } else if (entity==="post") {
      await tx.post.update({where:{id},data:{
        status:kind==="publish"?"PUBLISHED":kind==="unpublish"?"DRAFT":"ARCHIVED",
        publishedAt:kind==="publish"?new Date():null
      }});
    } else {
      await tx.project.update({where:{id},data:{
        status:kind==="publish"?"PUBLISHED":kind==="unpublish"?"DRAFT":"ARCHIVED",
        publishedAt:kind==="publish"?new Date():null,
        claimsReviewedAt:kind==="unpublish"?null:undefined
      }});
    }
    await tx.auditEvent.create({data:{actorId:person.id,action:kind.toUpperCase(),entityType:entity,entityId:id}});
    return {id,action:kind};
  },{isolationLevel:"Serializable"});
}

export function createAdminRouter(authenticate: Authenticator = oidcAuthenticate) {
  const router=Router();
  router.use(protect(authenticate));
  router.get("/me", (_req,res)=>res.json({actor:actor(res)}));
  router.get("/categories",async(_req,res)=>{
    try {res.json({items:await getDatabase().category.findMany({orderBy:{name:"asc"},select:{id:true,slug:true,name:true}})});}
    catch(e){handle(res,e);}
  });
  router.post("/categories",protect(authenticate,"ADMIN"),async(req,res)=>{
    try {
      if (!record(req.body)) throw rejection(422,"INVALID_CONTENT","Invalid category.");
      keysOnly(req.body,["slug","name"]);
      const slug=validSlug(textField(req.body,"slug",120,true),120);
      const name=textField(req.body,"name",100,true);
      if (!name) throw rejection(422,"INVALID_CONTENT","Category name required.");
      const item=await getDatabase().$transaction(async tx=>{
        const saved=await tx.category.create({data:{slug,name}});
        await tx.auditEvent.create({data:{actorId:actor(res).id,action:"CREATE",entityType:"category",entityId:saved.id}});
        return saved;
      });
      res.status(201).json({item});
    }catch(e){handle(res,e);}
  });
  for(const kind of ["post","project"] as const) {
    const plural=kind==="post"?"posts":"projects";
    router.get("/"+plural,async(req,res)=>{
      try {
        const limit=req.query.limit===undefined?30:Number(req.query.limit);
        if (!Number.isInteger(limit)||limit<1||limit>50) throw rejection(400,"INVALID_QUERY","Invalid limit.");
        const db=getDatabase();
        const items=kind==="post"?
          await db.post.findMany({take:limit,orderBy:{updatedAt:"desc"},select:{
            id:true,slug:true,title:true,excerpt:true,body:true,categoryId:true,
            coverImageUrl:true,coverImageAlt:true,seoTitle:true,seoDescription:true,
            status:true,updatedAt:true,publishedAt:true
          }}):
          await db.project.findMany({take:limit,orderBy:{updatedAt:"desc"},select:{
            id:true,slug:true,name:true,description:true,body:true,clientName:true,websiteUrl:true,
            seoTitle:true,seoDescription:true,status:true,updatedAt:true,
            publishedAt:true,claimsReviewedAt:true
          }});
        res.json({items});
      }catch(e){handle(res,e);}
    });
    router.post("/"+plural,async(req,res)=>{
      try {
        const fields=kind==="post"?parsePost(req.body,true):parseProject(req.body,true);
        const db=getDatabase();
        const item=await db.$transaction(async tx=>{
          const saved=kind==="post"?
            await tx.post.create({data:{...(fields as {slug:string;title:string;categoryId:string}),authorId:actor(res).id}}):
            await tx.project.create({data:{...(fields as {slug:string;name:string}),createdById:actor(res).id}});
          await tx.auditEvent.create({data:{actorId:actor(res).id,action:"CREATE",entityType:kind,entityId:saved.id}});
          return saved;
        },{isolationLevel:"Serializable"});
        res.status(201).json({item});
      }catch(e){handle(res,e);}
    });
    router.patch("/"+plural+"/:id",async(req,res)=>{
      try {
        const id=strId(req.params.id);
        const fields=kind==="post"?parsePost(req.body,false):parseProject(req.body,false);
        if (!Object.keys(fields).length) throw rejection(422,"INVALID_CONTENT","No fields to update.");
        const item=await getDatabase().$transaction(async tx=>{
          const existing=kind==="post"?await tx.post.findUnique({where:{id}}):await tx.project.findUnique({where:{id}});
          if (!existing) throw rejection(404,"NOT_FOUND","Content was not found.");
          if (existing.status!=="DRAFT") throw rejection(409,"INVALID_STATE","Unpublish content before editing.");
          const saved=kind==="post"?
            await tx.post.update({where:{id},data:fields}):
            await tx.project.update({where:{id},data:{...fields,claimsReviewedAt:null}});
          await tx.auditEvent.create({data:{actorId:actor(res).id,action:"UPDATE",entityType:kind,entityId:id}});
          return saved;
        },{isolationLevel:"Serializable"});
        res.json({item});
      }catch(e){handle(res,e);}
    });
    for(const operation of ["publish","unpublish","archive",...(kind==="project"?["review"] as const:[])] as const) {
      router.post("/"+plural+"/:id/"+operation,protect(authenticate,"ADMIN"),async(req,res)=>{
        try {
          if (!record(req.body)||Object.keys(req.body).length!==0) throw rejection(422,"INVALID_CONTENT","This action accepts no content fields.");
          const result=await action(kind,strId(req.params.id),operation,actor(res));
          res.json(result);
        }catch(e){handle(res,e);}
      });
    }
  }
  router.get("/audit",protect(authenticate,"ADMIN"),async(req,res)=>{
    try {
      const limit=req.query.limit===undefined?40:Number(req.query.limit);
      if (!Number.isInteger(limit)||limit<1||limit>50) throw rejection(400,"INVALID_QUERY","Invalid limit.");
      const items=await getDatabase().auditEvent.findMany({take:limit,orderBy:{createdAt:"desc"},select:{
        id:true,actorId:true,action:true,entityType:true,entityId:true,createdAt:true
      }});
      res.json({items});
    }catch(e){handle(res,e);}
  });
  return router;
}

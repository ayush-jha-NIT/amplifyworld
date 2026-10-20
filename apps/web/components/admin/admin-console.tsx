"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Actor = { id: string; role: "ADMIN" | "EDITOR" };
type ContentKind = "posts" | "projects";
type Category = { id: string; name: string; slug: string };
type Content = Record<string, string | null | undefined> & { id: string; slug: string; status: string };
type Editor = Record<string, string>;

const apiOrigin = process.env.NEXT_PUBLIC_API_URL;
const clientId = process.env.NEXT_PUBLIC_ADMIN_OIDC_CLIENT_ID;
const authorizeUrl = process.env.NEXT_PUBLIC_ADMIN_OIDC_AUTH_URL;
const tokenUrl = process.env.NEXT_PUBLIC_ADMIN_OIDC_TOKEN_URL;
const identityReady = !!(apiOrigin && clientId && authorizeUrl && tokenUrl);
const postFields = ["slug", "title", "excerpt", "body", "categoryId", "coverImageUrl", "coverImageAlt", "seoTitle", "seoDescription"];
const projectFields = ["slug", "name", "description", "body", "clientName", "websiteUrl", "seoTitle", "seoDescription"];

function isSafeEndpoint(url: string) {
  try {const parsed=new URL(url);return parsed.protocol==="https:" &&
    !parsed.username && !parsed.password && !parsed.hash;} catch{return false;}
}
function encode(raw: ArrayBuffer | Uint8Array) {
  const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  return btoa(Array.from(bytes, n=>String.fromCharCode(n)).join("")).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function beginLogin() {
  if (!clientId || !authorizeUrl || !tokenUrl || !apiOrigin ||
    !isSafeEndpoint(authorizeUrl) || !isSafeEndpoint(tokenUrl) || !isSafeEndpoint(apiOrigin)) {
    throw new Error("Administrator identity provider is not configured.");
  }
  const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = encode(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier)));
  const state = encode(crypto.getRandomValues(new Uint8Array(18)));
  sessionStorage.setItem("amplifyworld-admin-pkce",JSON.stringify({verifier,state,at:Date.now()}));
  const url = new URL(authorizeUrl);
  url.searchParams.set("response_type","code");
  url.searchParams.set("client_id",clientId);
  url.searchParams.set("redirect_uri",location.origin+"/admin");
  url.searchParams.set("scope","openid profile email");
  url.searchParams.set("code_challenge",challenge);
  url.searchParams.set("code_challenge_method","S256");
  url.searchParams.set("state",state);
  location.assign(url.href);
}
async function finishLogin(): Promise<string | null> {
  const params=new URLSearchParams(location.search);
  const code=params.get("code"), state=params.get("state");
  const error=params.get("error");
  if (!code && !error) return null;
  const stored=sessionStorage.getItem("amplifyworld-admin-pkce");
  sessionStorage.removeItem("amplifyworld-admin-pkce");
  history.replaceState(history.state,"",location.origin+"/admin");
  if (error || !code || !state || !stored || !clientId || !tokenUrl || !isSafeEndpoint(tokenUrl)) {
    throw new Error("Sign-in was cancelled or the authorization request expired.");
  }
  const record: unknown=JSON.parse(stored);
  if (!record || typeof record!=="object") throw new Error("Invalid authorization state.");
  const {verifier, state:expected, at}=record as {verifier?:unknown;state?:unknown;at?:unknown};
  if (state!==expected || typeof verifier!=="string" || typeof at!=="number" ||
    Date.now()-at>10*60_000 || at>Date.now()+10_000) {
    throw new Error("Sign-in state did not match or expired.");
  }
  const form=new URLSearchParams({grant_type:"authorization_code",client_id:clientId,code,
    code_verifier:verifier,redirect_uri:location.origin+"/admin"});
  const response=await fetch(tokenUrl,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:form.toString(),cache:"no-store"});
  if (!response.ok) throw new Error("Identity provider did not complete sign-in.");
  const data: unknown=await response.json();
  const token=data && typeof data==="object" && "access_token" in data ? data.access_token : null;
  if (typeof token!=="string" || token.length>12000 || token.split(".").length!==3)
    throw new Error("Identity provider did not return a usable access token.");
  // Deliberately keep tokens in memory only, never localStorage, cookies or URLs.
  return token;
}
export function AdminConsole() {
  const callbackStarted=useRef(false);
  const [token,setToken]=useState("");
  const [actor,setActor]=useState<Actor|null>(null);
  const [kind,setKind]=useState<ContentKind>("posts");
  const [items,setItems]=useState<Content[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [editor,setEditor]=useState<Editor>({});
  const [editing,setEditing]=useState<string|null>(null);
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [newCategory,setNewCategory]=useState({name:"",slug:""});
  const [audit,setAudit]=useState<Array<{id:string;action:string;entityType:string;entityId:string;createdAt:string}>>([]);

  const request=useCallback(async (access: string, path:string, init:RequestInit={})=>{
    if (!apiOrigin || !isSafeEndpoint(apiOrigin)) throw new Error("A valid HTTPS API URL is required.");
    const response=await fetch(new URL("/api/v1/admin/"+path,apiOrigin),{
      ...init,headers:{"Authorization":"Bearer "+access,"Content-Type":"application/json",...(init.headers||{})},
      cache:"no-store",credentials:"omit"
    });
    const json:unknown=await response.json().catch(()=>null);
    if (!response.ok) {
      const data=json && typeof json==="object" && "error" in json?json.error:null;
      const message=data && typeof data==="object" && "message" in data?data.message:null;
      throw new Error(typeof message==="string"?message:"The administrator API is unavailable.");
    }
    return json as Record<string,unknown>;
  },[]);

  const refresh=useCallback(async (access:string, currentKind:ContentKind)=>{
    const [records,taxonomy]=await Promise.all([request(access,currentKind),request(access,"categories")]);
    setItems(Array.isArray(records.items)?records.items as Content[]:[]);
    setCategories(Array.isArray(taxonomy.items)?taxonomy.items as Category[]:[]);
  },[request]);

  useEffect(()=>{
    if (callbackStarted.current) return;
    callbackStarted.current=true;
    void finishLogin().then(async access=>{
      if (!access) return;
      const data=await request(access,"me");
      const identity=data.actor as Actor;
      if (!identity || !["ADMIN","EDITOR"].includes(identity.role)) throw new Error("No active administrator role.");
      setToken(access);setActor(identity);
      await refresh(access,"posts");
    }).catch(err=>setNotice(err instanceof Error?err.message:"Sign-in could not be completed."));
  },[refresh,request]);

  const switchKind=(next:ContentKind)=>{
    setKind(next);setEditing(null);setEditor({});setNotice("");
    if (token) void refresh(token,next).catch(()=>setNotice("Content could not be loaded."));
  };
  const modify=async (path:string,method:"POST"|"PATCH",body:unknown)=>{
    if (!token || busy) return;
    setBusy(true);setNotice("");
    try {
      await request(token,path,{method,body:JSON.stringify(body)});
      await refresh(token,kind);
      setNotice("The change was saved and audited.");
      setEditor({});setEditing(null);
    }catch(e){setNotice(e instanceof Error?e.message:"The change was not saved.");}
    finally {setBusy(false);}
  };
  const submit=()=>{
    const allow=kind==="posts"?postFields:projectFields;
    const fields=Object.fromEntries(allow.filter(field=>editor[field]!==undefined).map(field=>[field,editor[field]]));
    if (!fields.slug && !editing) {setNotice("A slug is required.");return;}
    void modify(editing?kind+"/"+editing:kind,editing?"PATCH":"POST",fields);
  };
  const runAction=async (id:string,action:string)=>{
    if (actor?.role!=="ADMIN" || busy) return;
    if (!confirm("Confirm "+action+"? This operation is recorded in the audit log.")) return;
    await modify(kind+"/"+id+"/"+action,"POST",{});
  };
  const createCategory=()=>{
    if (!newCategory.name.trim() || !newCategory.slug.trim()) {setNotice("Category name and slug are required.");return;}
    void modify("categories","POST",newCategory);
    setNewCategory({name:"",slug:""});
  };
  const showAudit=async()=>{
    if (!token || actor?.role!=="ADMIN") return;
    try {const d=await request(token,"audit?limit=30");setAudit(Array.isArray(d.items)?d.items as typeof audit:[]);}
    catch {setNotice("Audit history is temporarily unavailable.");}
  };

  if (!identityReady) return <section className="admin-setup"><h1>Content administration</h1>
    <p>The administrator console is disabled until a verified OIDC identity provider and HTTPS API are configured.</p>
    <p>No default account or password is provided.</p></section>;

  return <section className="admin-shell">
    <header className="admin-top">
      <div><p className="eyebrow">AmplifyWorld / Private workspace</p><h1>Content administration</h1></div>
      {actor?<div className="admin-user"><span>{actor.role}</span><button onClick={()=>{
        setToken("");setActor(null);setItems([]);setEditor({});setAudit([]);setNotice("Signed out. Tokens are not persisted.");
      }}>Sign out</button></div>:null}
    </header>
    {!actor?<div className="admin-signin">
      <p>Sign in using the approved identity provider. Access is restricted to active, provisioned editor and administrator identities.</p>
      <button onClick={()=>{void beginLogin().catch(e=>setNotice(e instanceof Error?e.message:"Sign-in is not available."));}}>
        Sign in securely
      </button>
    </div>:<>
      <nav className="admin-tabs" aria-label="Content type">
        <button aria-pressed={kind==="posts"} onClick={()=>switchKind("posts")}>Blog articles</button>
        <button aria-pressed={kind==="projects"} onClick={()=>switchKind("projects")}>Portfolio projects</button>
        {actor.role==="ADMIN"?<button onClick={()=>{void showAudit();}}>Recent audit events</button>:null}
      </nav>
      <div className="admin-grid">
        <div className="admin-panel">
          <h2>{editing?"Edit draft":"New draft"}</h2>
          <p>Plain text or Markdown only. Never add unverified claims or personal data.</p>
          {(kind==="posts"?postFields:projectFields).map(field=><label className="admin-field" key={field}>
            <span>{field}</span>
            {field==="categoryId"?<select value={editor[field]??""} onChange={e=>setEditor(p=>({...p,[field]:e.target.value}))}>
              <option value="">Choose a category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>:field==="body"||field==="description"||field==="excerpt"?
              <textarea rows={field==="body"?9:3} value={editor[field]??""} onChange={e=>setEditor(p=>({...p,[field]:e.target.value}))}/>:
              <input type="text" value={editor[field]??""} onChange={e=>setEditor(p=>({...p,[field]:e.target.value}))}/>}
          </label>)}
          <div className="admin-actions"><button disabled={busy} onClick={submit}>{busy?"Saving…":editing?"Save draft":"Create draft"}</button>
          {editing?<button disabled={busy} onClick={()=>{setEditing(null);setEditor({});}}>Cancel edit</button>:null}</div>
        </div>
        <div className="admin-panel">
          <h2>{kind==="posts"?"Article drafts and releases":"Portfolio drafts and releases"}</h2>
          <div className="admin-records">{items.map(item=><article key={item.id} className="admin-record">
            <div><strong>{item.title||item.name||item.slug}</strong><p>{item.slug}</p>
              <small>{item.status} · {new Date(item.updatedAt??0).toLocaleDateString()}</small></div>
            <div className="admin-actions">
              {item.status==="DRAFT"?<button disabled={busy} onClick={()=>{
                const fields=kind==="posts"?postFields:projectFields;
                setEditor(Object.fromEntries(fields.map(f=>[f,item[f]??""])));setEditing(item.id);
              }}>Edit</button>:null}
              {actor.role==="ADMIN"?<>
                {kind==="projects"&&item.status==="DRAFT"&&!item.claimsReviewedAt?
                  <button disabled={busy} onClick={()=>void runAction(item.id,"review")}>Review claims</button>:null}
                {item.status==="DRAFT"?<button disabled={busy} onClick={()=>void runAction(item.id,"publish")}>Publish</button>:null}
                {item.status==="PUBLISHED"?<button disabled={busy} onClick={()=>void runAction(item.id,"unpublish")}>Unpublish</button>:null}
                {item.status!=="ARCHIVED"?<button disabled={busy} onClick={()=>void runAction(item.id,"archive")}>Archive</button>:null}
              </>:null}
            </div>
          </article>)}</div>
          {items.length===0?<p>No content records are available.</p>:null}
          {actor.role==="ADMIN"?<div className="admin-category">
            <h3>Create category</h3>
            <label>Slug<input value={newCategory.slug} onChange={e=>setNewCategory(p=>({...p,slug:e.target.value}))}/></label>
            <label>Name<input value={newCategory.name} onChange={e=>setNewCategory(p=>({...p,name:e.target.value}))}/></label>
            <button disabled={busy} onClick={createCategory}>Add category</button>
          </div>:null}
        </div>
      </div>
      {actor.role==="ADMIN" && audit.length>0?<section className="admin-panel"><h2>Recent audit activity</h2>
        <ul>{audit.map(event=><li key={event.id}>{event.action} · {event.entityType} · {event.entityId} · {new Date(event.createdAt).toLocaleString()}</li>)}</ul>
      </section>:null}
    </>}
    <p className="admin-status" role="status" aria-live="polite">{notice}</p>
  </section>;
}

const V='hermes-v3';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(CORE.map(u=>fetch(u,{cache:'reload'}).then(r=>{if(r.ok)return c.put(u,r)})));
    await Promise.all(CDN.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k!==V) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  const ok=u.origin===location.origin||u.hostname==='cdnjs.cloudflare.com'||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!ok) return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(r.mode==='navigate'){
      try{const res=await fetch(r,{cache:'no-cache'});if(res&&res.ok){c.put('index.html',res.clone());return res}}catch(_){}
      const idx=await c.match('index.html');if(idx)return idx;
    }
    const hit=await c.match(r,{ignoreSearch:r.mode==='navigate'});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;
    if(res)return res;
    if(r.mode==='navigate'){const idx=await c.match('index.html');if(idx)return idx}
    return Response.error();
  })());
});

const CACHE='contractor-finder-shell-v2.2.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./marks.css','./marks.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function decorate(response){
  if(!response)return response;
  const text=await response.text();
  let html=text;
  if(!html.includes('marks.css'))html=html.replace('</head>','<link rel="stylesheet" href="./marks.css?v=2.2.0"></head>');
  if(!html.includes('marks.js'))html=html.replace('</body>','<script src="./marks.js?v=2.2.0"></script></body>');
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('outscraper.'))return;
  if(e.request.method!=='GET')return;
  const isAppPage=u.origin===location.origin&&(u.pathname.endsWith('/contractors/')||u.pathname.endsWith('/contractors/index.html'));
  if(isAppPage){e.respondWith((async()=>{try{const r=await fetch(e.request,{cache:'no-store'});const c=r.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',c));return decorate(r)}catch{const hit=await caches.match('./index.html')||await caches.match('./');return decorate(hit)}})());return;}
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
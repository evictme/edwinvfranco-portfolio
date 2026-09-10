const CACHE='contractor-finder-shell-v4.0.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./site-profile.css','./site-profile.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
async function decorate(response){
  if(!response)return response;
  const text=await response.text();
  let html=text;
  if(!html.includes('site-profile.css'))html=html.replace('</head>','<link rel="stylesheet" href="./site-profile.css?v=4.0.0"></head>');
  if(!html.includes('site-profile.js'))html=html.replace('</body>','<script src="./site-profile.js?v=4.0.0"></script></body>');
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.hostname.includes('outscraper.'))return;
  const isAppPage=url.origin===location.origin&&(url.pathname.endsWith('/contractors/')||url.pathname.endsWith('/contractors/index.html'));
  if(isAppPage){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-store'});
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
        return decorate(response);
      }catch{
        const cached=await caches.match('./index.html')||await caches.match('./');
        return decorate(cached);
      }
    })());
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(request,copy));
    return response;
  })));
});

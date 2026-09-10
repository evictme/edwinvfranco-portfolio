const CACHE='contractor-finder-shell-v3.0.0';
const ASSETS=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
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
        return response;
      }catch{
        return await caches.match('./index.html')||await caches.match('./');
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

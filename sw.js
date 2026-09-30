'use strict';
const CACHE='recompapp-v157';
const APP_SHELL=[
  './','./index.html?v=157','./index.html','./shared.css?v=2','./app.css?v=157',
  './shared.js?v=157','./data.js?v=157','./foods.js?v=120','./app.js?v=157',
  './manifest.webmanifest?v=157','./gym-icon-192.png?v=157','./gym-icon-512.png?v=157',
  './favicon-32.png?v=157','./apple-touch-icon-gym.png?v=157'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./index.html?v=157'))));
    return;
  }
  event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
});

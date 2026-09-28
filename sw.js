'use strict';
const CACHE='recompapp-v148';
const APP_SHELL=[
  './','./index.html?v=148','./index.html','./shared.css?v=2','./app.css?v=148',
  './shared.js?v=148','./data.js?v=148','./foods.js?v=120','./app.js?v=148',
  './manifest.webmanifest?v=148','./gym-icon-192.png?v=148','./gym-icon-512.png?v=148',
  './favicon-32.png?v=148','./apple-touch-icon-gym.png?v=148'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./index.html?v=148'))));
    return;
  }
  event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'./index.html?v=148';
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
    for(const client of clients){if('focus' in client){client.navigate?.(target);return client.focus()}}
    return self.clients.openWindow?self.clients.openWindow(target):null;
  }));
});
self.addEventListener('push',event=>{
  let data={};try{data=event.data?.json?.()||{}}catch(e){data={body:event.data?.text?.()||''}}
  const title=data.title||'RecompApp';
  event.waitUntil(self.registration.showNotification(title,{body:data.body||'Aggiornamento allenamento',icon:'gym-icon-192.png',badge:'favicon-32.png',data:{url:data.url||'./index.html?v=148'}}));
});

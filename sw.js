'use strict';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'./index.html?v=144';
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
    for(const client of clients){if('focus' in client){client.navigate?.(target);return client.focus()}}
    return self.clients.openWindow?self.clients.openWindow(target):null;
  }));
});
self.addEventListener('push',event=>{
  let data={};try{data=event.data?.json?.()||{}}catch(e){data={body:event.data?.text?.()||''}}
  const title=data.title||'RecompApp';
  event.waitUntil(self.registration.showNotification(title,{body:data.body||'Aggiornamento allenamento',icon:'gym-icon-192.png',badge:'favicon-32.png',data:{url:data.url||'./index.html?v=144'}}));
});

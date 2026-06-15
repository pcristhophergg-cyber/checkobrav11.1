self.addEventListener('install', e=>self.skipWaiting());
self.addEventListener('activate', e=>self.clients.claim());
self.addEventListener('push', event=>{
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CheckObra';
  const options = {body:data.body||'Nueva alerta de obra', icon:'assets/icon-192.png', badge:'assets/icon-192.png', vibrate:[250,100,250], requireInteraction:true};
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event=>{event.notification.close(); event.waitUntil(clients.openWindow('./index.html'));});

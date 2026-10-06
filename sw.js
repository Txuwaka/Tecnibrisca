const CACHE='tecnibrisca-cache-beta1-v1';
const FILES=['./','./index.html','./style.css','./rules.js','./brisca.js','./manifest.json','./favicon.png','./apple-touch-icon.png','./icono-maskable-512.png','./icono-192.png','./icono-512.png','./assets/logo.png','./assets/oros.png','./assets/copas.png','./assets/espadas.png','./assets/bastos.png','./assets/sota.png','./assets/caballo.png','./assets/rey.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tecnibrisca-cache-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));});

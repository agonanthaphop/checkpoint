/* Service worker: เก็บตัวแอปไว้ใช้ตอนไม่มีเน็ต (ไม่แตะคำขอไป Apps Script) */
var V = 'cp-v14-2';
var SHELL = ['./', 'index.html', 'dashboard.html', 'html5-qrcode.min.js',
  'manifest.json', 'manifest-dash.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* ออนไลน์: ดึงของใหม่เสมอแล้วเก็บไว้ / ออฟไลน์: ใช้ของที่เก็บไว้ */
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
      return res;
    }).catch(function () {
      return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});

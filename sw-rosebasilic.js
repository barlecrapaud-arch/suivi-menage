// Service worker — cache « app shell » + librairies CDN pour le mode hors ligne (Rose et Basilic)
const CACHE = "rose-et-basilic-v1";

const A_PRECACHER = [
  "rose-et-basilic.html",
  "manifest-rosebasilic.json",
  "icon-rosebasilic.svg",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js",
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(A_PRECACHER.map((url) => c.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((rep) => {
      if (rep && rep.status === 200) {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
      }
      return rep;
    }).catch(() => caches.match(e.request))
  );
});

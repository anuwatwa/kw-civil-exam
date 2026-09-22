/* offline cache for the exam bank */
const V = 'kw-civil-v2';
const CORE = ["./", "./index.html", "./questions.json", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const FIGS = ["./figs/CM.json", "./figs/COM.json", "./figs/DRAW.json", "./figs/MAT.json", "./figs/RC.json", "./figs/SOIL.json", "./figs/STAT.json", "./figs/STRU.json", "./figs/THEO.json", "./figs/TIMB.json"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok && new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(V).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});

/* "download everything for offline" from the app */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'PRECACHE_FIGS') {
    e.waitUntil(
      caches.open(V).then(c => c.addAll(FIGS))
        .then(() => e.source && e.source.postMessage({type: 'PRECACHE_DONE'}))
        .catch(err => e.source && e.source.postMessage({type: 'PRECACHE_FAIL', msg: String(err)}))
    );
  }
});

// 수아와 한글 크리스탈 — service worker
  // index.html 은 '네트워크 먼저'(새 버전 자동 반영, 오프라인이면 캐시), 아이콘 등은 '캐시 먼저'
  const CACHE = 'sua-hangul-crystal-hangul-v3';
  const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png', './icon-maskable-512.png'];
  self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => c.add(new Request(u, {cache:'reload'})).catch(() => null)))).then(() => self.skipWaiting()));
  });
  self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
  });
  self.addEventListener('fetch', e => {
    const req = e.request; if (req.method !== 'GET') return;
    const url = new URL(req.url); if (url.origin !== location.origin) return;
    const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
    if (isPage) {
      e.respondWith(fetch(req).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return resp; })
        .catch(() => caches.match('./index.html')));
    } else {
      e.respondWith(caches.match(req, {ignoreSearch:true}).then(r => r || fetch(req).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return resp; })));
    }
  });
  
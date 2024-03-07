const app = {
  name: "pure-pwa",
  version: "0.1.9",
  files: [
    "/about/index.html",
    "/action/domain/tmdb.js",
    "/action/index.html",
    "/action/movies-api.js",
    "/assets/css/app.css",
    "/assets/css/app.css.map",
    "/assets/img/cards/action.webp",
    "/assets/img/cards/beauty.webp",
    "/assets/img/cards/entry.webp",
    "/assets/img/cards/flow.webp",
    "/assets/img/cards/power.webp",
    "/assets/img/cards/purity.webp",
    "/assets/img/icons.svg",
    "/assets/img/marcvanneerven.webp",
    "/assets/img/og.webp",
    "/assets/img/pure-pwa-512.png",
    "/assets/img/video-cover.svg",
    "/assets/js/services/app-files.json",
    "/assets/js/services/app-version.json",
    "/assets/js/shared/accordion-details/accordion-details.js",
    "/assets/js/shared/app-menu/app-menu.js",
    "/assets/js/shared/dropdown-list/dropdown-list.js",
    "/assets/js/shared/list-view/list-view.js",
    "/assets/js/shared/localize-section/localize-section.js",
    "/assets/js/shared/md-lite/md-lite.js",
    "/assets/js/shared/message-toaster/message-toaster.js",
    "/assets/js/shared/range-switch/range-switch.js",
    "/assets/js/shared/svg-icon/svg-icon.js",
    "/assets/js/shared/x-form/x-form.js",
    "/assets/js/app-settings.js",
    "/assets/js/app.js",
    "/assets/js/common.js",
    "/assets/js/demo-settings.js",
    "/assets/locale/nl/about.html",
    "/assets/locale/nl/purity.html",
    "/beauty/image-carousel.js",
    "/beauty/index.html",
    "/entry/index.html",
    "/flow/index.html",
    "/flow/mock-todo-api.js",
    "/flow/todo-app.js",
    "/home/index.html",
    "/home/mpa-route-cards.js",
    "/power/index.html",
    "/power/web-rtc.js",
    "/purity/index.html",
    "/settings/index.html",
    "/settings/settings-form.js",
    "/favicon.ico",
    "/index.html",
    "/manifest.webmanifest",
    "/robots.txt",
    "/service-worker.js"
  ]
};

const CACHE_NAME = `app_${app.name}v${app.version}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(app.files);
    })
  );
  console.log(CACHE_NAME, "cached");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

/**
 * Accept messags from UI
 */
self.addEventListener("message", function (event) {
  switch (event.data.action) {
    case "skipWaiting": // "Update App clicked"
      self.skipWaiting();
      break;
  }
});

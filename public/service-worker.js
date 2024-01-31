const urls = [
    "/assets/js/services/app-files.json",
    "/assets/js/services/app-version.json"
  ],
  fetchFiles = urls.map((url) => fetch(url));

Promise.all(fetchFiles).then((responses) =>
  Promise.all(
    responses.map((response) => {
      return response.json().then((data) => {
        return data;
      });
    })
  )
    .then((fetchedData) => {
      initServiceWorker(fetchedData[1], fetchedData[0]);
    })
    .catch((error) => console.error("Failed to fetch files", error))
);

function initServiceWorker(app, appFileList) {
  // Change ./app-version.json to force PWA update
  const CACHE_NAME = `app_${app.name}v${app.version}`;
  console.log("Cache name: ", CACHE_NAME);

  // Listener for the install event - pre-caches our assets list on service worker install.
  self.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(appFileList);

        self.postMessage({ action: "installed", version: app.version });
      })()
    );
  });

  //  have our service worker take control of instances of our app that are already running
  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });

  let deferredPrompt;
  self.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request));
  });

  self.addEventListener("message", function (event) {
    if (event.data.action === "skipWaiting") {
      self.skipWaiting();
    }
  });
}

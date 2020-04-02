const files2store = ["/", "index.js", "db.js", "style.css", "manifest.json"];
const FILESTORE = "my-static-cache-v1";
const DATASTORE = "my-data-cache-v1";

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(FILESTORE).then(function(cache) {
      console.log("opened static cache!");
      return cache.addAll(files2store);
    })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("api")) {
    event.respondWith(
      caches.open(DATASTORE).then(function(cache) {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else {
          return caches.match("/");
        }
      });
    })
  );
});

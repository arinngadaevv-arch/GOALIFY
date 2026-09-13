// GOALIFY's push service worker — the one piece of this feature that has
// to be a plain static file (not part of the Next.js bundle) since the
// Push API requires a service worker registered at a URL that controls
// the scope you want push events for; the root ("/") gives it the whole
// app. Deliberately minimal: no offline caching, no asset interception —
// this exists only to receive push events while no tab is open and turn
// them into an OS notification, plus route a click on that notification
// back into the app.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // A push payload that isn't JSON — fall back to a generic notification
    // rather than letting the whole handler throw and silently drop it.
  }

  const title = data.title || "GOALIFY";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/home" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Focuses an already-open GOALIFY tab if one exists (rather than piling up
// duplicate tabs every time a notification is tapped); opens a new one
// otherwise.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});

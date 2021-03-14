// Closure to protect all variables
(_ => {
  const whitelistUrls = ["http://localhost:3000"];
  const tokenUrls = ["/login", "/api/refresh"];
  let lastSavedToken = null;

  self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
    console.log("Service worker installed!");
  });

  self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
    console.log("Service worker ready!");
  });

  // Clear token on postMessage
  self.addEventListener("message", _ => {
    lastSavedToken = "";
  });

  // Intercept all fetch requests
  self.addEventListener("fetch", event => {
    destURL = new URL(event.request.url);
    // From all whitelisted requests only !!
    if (isWhitelistedUrl(destURL)) {
      const headers = new Headers(event.request.headers);
      if (lastSavedToken && shouldAppendTokenTo(destURL)) {
        headers.append("Authorization", `Basic ${lastSavedToken}`);
      }
      const authReq = new Request(event.request, { headers });
      event.respondWith(hackResponse(authReq, destURL));
    }
  });

  const hackResponse = async (authReq, url) => {
    const response = await fetch(authReq);
    const changeResponse = response.ok && tokenUrls.includes(url.pathname);
    if (!changeResponse) {
      return response;
    }
    // catch response and set token
    const data = await response.json();
    const { token, ...body } = data;
    lastSavedToken = token;
    // Retrieve token and send the response without it
    return new Response(JSON.stringify(body), {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  };

  const isWhitelistedUrl = url => whitelistUrls.includes(url.origin);

  const shouldAppendTokenTo = url => {
    return url.pathname.startsWith("/api");
  };
})();

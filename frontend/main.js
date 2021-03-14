const BACKEND_URL = "http://localhost:3000";
const REFRESH_TIME_MS = 4 * 60 * 1000; // refresh token each 4 minutes

// Closure until document is ready
$(document).ready(_ => {
  const login = $("#login");
  const logout = $("#logout");
  const users = $("#users");
  const textarea = $("#textarea");

  // protected copy of fetch
  const fetch = window.fetch;

  let intervalId = 0;

  const append = data => {
    textarea.append(`${new Date()} --> ${data} \n`);
    textarea.scrollTop(textarea[0].scrollHeight);
  };

  const inactiveButtons = _ => {
    [login, logout, users].forEach(btn => btn.prop("disabled", true));
  };

  const toggleButtons = disableLogin => {
    login.prop("disabled", disableLogin);
    [logout, users].forEach(btn => btn.prop("disabled", !disableLogin));
  };

  const clearAll = data => {
    clearInterval(intervalId);
    // Ask to clear token only
    navigator.serviceWorker.controller.postMessage("");
    toggleButtons(false);
    append(data);
  };

  const handleError = resp => {
    if (resp.ok) {
      return resp.json();
    }
    return resp.json().then(err => {
      throw Error(`${resp.status} ${err.message || err}`);
    });
  };

  login.click(_ => {
    clearInterval(intervalId);
    inactiveButtons();

    fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "elie29", password: "123456" }),
    })
      .then(handleError)
      .then(next => {
        toggleButtons(true);
        append(`${next.username} has just logged in`);
        intervalId = setInterval(refreshToken, REFRESH_TIME_MS);
      })
      .catch(message => clearAll(`${message} on login`));
  });

  logout.click(_ => clearAll("User logged out"));

  const refreshToken = _ => {
    inactiveButtons();

    fetch(`${BACKEND_URL}/api/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "elie29" }),
    })
      .then(handleError)
      .then(next => {
        append(`${next.username}, token refreshed`);
        toggleButtons(true);
      })
      .catch(message => clearAll(`${message} on refresh`));
  };

  users.click(_ => {
    inactiveButtons();

    fetch(`${BACKEND_URL}/api/users`)
      .then(handleError)
      .then(next => {
        append(JSON.stringify(next));
        toggleButtons(true);
      })
      .catch(message => clearAll(`${message} on users call`));
  });

  // Register service worker and check if the token is ready
  navigator.serviceWorker
    .register("/service-worker.js", {
      scope: "/",
    })
    .then(_ => navigator.serviceWorker.ready)
    .then(_ => append("ServiceWorker registration successful!"))
    .then(_ => refreshToken())
    .then(_ => (intervalId = setInterval(refreshToken, REFRESH_TIME_MS)))
    .catch(err => append(`ServiceWorker registration failed: ${err}`));
});

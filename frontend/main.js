const BACKEND_URL = "http://localhost:3000";
const REFRESH_TIME = 4 * 60 * 1000; // refresh token each 4 minutes

// Closure until document is ready
$(document).ready(_ => {
  const login = $("#login");
  const logout = $("#logout");
  const users = $("#users");
  const textarea = $("#textarea");

  let token = null;
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
    token = null;
    clearInterval(intervalId);
    toggleButtons(false);
    append(data);
  };

  toggleButtons(false);

  login.click(_ => {
    token = null;
    clearInterval(intervalId);
    inactiveButtons();

    $.ajax({
      method: "POST",
      url: `${BACKEND_URL}/login`,
      contentType: "application/json",
      data: JSON.stringify({ username: "elie29", password: "123456" }),
    })
      .done(next => {
        token = next.token;
        toggleButtons(true);
        append(`${next.username} has just logged in`);
        intervalId = setInterval(refreshToken, REFRESH_TIME);
      })
      .fail(err => clearAll(`${err.statusText}, ${err.responseJSON}`));
  });

  logout.click(_ => clearAll("User logged out"));

  // refresh needs a valid token
  const refreshToken = _ => {
    if (!token) {
      return;
    }

    inactiveButtons();

    $.ajax({
      method: "POST",
      url: `${BACKEND_URL}/refresh`,
      contentType: "application/json",
      headers: {
        Authorization: `Basic ${token}`,
      },
      data: JSON.stringify({ username: "elie29" }),
    })
      .done(next => {
        token = next.token;
        append(`${next.username}, token refreshed`);
        toggleButtons(true);
      })
      .fail(err =>
        clearAll(`${err.statusText}, ${err.responseJSON} on refresh`)
      );
  };

  users.click(_ => {
    inactiveButtons();

    $.ajax({
      method: "GET",
      url: `${BACKEND_URL}/api/users`,
      headers: {
        Authorization: `Basic ${token}`,
      },
    })
      .done(next => {
        append(JSON.stringify(next));
        toggleButtons(true);
      })
      .fail(err =>
        clearAll(`${err.statusText}, ${err.responseJSON} on users call`)
      );
  });
});

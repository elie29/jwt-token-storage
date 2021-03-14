const BACKEND_URL = "http://localhost:3000";
const REFRESH_TIME = 4 * 60 * 1000; // refresh token each 4 minutes

// Closure until document is ready
$(document).ready(_ => {
  const login = $("#login");
  const logout = $("#logout");
  const users = $("#users");
  const textarea = $("#textarea");

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
    toggleButtons(false);
    append(data);
  };

  toggleButtons(false);

  login.click(_ => {
    clearInterval(intervalId);
    inactiveButtons();

    $.ajax({
      method: "POST",
      url: `${BACKEND_URL}/login`,
      contentType: "application/json",
      xhrFields: { withCredentials: true }, // required to set the cookie
      data: JSON.stringify({ username: "elie29", password: "123456" }),
    })
      .done(next => {
        toggleButtons(true);
        append(`${next.username} has just logged in`);
        intervalId = setInterval(refreshToken, REFRESH_TIME);
      })
      .fail(err => clearAll(`${err.statusText}, ${err.responseJSON}`));
  });

  logout.click(_ => clearAll("User logged out"));

  // refresh needs a valid token
  const refreshToken = _ => {
    inactiveButtons();

    $.ajax({
      method: "POST",
      url: `${BACKEND_URL}/refresh`,
      contentType: "application/json",
      xhrFields: { withCredentials: true }, // required to send and set the cookie
      data: JSON.stringify({ username: "elie29" }),
    })
      .done(next => {
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
      xhrFields: { withCredentials: true }, // required to send the cookie
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

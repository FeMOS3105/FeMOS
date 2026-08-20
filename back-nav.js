(function() {
  history.pushState(null, "", location.href);
  window.addEventListener("popstate", function() {
    window.location.href = "login.html";
  });
})();

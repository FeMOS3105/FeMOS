/* FeMOS Theme Loader — include in <head> to prevent flash */
(function () {
  var saved = localStorage.getItem("femos-theme") || "light";
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  window.feMosToggleTheme = function () {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("femos-theme", next);
    updateThemeIcons();
  };

  window.feMosApplyTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("femos-theme", theme);
    updateThemeIcons();
  };

  function updateThemeIcons() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".themeToggle").forEach(function (btn) {
      var sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="' + (isDark ? "#fbbf24" : "#5c6b9a") + '" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      var moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="' + (isDark ? "#fbbf24" : "#5c6b9a") + '" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      btn.innerHTML = isDark ? sunIcon : moonIcon;
      btn.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    });
  }

  /* Run on DOM ready for initial icons */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateThemeIcons);
  } else {
    updateThemeIcons();
  }
})();

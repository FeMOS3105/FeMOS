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
    updateDzToggle();
  };

  window.feMosApplyTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("femos-theme", theme);
    updateDzToggle();
  };

  function updateDzToggle() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    var toggle = document.getElementById("dzThemeToggle");
    var knob = document.getElementById("dzThemeKnob");
    var desc = document.getElementById("dzThemeDesc");
    if (toggle && knob) {
      // Toggle ON (blue) = Light, Toggle OFF (gray) = Dark
      if (!isDark) {
        toggle.style.background = "var(--water-mid)";
        knob.style.left = "22px";
      } else {
        toggle.style.background = "#e0e4ec";
        knob.style.left = "2px";
      }
    }
    if (desc) {
      desc.textContent = isDark ? "Dark mode is on" : "Light mode is on";
    }
  }

  /* Run on DOM ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateDzToggle);
  } else {
    updateDzToggle();
  }
})();

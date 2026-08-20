(function() {
  // Only push state on fresh app opens (history.length <= 1)
  // to prevent the system back button from exiting the app immediately.
  // When the user has navigated within the app (history.length > 1),
  // the browser's native back already works correctly.
  if (history.length <= 1) {
    history.pushState(null, "", location.href);
  }
})();

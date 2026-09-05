/**
 * View Router Module
 * Deep navigation module encapsulating section switching, hash navigation,
 * and view lifecycle hooks (pausing background carousel when not on Home).
 */
(function (global) {
  "use strict";

  function initRouter(config) {
    const {
      routes = {},
      navLinks = {},
      burgerBtn,
      navbarEl,
      initialRoute = "home",
      onNavigate,
    } = config;

    let activeRoute = null;

    function activateRoute(routeName) {
      const target = routes[routeName] ? routeName : initialRoute;

      // Close mobile menu if open
      if (navbarEl && navbarEl.classList.contains("nav-active")) {
        navbarEl.classList.remove("nav-active");
        if (burgerBtn) burgerBtn.classList.remove("toggle");
      }

      if (activeRoute === target) return;

      activeRoute = target;

      // Hide all registered sections and show only the target sections
      Object.keys(routes).forEach((key) => {
        const sections = routes[key];
        const isTarget = key === target;
        sections.forEach((sec) => {
          if (sec) {
            sec.style.display = isTarget ? "" : "none";
          }
        });
      });

      // Update active nav link styling
      Object.keys(navLinks).forEach((key) => {
        const link = navLinks[key];
        if (link) {
          if (key === target) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        }
      });

      // Notify lifecycle listeners
      if (typeof onNavigate === "function") {
        onNavigate(target);
      }
    }

    // Bind link click listeners
    Object.keys(navLinks).forEach((key) => {
      const link = navLinks[key];
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.hash = `#${key}`;
          activateRoute(key);
        });
      }
    });

    // Burger Menu toggle
    if (burgerBtn && navbarEl) {
      burgerBtn.addEventListener("click", () => {
        navbarEl.classList.toggle("nav-active");
        burgerBtn.classList.toggle("toggle");
      });
    }

    // Window Hashchange listener
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && routes[hash]) {
        activateRoute(hash);
      }
    });

    // Initial activation
    const currentHash = window.location.hash.replace("#", "");
    activateRoute(routes[currentHash] ? currentHash : initialRoute);

    return {
      navigateTo: activateRoute,
      getCurrentRoute: () => activeRoute,
    };
  }

  const ViewRouter = {
    init: initRouter,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ViewRouter;
  } else {
    global.ViewRouter = ViewRouter;
  }
})(typeof window !== "undefined" ? window : globalThis);

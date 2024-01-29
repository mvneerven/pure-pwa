/**
 ************************
 * PUREPWA APP SETTINGS *
 ************************
 */
export const APP_SETTINGS = {
  /**
   * Array of ES modules to load.
   * Path: /assets/js/shared/{module-name}/{module-name}.js
   */
  modules: [
    "svg-icon",
    "app-menu",
    "message-toaster",
    "x-form",
    "dropdown-list",
    "accordion-details",
    "range-switch",
    "list-view"
  ],

  /**
   * Main menu (hamburger/bottom)
   */
  appMenu: [
    {
      name: "Home",
      route: "/",
      icon: "home"
    },
    {
      type: "separator"
    },
    {
      name: "Settings",
      route: "/settings/",
      icon: "settings",
      tooltip: "App settings"
    }    
  ],

  /**
   * MPA Routes/pages
   * Each route key should directly match a subfolder under /public/
   */
  routes: {
    "/": {},
    "/about/": {},
    "/beauty/": {
      card: {
        index: 4,
        title: "Beauty"
      }
    },
    "/purity/": {
      card: {
        index: 1,
        title: "Purity"
      }
    },
    "/flow/": {
      card: {
        index: 3,
        title: "Flow"
      }
    },
    "/power/": {
      card: {
        index: 0,
        title: "Power"
      }
    },
    "/entry/": {
      card: {
        index: 4,
        title: "Entry"
      }
    },
    "/action/": {
      card: {
        index: 2,
        title: "Action"
      },
      tmdb: {
        endPoint: "https://api.themoviedb.org/3/",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDY5Zjc5MjZmZDI0Y2NkNmI0YmVhODJjMjRhOTE3YSIsInN1YiI6IjY1YTEwNGE0ZjA0ZDAxMDEyMjc5MTI0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YeIAk8TWtLgEVUcl24e_FZ4owWJqiFzzZlwi5KAhkxM",
        cdnBaseUrl: "https://image.tmdb.org/t/p/"
      }
    },
    "/settings/": {}
  }
};

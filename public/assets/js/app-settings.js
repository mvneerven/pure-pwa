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
    "list-view",
    "md-lite",
    "localize-section",
    "tab-strip",
    "input-autocomplete"
  ],

  /**
   * Main menu (hamburger/bottom)
   */
  appMenu: [
    {
      name: "Home",
      route: "/home/",
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
      },
      tags: ["video"]
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
  },

  localization: {
    defaultLanguage: "en",
    strings: {
      "Power & Purity": {
        nl: "Kracht & Puurheid"
      },
      Power: {
        nl: "Kracht"
      },
      Purity: {
        nl: "Puurheid"
      },
      Beauty: {
        nl: "Schoonheid"
      },
      Action: {
        nl: "Actie"
      },
      Entry: {
        nl: "Invoer"
      },
      Settings: {
        nl: "Instellingen"
      },
      "Configure App": {
        nl: "App Instellen"
      },
      System: {
        nl: "Systeem"
      },
      Dark: {
        nl: "Donker"
      },
      Light: {
        nl: "Licht"
      },
      Appearance: {
        nl: "Uiterlijk"
      },
      Animation: {
        nl: "Animatie"
      },
      Theme: {
        nl: "Thema"
      },
      Localization: {
        nl: "Localisatie"
      },
      "UI Language": {
        nl: "UI Taal"
      },
      "Describe new task...": {
        nl: "Beschrijf nieuwe taak"
      },
      "Add task": {
        nl: "Voeg taak toe"
      },
      "Current tasks:": {
        nl: "Huidige taken:"
      },
      "Little a PWA can't Do...": {
        nl: "Een PWA kan bijna alles..."
      },
      About: {
        nl: "Over"
      },
      "You want pretty?": {
        nl: "Je wilt mooi?"
      },
      "Handling APIs": {
        nl: "API's afhandelen"
      },
      "State Management": {
        nl: "State Beheer"
      },
      "Data Entry": {
        nl: "Invoer"
      },
      "Forms & Controls": {
        nl: "Formuliervelden"
      },
      "Sign up": {
        nl: "Aanmelden"
      },
      "Enter email address": {
        nl: "Voer emailadres in"
      },
      "Enter screen name": {
        nl: "Voer schermnaam in"
      },
      Language: {
        nl: "Taal"
      },
      Birthdate: {
        nl: "Geboortedatum"
      },
      Name: {
        nl: "Naam"
      },
      Continue: {
        nl: "Ga door"
      },
      Cancel: {
        nl: "Afbreken"
      },
      "Purity Matters": {
        nl: "Puurheid telt"
      },
      "Pure Modern Web": {
        nl: "Puur Modern Web"
      },
      "The PurePWA radical nothing-but-web-standards approach has nothing but advantages":
        {
          nl: "De PurePWA radicale niets-dan-web-standaarden aanpak heeft alleen maar voordelen"
        },
      "Invite someone": {
        nl: "Nodig iemand uit"
      },
      "Install new version": {
        nl: "Installeer nieuwe versie"
      },
      "Click to install new App version": {
        nl: "Klik om nieuwe App versie te installeren"
      }
    }
  },
  language: "nl"
};

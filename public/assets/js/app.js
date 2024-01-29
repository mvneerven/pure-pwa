import { mergeDeep, PurePWA } from "./common.js";
import { APP_SETTINGS } from "./app-settings.js";
import { DEMO_SETTINGS } from "./demo-settings.js";

/**
 * TO REMOVE THE DEMO, CHANGE THE NEXT 2 LINES INTO THIS:
 * let appSettings = APP_SETTINGS;
 */
const appSettings = {}; // APP_SETTINGS
mergeDeep(appSettings, APP_SETTINGS, DEMO_SETTINGS);

window.purePWA = new PurePWA(appSettings); // Launch main PWA controlling component

if (typeof navigator.serviceWorker !== "undefined")
  navigator.serviceWorker.register("/assets/js/services/sw.js");

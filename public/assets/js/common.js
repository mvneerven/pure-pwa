/**
 * Generates an HTML NodeList by parsing the given HTML string
 * @param {String} html
 * @returns {NodeListOf<ChildNode>} DOM element
 */
export function parseHTML(html) {
  return new DOMParser().parseFromString(html, "text/html").body.childNodes;
}

/**
 * Create nested Proxy to monitor
 * @param {*} eventTarget Object to use for 'state-change' event dispatching
 * @param {*} state Object holding initial state
 * @param {*} objectPath Path string used to indentify nested objects and values
 * @returns {Proxy} Proxy Object - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 */
export function createProxy(eventTarget, state = {}, objectPath = "") {
  return new Proxy(state, {
    set: (target, property, value) => {
      const detail = {
        path: objectPath,
        name: property,
        value: value
      };
      target[property] = value;

      if (Array.isArray(target)) {
        if (isNumeric(property)) {
          delete detail.name;
          detail.newIndex = parseInt(property);
        }
      }
      eventTarget.dispatchEvent(
        new CustomEvent("state-change", {
          detail: detail,
          bubbles: true
        })
      );
      return true;
    },
    get: (target, key) => {
      // Create a new Proxy for every nested object, including arrays.
      if (
        target[key] !== null &&
        (Array.isArray(target[key]) || typeof target[key] === "object")
      )
        return createProxy(eventTarget, target[key], `${objectPath}/${key}`);

      return target[key];
    }
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Debounce rapid-firing events
 * @param {Function} func function to debounce
 */
export const debounce = (func) => {
  // This holds the requestAnimationFrame reference, so we can cancel it if we wish
  let frame;

  // The debounce function returns a new function that can receive a variable number of arguments
  return (...params) => {
    // If the frame variable has been defined, clear it now, and enqueue for next frame
    if (frame) {
      cancelAnimationFrame(frame);
    }

    // Queue our function call for the next frame
    frame = requestAnimationFrame(() => {
      // Call our function and pass any params we received
      func(...params);
    });
  };
};

/**
 * Sets a location hash to allow returning to previous state
 * when the browser Back button is clicked.
 * @param {String} hash the hash to set
 * @param {Function} setState function to call initially, linked to the hash
 * @param {Function} restoreState function to call when the hash changes again
 */
export function hookHashChange(hash, setState, restoreState) {
  // The window.location.hash setter works async,
  // so we have to hook on hash change once initially
  window.addEventListener(
    "hashchange",
    () => {
      setState();

      // set the restore hook on the next hash change
      window.addEventListener("hashchange", restoreState, {
        once: true
      });
    },
    {
      once: true
    }
  );
  window.location.hash = hash;
}

/**
 * @enum { Number }
 */
export const CustomElementDOMType = {
  Light: 1,
  Shadow: 2
};

export const ColorScheme = {
  Light: "light",
  Dark: "dark"
};

export const Appearance = {
  System: "system-default",
  ...ColorScheme
};

/**
 * Base Class for Web Components.
 * Features:
 *   - Proxy-managed 'state' (object) property
 *   - Automatic signalling of state property changes using Custom Events
 *   - ES String Template based render() method
 *   - Support for Shadow and Light DOM (see domType - CustomElementDOMType)
 */
export class CustomElement extends HTMLElement {
  #renderRoot;

  constructor() {
    super();
    this.settings = purePWA.getPageSettings(); // load page config
    this.#renderRoot = this;

    /**
     * Create monitored properties
     */
    this.state = createProxy(this, {});
  }

  /**
   * Gets the current render root element (light or shadow DOM)
   */
  get renderRoot() {
    return this.#renderRoot;
  }

  /**
   * Return true in an inherited class to show a skeleton while rendering
   */
  get useSkeleton() {
    return false;
  }

  connectedCallback() {
    const me = this;

    if (me.domType === CustomElementDOMType.Shadow) {
      me.attachShadow({ mode: "open" });
      me.#renderRoot = me.shadowRoot;
    }

    if (typeof me.render === "function") {
      let skeletonTimer;
      const render_internal = async (me) => {
        if (skeletonTimer) clearTimeout(skeletonTimer);
        me.renderRoot.innerHTML = "";
        const template = await me.render.apply(me);

        for (let node of parseHTML(template)) {
          me.renderRoot.appendChild(node);
        }

        if (typeof me.rendered === "function") {
          enQueue(me.rendered.bind(me));
        }
      };
      if (me.useSkeleton) {
        skeletonTimer = setTimeout(() => {
          me.handleSkeleton();
        }, 500);

        enQueue(async () => render_internal(me), 50);
      } else render_internal(me);
    }
  }

  on(eventName, func) {
    this.addEventListener(eventName, func);
  }

  /**
   * @type {CustomElementDOMType}
   */
  set domType(value) {
    this._domType = value;
  }
  get domType() {
    return this._domType;
  }

  handleSkeleton() {
    if (this.useSkeleton === true)
      this.renderRoot.innerHTML = /*html*/ `<section class="skeleton"></section>`;
    else if (typeof this.useSkeleton === "string") {
      this.renderRoot.innerHTML = this.useSkeleton;
    } else if (typeof this.useSkeleton === "function") {
      this.renderRoot.innerHTML = this.useSkeleton();
    }
  }
}

/**
 * SPA Router enabled Web Component
 * Features:
 *   - can handle multiple sub-routes within its MPA page.
 *   - uses Navigator.navigate event
 */
export class RouterElement extends CustomElement {
  #sortedRoutes;

  get routes() {
    return {};
  }

  get sortedRoutes() {
    return this.#sortedRoutes;
  }

  constructor() {
    super();
    const me = this;

    navigation.addEventListener("navigate", async (event) => {
      const routeData = this.getRoute(event.destination.url);
      if (!routeData) return;

      console.log("Intercepting ", event.destination.url, routeData);

      event.intercept({
        async handler() {
          try {
            purePWA.startViewTransition(async () => {
              me.renderRoot.innerHTML = /*html*/ `<section class="skeleton"></section>`;

              let data = await routeData.handler(routeData.subPath);
              me.renderRoot.innerHTML = "";
              for (let node of parseHTML(data)) {
                me.renderRoot.appendChild(node);
              }
            });
          } catch (ex) {
            console.error("Navigation Interception Handler error", ex);
          }
        }
      });
    });
  }

  getRoute(urlString) {
    try {
      const url = new URL(urlString, location);
      for (let route of this.sortedRoutes) {
        if (url.pathname.startsWith(route)) {
          const subPath = url.pathname.substring(route.length);
          return {
            route: route,
            url: url,
            handler: this.routes[route],
            subPath: subPath
          };
        }
      }
    } catch (ex) {
      console.error("getRoute error: ", ex);
    }
  }

  connectedCallback() {
    this.#sortedRoutes = Object.keys(this.routes).sort((a, b) => {
      if (a.length > b.length) return -1;
      return 1;
    });
    super.connectedCallback();
  }

  async render() {
    const route = this.getRoute(this.settings.url);
    if (!route) return null;

    return await route.handler.apply(this);
  }
}

/**
 * API requests using fetch()
 * @param {*} url - API endpoint
 * @param {*} method - GET, POST, PUT, DELETE
 * @param {*} headers - Request headers to add
 * @param {*} body - if method is 'POST', provide request body
 * @returns
 */
export async function apiRequest(
  url,
  method = "GET",
  headers = {},
  body = null
) {
  try {
    //console.log("API request:", url, method, headers, body);

    let response = await fetch(url, { method, headers, body });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`${response.status}: ${message}`);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * Load ECMAScript Module
 * @param {String} name
 * @param {Boolean} force
 */
export async function loadESModule(name, force = false) {
  try {
    let firstElement = force || document.documentElement.querySelector(name);
    if (firstElement) {
      await import(`/assets/js/shared/${name}/${name}.js`);
    }
  } catch (exception) {
    console.log(name, "cannot be loaded:", exception);
  }
}

function pad(number) {
  return number < 10 ? "0" + number : number;
}

export function formatDate(date, format) {
  date = typeof date === "Date" ? date : new Date(date);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  day = pad(day);
  month = pad(month);

  return format.replace("dd", day).replace("MM", month).replace("yyyy", year);
}

/**
 * Returns a random GUID
 * @returns string (36 characters)
 */
export function guid(options) {
  options = { ...(options || {}) };
  let g = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return `${options.prefix || ""}${options.compact ? g.split("-").pop() : g}`;
}

export function hookEscapeKey(callback) {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") callback();
    },
    {
      once: true
    }
  );
}

export function toCamelCase(property) {
  return property.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

/**
 * Queue work until the main thread is freed up.
 * @param {Function} func
 */
export function enQueue(func, milliseconds = 0) {
  setTimeout(func, milliseconds);
}

/**
 * App
 */
export class PurePWA {
  #settings;

  constructor(settings) {
    this.#settings = settings;

    const appearanceSettings = PurePWA.detectAppearanceSettings();
    let savedAppearance =
      localStorage.getItem("appearance") || Appearance.System;

    if (savedAppearance === Appearance.System) {
      this.colorScheme = appearanceSettings.theme;
      this.appearance = appearanceSettings.prefers;
      
    } else {
      this.colorScheme = savedAppearance;
      this.appearance = savedAppearance;
    }

    this.#detectAnimationPreference();

    enQueue(this.#loadECMAScriptModules.bind(this));
    enQueue(this.#cacheMPAInBackground.bind(this), 1000);
    enQueue(this.#addPWAInstallButton.bind(this), 5000);

    this.#handleMouseExceptions();
  }

  #handleMouseExceptions() {
    document.addEventListener(
      "mousedown",
      (event) => {
        if (event.detail > 1) {
          /* Prevent doubleclicking to select text */
          event.preventDefault();
        } else if (event.button === 0 && event.target.closest(".title")) {
          /* Click on title area -> HOME */
          window.location = "/";
        }
      },
      false
    );
  }

  static detectAppearanceSettings() {
    const mm = window.matchMedia;
    if (window.matchMedia) {
      return {
        prefers: mm("(color-scheme: dark)").matches
          ? Appearance.Dark
          : mm("(color-scheme: light)").matches
          ? Appearance.Light
          : Appearance.System,
        theme: mm("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      };
    }
    return {
      prefers: undefined,
      theme: Appearance.Light
    };
  }

  #detectAnimationPreference() {
    let useAnimation = localStorage.getItem("use-animations") !== "0";
    if (useAnimation === null) {
      useAnimation = !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
    }
    document.documentElement.setAttribute(
      "data-use-animations",
      useAnimation != "0" ? "1" : "0"
    );
    this.useAnimations = useAnimation;
    localStorage.setItem("use-animations", useAnimation ? "1" : "0");
  }

  get appearance() {
    return document.documentElement.getAttribute("data-appearance");
  }

  set appearance(value) {
    document.documentElement.setAttribute("data-appearance", value);
    if(value !== Appearance.System)
      localStorage.setItem("appearance", value);
    else
      localStorage.removeItem("appearance");
  }

  set colorScheme(value) {
    if (value === Appearance.System) throw new Error("Invalid color scheme");
    document.documentElement.setAttribute("data-color-scheme", value);
  }

  get colorScheme() {
    return (
      document.documentElement.getAttribute("data-color-scheme") ||
      PurePWA.detectAppearanceSettings().theme
    );
  }

  get useAnimations() {
    return document.documentElement.getAttribute("data-use-animations") !== "0";
  }

  set useAnimations(value) {
    value = value ? "1" : "0";
    document.documentElement.setAttribute("data-use-animations", value);
    localStorage.setItem("use-animations", value);
  }

  /**
   * Cache all MPA pages (with CSS+SCRIPTS)
   * silently after rendering is complete.
   */
  async #cacheMPAInBackground() {
    const URLs = Object.keys(this.settings.routes);

    for (const url of URLs) {
      let baseUrl = url;

      const response = await fetch(url);
      const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html"
      );
      const cssLinks = Array.from(
        doc.querySelectorAll('link[rel="stylesheet"]')
      ).map((link) => baseUrl + link.href);
      const jsScripts = Array.from(doc.querySelectorAll("script[src]")).map(
        (script) => baseUrl + script.getAttribute("src")
      );
      const allResources = [...cssLinks, ...jsScripts];

      for (const resource of allResources) {
        fetch(resource);
      }
    }
  }

  /**
   * Load App ECMAscript Modules
   */
  #loadECMAScriptModules() {
    this.settings.modules.forEach(async (name) => {
      loadESModule(name);
    });
  }

  #addPWAInstallButton() {
    /**
     * This makes sure the app install button
     * TODO: add install link with href="/install/"
     *
     */
    const btnAdd = parseHTML(
      /*html*/ `<a title="Install this PWA to your device" class="pwa-install" href="/install/"><svg-icon icon="rocket"></svg-icon></a>`
    )[0];
    document.body.appendChild(btnAdd);

    // Assuming the service worker registration is done elsewhere in your code
    navigator.serviceWorker.ready
      .then(function (registration) {
        console.log("Service Worker ready");
        registration.active.postMessage({ command: "getDeferredPrompt" });
      })
      .catch(function (error) {
        console.log(
          "Error occurred while communicating with service worker: ",
          error
        );
      });

    navigator.serviceWorker.addEventListener("message", function (event) {
      if (event.data && event.data.command === "deferredPrompt") {
        btnAdd.style.display = "block";
        btnAdd.addEventListener("click", function (e) {
          e.preventDefault();
          event.data.deferredPrompt.prompt();
        });
      }
    });
  }

  get settings() {
    return this.#settings;
  }

  getPageSettings() {
    const url = document.documentElement.getAttribute("data-url");
    return { url: url, ...(this.#settings.routes[url] || {}) };
  }

  get messageBus() {
    return {
      dispatch: (category, props) => {
        globalThis.dispatchEvent(
          new CustomEvent(category, {
            detail: props
          })
        );
      },

      subscribe: (category, e) => {
        globalThis.addEventListener(category, e);
      }
    };
  }

  get startViewTransitionFallback() {
    return function (h) {
      h();
    };
  }

  startViewTransition(callback) {
    if (document.documentElement.getAttribute("data-use-animations") === "1")
      return document.startViewTransition(callback);
    else return purePWA.startViewTransitionFallback(callback);
  }
}

export function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        if (!Array.isArray(target[key])) target[key] = [];
        target[key] = target[key].concat(source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Simple class for efficient HTML string building
 */
export class HTMLBuilder {
  #lines = [];
  #container = "";

  /**
   * Constructor
   * @param {String} container - use '{html}' for the built-up string to be placed in
   */
  constructor(container = "{html}") {
    this.#container = container;
  }

  /**
   * Adds a string to the
   * @param {String} htmlPart
   */
  add(htmlPart) {
    this.#lines.push(htmlPart);
  }

  /**
   * Returns the built-up string, optionally using the given container for enclosing.
   * @returns {String} html string
   */
  toHTML() {
    const html = this.#lines.join("");

    if (this.#container.length) return this.#container.replace("{html}", html);

    return html;
  }
}

const sanitizationMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;"
  },
  POLYFILLS = {
    /**
     * List of PolyFills to check for
     */
    navigation: {
      isNeeded: () => {
        return (
          typeof window.navigation === "undefined" ||
          !("navigate" in window.navigation)
        );
      },
      install: () => {
        const checkNavigationInterception = (url) => {
          let interception;
          const navigateEvent = new CustomEvent("navigate");

          navigateEvent.destination = {
            url: url
          };
          navigateEvent.intercept = (o) => {
            if (o) interception = o;
          };

          window.navigation.dispatchEvent(navigateEvent);

          navigateEvent.intercept();
          if (interception) {
            navigateEvent.interception = interception;
          }
          return navigateEvent;
        };

        window.navigation = new EventTarget();
        const me = this;
        document.addEventListener("click", (e) => {
          if (e.target.href) {
            let navigateEvent = checkNavigationInterception(e.target.href);

            if (
              navigateEvent.interception &&
              typeof navigateEvent.interception.handler === "function"
            ) {
              e.preventDefault();
              e.stopPropagation();

              window.history.pushState({}, "", navigateEvent.destination.url);
              navigateEvent.interception.handler.bind(me).call();
              window.addEventListener(
                "popstate",
                (event) => {
                  let navigateEvent = checkNavigationInterception(
                    window.location.href
                  );
                  if (
                    navigateEvent.interception &&
                    typeof navigateEvent.interception.handler === "function"
                  ) {
                    navigateEvent.interception.handler.bind(me).call();
                  }
                },
                {
                  once: true
                }
              );
            }
          }
        });
      }
    }
  },
  attr = (name) => {
    return document.documentElement.getAttribute(name);
  };

/**
 * Run through list of PolyFills to install if needed.
 */
export function setupPolyFills() {
  Object.keys(POLYFILLS).forEach((key) => {
    if (POLYFILLS[key].isNeeded()) {
      console.log("Installing polyfill", key);
      POLYFILLS[key].install(key);
    }
  });
}

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
 * @param {EventTarget} eventTarget Object to use for 'state-change' event dispatching
 * @param {Object} state Object holding initial state
 * @param {String} objectPath Path string used to indentify nested objects and values
 * @returns {Proxy} Proxy Object - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 */
export function createProxy(eventTarget, state = {}, objectPath = "") {
  return new Proxy(state, {
    set: (target, property, value) => {
      const oldValue = structuredClone(target[property]);

      const detail = {
        path: objectPath,
        target: target,
        name: property,
        oldValue: oldValue,
        value: value
      };

      target[property] = value;

      if (Array.isArray(target)) {
        if (isNumeric(property)) {
          delete detail.name;
          detail.type = "add";
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

  /**
   * Attaches one or more event listeners
   * @param {String} eventNames - name(s) of the event to listen to, space-separated.
   * @param {Event || Object} funcOrObject - function, or object with selectors as keys and functions as values.
   */
  on(eventNames, funcOrObject) {
    eventNames.split(" ").forEach((eventName) => {
      if (typeof funcOrObject === "function")
        this.addEventListener(eventName, func);
      else {
        this.addEventListener(eventName, (e) => {
          Object.keys(funcOrObject).forEach((selector) => {
            if (e.target.closest(selector)) {
              funcOrObject[selector].apply(this, [e]);
            }
          });
        });
      }
    });
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
 * Encapsulates fetch() functionality
 * @event beforeRequest dispatched before fetching
 * @event afterResponse dispatched when response is fetched, but before returning the results.
 */
export class ApiRequest extends EventTarget {
  #interceptors = [];

  constructor(baseUrl, defaultHeaders = {}) {
    super();
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  async #execute(localUrl, options = {}) {
    try {
      const mergedOptions = {
        method: "GET",
        ...options,
        headers: { ...this.defaultHeaders, ...options.headers }
      };
      const url = `${this.baseUrl}${localUrl}`;

      this.#dispatch("beforeRequest", {
        request: {
          url: url,
          options: mergedOptions
        }
      });

      const response = await fetch(url, mergedOptions);

      this.#dispatch("afterResponse", {
        request: {
          url: url,
          options: mergedOptions
        },
        response: response
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // Handle network errors or other issues
      console.error("Fetch error:", error);
      throw error;
    }
  }

  #dispatch(eventName, data) {
    return this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: data
      })
    );
  }

  addInterceptor(interceptor) {
    this.#interceptors.push(interceptor);
  }

  on(eventName, func) {
    this.addEventListener(eventName, func);
    return this;
  }

  async getData(url, options = {}) {
    return this.#execute(url, {
      ...options,
      method: "GET"
    });
  }

  async postData(url, data, options = {}) {
    return this.#execute(url, {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
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

/**
 * Converts a string to camelCase.
 * @param {String} property
 * @returns {String}
 */
export function toCamelCase(property) {
  return property.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}

/**
 * Sanitizes a string that comes from user input to avoid XSS attacks
 * @param {String} str
 * @returns {String}
 */
export function sanitizeString(str) {
  const reg = /[&<>"'/]/gi;
  return str.replace(reg, (match) => sanitizationMap[match]);
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
  #state;

  constructor(settings) {
    this.#settings = settings;

    this.#state = createProxy(this, {});

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
    enQueue(
      this.#cacheMPAInBackground.bind(this),
      attr("data-url") === "/" ? 1 : 2000
    );

    this.#handleMouseExceptions();

    enQueue(this.#registerServiceWorker.bind(this));

    this.#setupResizeMonitor();

    document.body.style.visibility = "visible" /* fix for ISSUE 1  */;

    this.localizeDocumentText();
  }

  #setupResizeMonitor() {
    const checkOrientation = () => {
      document.documentElement.setAttribute(
        "data-orientation",
        window.innerWidth > window.innerHeight ? "landscape" : "portrait"
      );
    };
    window.addEventListener("resize", debounce(checkOrientation));
    checkOrientation();
  }

  #handleMouseExceptions() {
    document.addEventListener(
      "mousedown",
      (event) => {
        if (event.detail > 1) {
          /* Prevent doubleclicking to select text */
          event.preventDefault();
        } else if (
          event.button === 0 &&
          event.target.closest("header h1, header h2")
        ) {
          /* Click on title area -> HOME */
          window.location = "/home/";
        }
      },
      false
    );
  }

  async #registerServiceWorker() {
    if (typeof navigator.serviceWorker === "undefined") return;

    let newWorker,
      refreshing = false;
    const me = this;

    const serviceWorkerNotification = parseHTML(
      /*html*/
      `<div title="${purePWA.localizeString(
        "Click to install new App version"
      )}." id="sw-notification" >
          <a id="reload"><svg-icon icon="rocket"></svg-icon><span>${purePWA.localizeString(
            "Install new version"
          )}</span></a>
        </div>`
    )[0];
    serviceWorkerNotification.addEventListener("click", () => {
      newWorker.postMessage({ action: "skipWaiting" });
    });
    document.body.appendChild(serviceWorkerNotification);

    me.serviceWorker = await navigator.serviceWorker.register(
      "/service-worker.js"
    );
    console.log("ServiceWorker registered", me.serviceWorker);

    //me.serviceWorker.active.postMessage({command: 'getDeferredPrompt'});

    this.serviceWorker.addEventListener("updatefound", () => {
      // An updated service worker has appeared in me.serviceWorker.installing!
      newWorker = me.serviceWorker.installing;
      newWorker.addEventListener("statechange", () => {
        // Has service worker state changed?
        switch (newWorker.state) {
          case "installed":
            // There is a new service worker available, show the notification
            if (navigator.serviceWorker.controller) {
              let notification = document.getElementById("sw-notification");
              notification.className = "show"; // Update available
            }
            break;
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });

    self.addEventListener("message", function (event) {
      console.log("postMessage received", event);

      if (event.data.action === "installed") {
        localStorage.setItem("installed-version", event.data.version);

        me.messageBus.dispatch("notification", {
          // toaster
          text: `New version installed: ${event.data.version}`
        });
      }
    });

    let deferredPrompt, btnAdd;
    self.addEventListener("beforeinstallprompt", (e) => {
      console.log("beforeinstallprompt", e);

      e.preventDefault();
      deferredPrompt = e;

      btnAdd = parseHTML(
        /*html*/ `<a title="Install this PWA to your device" id="pwa-install" href="/install/"><svg-icon icon="rocket"></svg-icon></a>`
      )[0];
      btnAdd.addEventListener("click", async (e) => {
        e.preventDefault();
        e.data.deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      });
      document.body.appendChild(btnAdd);
    });

    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data && e.data.command === "deferredPrompt")
        btnAdd.classList.add("show");
    });
  }

  /**
   * Detect user settings about dark mode preferences
   */
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
    return attr("data-appearance");
  }

  set appearance(value) {
    document.documentElement.setAttribute("data-appearance", value);
    if (value !== Appearance.System) localStorage.setItem("appearance", value);
    else localStorage.removeItem("appearance");
  }

  set colorScheme(value) {
    if (value === Appearance.System) throw new Error("Invalid color scheme");
    document.documentElement.setAttribute("data-color-scheme", value);
  }

  get colorScheme() {
    return (
      attr("data-color-scheme") || PurePWA.detectAppearanceSettings().theme
    );
  }

  get useAnimations() {
    return attr("data-use-animations") !== "0";
  }

  set useAnimations(value) {
    value = value ? "1" : "0";
    document.documentElement.setAttribute("data-use-animations", value);
    localStorage.setItem("use-animations", value);
  }

  get theme() {
    return localStorage.getItem("theme") || "pure";
  }

  set theme(value) {
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem("theme", value);
  }

  /**
   * Get stored/default language
   */
  get language() {
    return (
      localStorage.getItem("language") ||
      navigator?.language?.split("-")[0] ||
      "en"
    );
  }

  set language(value) {
    document.documentElement.setAttribute("lang", value);
    localStorage.setItem("language", value);
  }

  localizeDocumentText() {
    const textFilter = (node) => {
      return node.nodeType === Node.TEXT_NODE
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    };

    const iterator = document.createNodeIterator(
      document.body,
      NodeFilter.SHOW_TEXT,
      textFilter
    );
    let node = iterator.nextNode();

    while (node) {
      let parent = node.parentElement;
      let text = node.nodeValue.trim();

      if (text.length > 1 && !["SCRIPT"].includes(parent.nodeName)) {
        let translation = this.localizeString(text);

        if (translation && translation !== text) {
          node.nodeValue = translation;
          parent.setAttribute("data-translated-from", text); // no need to escape since these are #text nodes.
        } else {
          console.log("◩", text); // TO BE TRANSLATED
        }
      }
      node = iterator.nextNode();
    }

    ["placeholder", "title"].forEach((attributeName) => {
      document.body
        .querySelectorAll(`[${attributeName}]`)
        .forEach((placeholderElement) => {
          let text = placeholderElement.getAttribute(attributeName);
          let translation = this.localizeString(text);
          if (translation && translation !== text) {
            placeholderElement.setAttribute(attributeName, translation);
            placeholderElement.setAttribute(
              `data-${attributeName}-translated-from`,
              text
            ); // no need to escape since these are #text nodes.
          }
        });
    });

    this.listenForTextualChanges(); // now make sure we keep track of changes
  }

  /**
   * Uses MutationObserver to check for text node changes.
   */
  listenForTextualChanges() {
    // Select the node that will be observed for mutations
    const targetNode = document;

    // Options for the observer (which mutations to observe)
    const config = {
      attributes: true,
      childList: true,
      characterData: true, // This is the key option to observe text changes
      subtree: true // Observe changes in the descendants of the target node
    };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === "characterData") {
          //console.log("Text content changed:", mutation.target.textContent);
          //TODO: implement changes
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  }

  /**
   * Translates given string in current locale/language.
   * @param {*} text
   * @returns
   */
  localizeString(text) {
    const s = this.#settings.localization?.strings[text];
    return s && s[this.language] ? s[this.language] : text;
  }

  /**
   * Cache all MPA pages (with CSS+SCRIPTS)
   * silently after rendering is complete.
   */
  async #cacheMPAInBackground() {
    if (sessionStorage.getItem("mpa-cache")) return; // needed once per session

    const URLs = Object.keys(this.settings.routes);

    for (const relativeMPAPath of URLs) {
      const response = await fetch(relativeMPAPath);
      const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html"
      );
      const cssLinks = Array.from(
        doc.querySelectorAll('link[rel="stylesheet"]')
      ).map((link) => relativeMPAPath + link.getAttribute("href"));
      const jsScripts = Array.from(doc.querySelectorAll("script[src]")).map(
        (script) => relativeMPAPath + script.getAttribute("src")
      );
      const allResources = [...cssLinks, ...jsScripts];

      for (const resource of allResources) {
        fetch(resource);
      }
    }

    sessionStorage.setItem("mpa-cache", "1");
  }

  /**
   * Load App ECMAscript Modules
   */
  #loadECMAScriptModules() {
    this.settings.modules.forEach(async (name) => {
      loadESModule(name);
    });
  }

  /**
   * This makes sure the app install button
   */

  get settings() {
    return this.#settings;
  }

  getPageSettings() {
    const url = attr("data-url");
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
    if (
      attr("data-use-animations") === "1" &&
      "startViewTransition" in document
    )
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

export class MarkdownLite {
  constructor() {
    this.rules = [
      {
        name: "paragraph",
        pattern: /(?:\n\n|^)([^\n]+(?:\n[^\n]+)*)(?=\n\n|$)/g,
        replacement: "<p>$1</p>"
      },
      {
        name: "emphasis",
        pattern: /\*([^\n]+)\*/g,
        replacement: "<em>$1</em>"
      },
      {
        name: "strong",
        pattern: /__([^\n]+)\__/g,
        replacement: "<strong>$1</strong>"
      },
      {
        name: "url",
        pattern: /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g,
        replacement: '<a rel="noopener" target="_blank" href="$2">$1</a>'
      }
    ];
  }

  render(raw) {
    let result = raw;
    this.rules.forEach((rule) => {
      result = result.replace(rule.pattern, rule.replacement);
    });
    return result;
  }
}

/**
 * Checks whether the fiven string is a valid URL.
 * @param {String} txt - the string to evaluate
 * @returns Boolean indeicating whether the string is a URL.
 */
export function isUrl(txt) {
  try {
    if (typeof txt !== "string") return false;
    if (txt.indexOf("\n") !== -1 || txt.indexOf(" ") !== -1) return false;
    if (txt.startsWith("#/")) return false;
    new URL(txt, window.location.origin);
    return true;
  } catch {}
  return false;
}

/**
 ***************************************************************
 *                  PUREPWA DEMO SETTINGS
 * 💡This data is merged with the structure in app-settings.js
 **************************************************************/

export const DEMO_SETTINGS = {
  /**
   * Extra, demo-related buttons in the manin menu
   */
  appMenu: [
    {
      name: "Info",
      tooltip: "",
      type: "js",
      icon: "help",
      route: "/info/"
    },
    
    {
      name: "About",
      route: "/about/",
      icon: "about",
      tooltip: "About PurePWA"
    }
  ],

  /**
   * Adds guidance that leads to the 'Info' menu item to display
   * a dialog with this information.
   */
  routes: {
    "/home/": {
      guidance: {
        title: "PurePWA",
        description: "Hybrid MPA - General Features",
        features: [
          `Auto adapting app menu (hamburger, bottom menu on mobile)`,
          `CSS grid auto flow`,
          `SVG Sprite Icons`,
          `Micro animations (optional)`,
          `Light, Dark and automatic appearance`,
          `Automatic pre-caching of MPA pages`
        ]
      }
    },
    "/about/": {},
    "/beauty/": {
      guidance: {
        title: "Beauty",
        description: `
          No need for anything but standards to make things pretty and app-like.`,

        features: [
          `Scrollbar Snap Behavior (scroll-snap-*)`,
          `View Transitions`,
          `SPA sub-routes`
        ]
      }
    },
    "/purity/": {
      guidance: {
        title: "The Power of Semantics",
        description: `Semantically correct HTML has all kinds of benefits, some of which are more understood than others.
          `,
        features: [
          `Accordion using details/summary Semantic HTML tags`,
          `Progressive enhancement (accordion-details Web Component)`,
          `Use of aria-* and role attributes`
        ]
      }
    },
    "/flow/": {
      guidance: {
        title: "A simple TODO App",
        description: `State Management doesn't have to be complex.
            Libraries like <em>Redux</em> have made us think so.
          `,
        features: [
          `Semantically correct, accessible web form`,
          `Enclosing label inputs to avoid unique ids and 'for' attributes`,
          `x-form progressive enhancement`,
          `micro-animations for user support`
        ]
      }
    },
    "/power/": {
      guidance: {
        title: "WebRTC",
        description: `You have no idea what the browser is capable of.
            Here's a video chat app for you...`,
        features: [`WebRTC API`, `Web Share API`]
      }
    },
    "/entry/": {
      guidance: {
        title: "Form Handling",
        description: `Native Web Forms are very capable; you certainly don't need a framework to build them.
          However, this has been the narrative over the last ten years.
          `,
        features: [
          `Great accessibility`,
          `Semantic HTML (fieldset, legend, label, aria-attributes)`,
          `Progressive enhancement dropdown-list (using input + dynamic datalist)`,
          `CSS-based required field indication`,
          `Powerful HTML5 Form Validation API`
        ]
      }
    },
    "/action/": {
      guidance: {
        title: "APIs & in-page Routes",
        description: `Accessing backend APIs is easy with <em>fetch()</em>.
            The browser has a rich set of async methods and events to help you.
          `,
        features: [
          `Fetching data`,
          `In-page router using Navigator.navigate interception`,
          `View Transition API: morphing between master & detail`,
          `Skeleton empty state`
        ]
      }
    },
    "/settings/": {}
  }
};

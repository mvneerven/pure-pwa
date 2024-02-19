import { MarkdownLite } from "../../common.js";

customElements.define(
  "localize-section",
  /**
   * Turns an input[type="range"] into a Switch Control
   */
  class LocalizeSection extends HTMLElement {
    connectedCallback() {
      const me = this;
      me.url = me.getAttribute("url");

      if (me.url) {
        me.style.opacity = 0;
        me.loadAlternativeLocale().then((html) => {
          if (html) me.innerHTML = html;
          me.style.opacity = 1;
        });
      }
    }

    async loadAlternativeLocale() {
      let html;
      try {
        const response = await fetch(
          `/assets/locale/${purePWA.language}/${this.url}`
        );

        if (response.status === 200) {
          html = await response.text();
          if (html.indexOf(` data-url="/"`) !== -1) return null;
          return html;
        }
      } catch (ex) {
        console.log("Cannot load alternative locale for " + this.url, ex);
      }
    }
  }
);

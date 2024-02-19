import { MarkdownLite } from "../../common.js";

customElements.define(
  "md-lite",
  /**
   * Turns an input[type="range"] into a Switch Control
   */
  class MdLite extends HTMLElement {
    #md;

    constructor(){
      super();
      this.#md = new MarkdownLite();
    }

    connectedCallback() {
      let text = this.#md.render(this.textContent);
      text = purePWA.localizeString(text);

      this.innerHTML = text;
    }
  }
);

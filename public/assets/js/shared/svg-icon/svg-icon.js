import { CustomElement } from "../../common.js";

customElements.define(
  "svg-icon",
  /**
   * Renders SVG icon using SVG sprites defined in /assets/img/icons.svg
   */
  class SVGIcon extends CustomElement {
    static get observedAttributes() {
      return ["icon"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "icon" && newValue) {
        this.querySelector("use")?.setAttribute(
          "href",
          "/assets/img/icons.svg#" + newValue
        );
      }
    }

    render() {
      return /*html*/ `<svg class="icon" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/img/icons.svg#${this.getAttribute(
          "icon"
        )}" />
      </svg>`;
    }
  }
);

import { CustomElement, enQueue } from "../../common.js";

customElements.define(
  "range-switch",
  /**
   * Turns an input[type="range"] into a Switch Control
   */
  class RangeSwitch extends CustomElement {
    static get observedAttributes() {
      return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value" && newValue) {
        this.querySelector("input").value = parseInt("0" + newValue);
      }
    }

    connectedCallback() {
      const condition = () => {
        return range.value === "1";
      };

      const range = this.querySelector('input[type="range"]');

      range.addEventListener("input", (e) => {
        this.setAttribute("value", condition() ? 1 : 0);
      });

      enQueue(() => {
        this.setAttribute("value", condition() ? 1 : 0);
      });
    }
  }
);

import { CustomElement, parseHTML } from "../../common.js";
import "../svg-icon/svg-icon.js";

const MESSAGE_TIMEOUT = 3000;

customElements.define(
  "message-toaster",

  /** Renders Message Toaster to display quick notifications */
  class MessageToaster extends CustomElement {
    #container;

    render() {
      return /*html*/ `<section id="toastContainer"></section>`;
    }

    rendered() {
      this.#container = document.getElementById("toastContainer");

      purePWA.messageBus.subscribe("notification", (e) => {
        this.add(e.detail.text, e.detail.type || "info");
      });
    }

    add(message, type) {
      let toast = parseHTML(/*html*/ `
        <div class="toast in" role="status">
          <svg-icon icon="${type}"></svg-icon>
          <span>${message}</span>
        </div>`)[0];

      this.#container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove("in");
      }, 100);

      setTimeout(() => {
        toast.classList.add("out");

        setTimeout(() => {
          this.#container.removeChild(toast);
        }, MESSAGE_TIMEOUT * 0.2);
      }, MESSAGE_TIMEOUT * 0.8);
    }
  }
);

import {
  CustomElement,
  debounce,
  parseHTML,
  HTMLBuilder
} from "../../common.js";
import "../svg-icon/svg-icon.js";
const HOST_PATTERN = /^(https?:\/\/[^\/]+)\//;

customElements.define(
  "app-menu",
  /** Renders menu (hamburger or bottom-auto-hiding)  */
  class AppMenu extends CustomElement {
    #helpDialog;

    render() {
      return /*html*/ `

      <nav id="hamburger">
        <a href="#app-menu" aria-label="Menu" >
            <span>Menu</span>
            <svg-icon icon="menu"></svg-icon>
        </a>
      </nav>

      <nav id="app-menu">
        ${this.getMenu()}
      </nav>`;
    }

    getMenu() {
      const builder = new HTMLBuilder();
      for (let item of purePWA.settings.appMenu) {
        builder.add(this.getMenuItem(item));
      }
      return builder.toHTML();
    }

    getMenuItem(item) {
      switch (item.type) {
        case "separator":
          return /*html*/ `<hr/>`;

        default:
          return /*html*/ `
          <a title="${item.tooltip || ""}" href="${item.route}" aria-label="${
            item.name
          }">
              <svg-icon icon="${item.icon}" color></svg-icon>
              <span>${item.name}</span>
            </a>
          `;
      }
    }

    rendered() {
      this.autoHide();

      const relativeUrl = "/" + window.location.href.replace(HOST_PATTERN, "");

      this.renderRoot.querySelectorAll("a[href]").forEach((anchor) => {
        let href = "/" + anchor.href.replace(HOST_PATTERN, "");

        switch (href) {
          case "/info/":
            if (this.settings?.guidance) {
              anchor.addEventListener("click", (e) => {
                e.preventDefault();
                this.showGuidance();
              });
            } else {
              anchor.setAttribute("disabled", "disabled");
            }
            break;
          
        }

        if (window.location.host === new URL(anchor.href).host) {
          if (relativeUrl === href) {
            anchor.classList.add("disabled");
          }
        }
      });

      this.querySelector("#hamburger").addEventListener("click", (e) => {
        e.preventDefault();
        const menu = document.getElementById("app-menu");
        menu.classList.toggle("active");

        // create auto-hiding behavior when clicked outside the menu or pressed a key.
        const autoHideMenu = () => {
          const once = {
              once: true
            },
            closeMenu = (event) => {
              if (
                event.type === "mousedown" &&
                event.target.closest("#app-menu") // clicked on menu itself
              ) {
                autoHideMenu(); // reactivate auto-hiding
                return;
              }

              menu.classList.remove("active");
            };

          document.addEventListener("keydown", closeMenu, once);
          document.addEventListener("mousedown", closeMenu, once);
        };

        if (menu.classList.contains("active")) autoHideMenu();
      });
    }

    showGuidance() {
      this.#helpDialog = parseHTML(
        /*html*/ `<dialog class="guidance"></dialog>`
      )[0];
      document.body.appendChild(this.#helpDialog);

      this.#helpDialog.innerHTML = /*html*/ `
      <form method="dialog">
          <h2>${this.settings.guidance?.title || "Info"}</h2>
          <section>${this.settings.guidance?.description?.replace(
            "\n",
            "<br /><br />\n"
          )}</section>
          <section class="features">
            <ul>
            ${this.getFeatures()}
            </ul>
          </section>
          <nav>
            <button>Close</button>
          </nav>
      </form>
      `;

      this.#helpDialog.showModal();
    }

    getFeatures() {
      const builder = new HTMLBuilder();
      (this.settings?.guidance?.features || []).forEach((feature) => {
        builder.add(/*html*/ `<li>${feature}</li>`);
      });
      return builder.toHTML();
    }

    autoHide() {
      let lastScrollTop;

      let navbar = document.getElementById("app-menu"); // Get The NavBar

      const appElement = document.querySelector(".app-container");
      appElement.addEventListener(
        "scroll",
        debounce((e) => {
          let scrollTop = window.pageYOffset || appElement.scrollTop;

          navbar.classList.toggle("hide", scrollTop > lastScrollTop);

          lastScrollTop = scrollTop;
        })
      );
    }
  }
);

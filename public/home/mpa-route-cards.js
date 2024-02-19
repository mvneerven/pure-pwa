import { CustomElement, enQueue, HTMLBuilder } from "../assets/js/common.js";

customElements.define(
  "mpa-route-cards",
  class MPARouteCards extends CustomElement {
    connectedCallback() {
      super.connectedCallback();

      this.addEventListener("click", (e) => {
        let url = e.target?.getAttribute("data-page");
        if (url) {
          e.preventDefault();
          e.target.classList.add("ripple");
          enQueue(() => {
            location.href = e.target.getAttribute("href");
          }, 50);
        }
      });
    }

    render() {
      return /*html*/ `<nav class="cards">${this.getCards()}</nav>`;
    }

    getCards() {
      const builder = new HTMLBuilder();

      const cards = Object.keys(purePWA.settings.routes)
        .map((key) => {
          let item = purePWA.settings.routes[key];
          if (item.card) {
            item.card.href = key;
            item.card.id = key.replace(/\//g, "");
          }
          return item;
        })
        .filter((item) => {
          if (item.card) return true;
        })
        .map((item) => item.card);

      cards.sort((a, b) => {
        return a.index > b.index ? 1 : -1;
      });

      for (let card of cards) {
        if (card) builder.add(this.getCard(card));
      }
      return builder.toHTML();
    }

    getCard(card) {
      return /*html*/ `<a class="fade-in" data-page="${card.id}" href="${card.href}">${purePWA.localizeString(card.title)}</a>`;
    }
  }
);

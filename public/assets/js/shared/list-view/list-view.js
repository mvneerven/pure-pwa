import { CustomElement, HTMLBuilder } from "../../common.js";

customElements.define(
  "list-view",

  class ListView extends CustomElement {
    connectedCallback() {
      this.settings = {
        columns: ["title"]
      };

      let boundElement, boundProperty;

      this.listViewItems = [];
      // TODO move to CustomElement class
      let bind = this.getAttribute("bind");
      if (bind && bind.startsWith("@")) {
        const bindParts = bind.split(".");
        boundElement = document.getElementById(bindParts[0].substring(1));
        boundProperty = bindParts[1];

        this.listViewItems = boundElement[boundProperty];
        boundElement.addEventListener("state-change", (e) => {
          this.renderRoot.innerHTML = this.render();
        });
      }

      super.connectedCallback();

      this.addEventListener("input", (e) => {
        if (e.target.name === "select-state") {
          const index = ListView.getIndex(e);
          this.listViewItems[index].done = !this.listViewItems[index].done;
        }
      });
      this.addEventListener("click", (e) => {
        const index = ListView.getIndex(e);
        if (e.target.tagName === "BUTTON")
          boundElement[boundProperty].splice(index, 1);
      });
    }

    static getIndex(e) {
      let parent = e.target.closest("ol");
      return Array.prototype.indexOf.call(
        parent.children,
        e.target.closest("li")
      );
    }

    render() {
      if (!this.listViewItems || this.listViewItems.length === 0)
        return /*html*/ `<em>No items yet</em>`;

      const builder = new HTMLBuilder(/*html*/ `<ol>{html}</ol>`);

      for (let item of this.listViewItems) {
        builder.add(this.getItem(item));
      }

      return builder.toHTML();
    }

    getItem(item) {
      return /*html*/ `<li>
        <label data-id="${
          item.id
        }"><input name="select-state" type="checkbox" ${
        item.done ? "checked" : ""
      } /> 
          ${this.getColumns(item)}
        </label>
        <button type="button" class="del">X</button>
      </li>`;
    }

    getColumns(listViewItem) {
      const builder = new HTMLBuilder();
      for (let column of this.settings.columns) {
        builder.add(/*html*/ `<span>${listViewItem[column]}</span>`);
      }
      return builder.toHTML();
    }
  }
);

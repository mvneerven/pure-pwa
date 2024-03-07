import {
  CustomElement,
  parseHTML,
  toCamelCase,
  sanitizeString
} from "../../common.js";

customElements.define(
  "x-form",
  /**
   * HTML Form progressive enhancement that keeps form values in state["x-form-data"]
   * and dispatches x-form-change events on change & submit.
   *
   * @fires XForm#x-form-change
   */
  class XForm extends CustomElement {
    formIsDirty;

    connectedCallback() {
      const me = this;
      this.form = this.querySelector("form");
      this.state["x-form-data"] = {};

      this.addEventListener("input", (e) => {
        const control = e.target;
        if (control.name && XForm.listenFor(control, ["update"]))
          this.state["x-form-data"][control.name] = XForm.getFormValue(control);
      });

      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(this.form);

        this.state["x-form-data"] = Object.fromEntries(
          XForm.sanitizeFormData(data)
        );
        this.dispatchEvent(
          new CustomEvent("x-form-change", {
            detail: {
              name: "--submit",
              value: this.state["x-form-data"]
            },
            bubbles: true
          })
        );
        me.formIsDirty = false; // reset after submission
      });

      this.addEventListener("change", (e) => {
        this.dispatchEvent(
          new CustomEvent("x-form-change", {
            detail: {
              name: e.target.name,
              value: e.target.value
            },
            bubbles: true
          })
        );
      });

      this.enrichControls();
      this.addDirtyCheck();
      this.checkDebug();

      setTimeout(() => this.select.apply(this), 0);
    }
    
    static sanitizeFormData(formData) {
      const sanitizedFormData = new FormData();
      for (let [key, value] of formData.entries()) {
        if (typeof value === "string")
          sanitizedFormData.append(key, sanitizeString(value));
        else sanitizedFormData.append(key, value);
      }
      return sanitizedFormData;
    }

    checkDebug() {
      if (this.hasAttribute("debug")) {
        this.addEventListener("x-form-change", (e) => {
          console.log("X-FORM debug: ", e.detail);
          if (e.detail.name === "--submit") {
            alert(JSON.stringify(e.detail, null, "   "));
          }
        });
      }
    }

    addDirtyCheck() {
      const me = this;
      if (this.hasAttribute("dirty-check")) {
        this.form.addEventListener("input", function () {
          me.formIsDirty = true;
        });

        window.addEventListener("beforeunload", function (e) {
          if (me.formIsDirty) {
            e.preventDefault(); // Cancel the event
            e.returnValue = "";
          }
        });
      }
    }

    select() {
      this.stateContainer = this.closest("settings-form");
      this.form
        .querySelectorAll("[data-selected]")
        .forEach((containerElement) => {
          let valueName = containerElement.getAttribute("data-selected");
          if (valueName?.startsWith("@")) {
            containerElement
              .querySelectorAll("[name]")
              .forEach((formElement) => {
                let name = toCamelCase(valueName.substring(1));
                let value = this.stateContainer?.state[name] || "";

                if (["checkbox", "radio"].includes(formElement.type)) {
                  if (formElement.value === value) formElement.checked = true;
                } else if (["SELECT"].includes(formElement.nodeName)) {
                  for (let i = 0; i < formElement.options.length; i++) {
                    if (formElement.options[i].value === value) {
                      formElement.selectedIndex = i;
                      break;
                    }
                  }
                } else formElement.value = value;
              });
          }
        });
    }

    /**
     * Gets the current value of a form control
     * The `getFormValue()` method will get called if a web component implements it.
     * @param {*} control
     * @returns {*} The value of the control
     */
    static getFormValue(control) {
      if (typeof control.getFormValue === "function")
        return control.getFormValue();

      switch (control.tagName) {
        case "INPUT":
          switch (control.type) {
            case "text":
              return control.value;
            case "checkbox":
              return control.checked ? true : false;
            case "radio":
              const radioGroup = document.getElementsByName(control.name);
              for (let i = 0; i < radioGroup.length; i++) {
                if (radioGroup[i].checked) {
                  return radioGroup[i].value;
                }
              }
              break;
          }
          break;
        case "SELECT":
          if (control.multiple) {
            const selectedOptions = [];
            for (let i = 0; i < control.options.length; i++) {
              if (control.options[i].selected) {
                selectedOptions.push(control.options[i].value);
              }
            }
            return selectedOptions;
          } else {
            return control.value;
          }
          break;
        case "TEXTAREA":
          return control.value;
      }
    }

    /**
     *
     * @param {HTMLElement} control
     * @param {Array<string>} eventNames
     * @returns
     */
    static listenFor(control, eventNames = []) {
      return eventNames.includes(
        control.getAttribute("data-x-update") || "input"
      );
    }

    enrichControls() {
      this.resolveDataSources();
    }

    async resolveDataSources() {
      this.querySelectorAll("[data-source]").forEach(async (element) => {
        let url = element.getAttribute("data-source");
        let data = await fetch(url).then((x) => x.json());

        let field = element.getAttribute("data-field");

        for (let item of data) {
          let option = parseHTML(`<option value="${item[field]}"></option>`)[0];
          element.appendChild(option);
        }
      });
    }
  }
);

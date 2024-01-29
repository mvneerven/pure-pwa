import { CustomElement } from "../../common.js";

customElements.define(
  "dropdown-list",

  class DropdownList extends CustomElement {
    connectedCallback() {
      const input = this.querySelector("input"),
      dataList = input.list;
      
      /**
       * Determine whether an option exists with the current value of the input.
       * Use the setCustomValidity function of the Validation API to provide 
       * user feedback if the value does not exist in the datalist
       */
      input.addEventListener("change", function () {
        let optionFound = false;
        for (let option of dataList.options) {
          if (this.value == option.value) {
            optionFound = true;
            break;
          }
        }
        if (optionFound) {
          this.setCustomValidity("");
        } else {
          this.setCustomValidity("Please select a valid value from the list.");
        }
      });

      if(input.value == ""){
       input.value = dataList.options[0]?.value || "";
      }
    }
  }
);

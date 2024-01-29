import { CustomElement, enQueue } from "../../common.js";

customElements.define(
  "accordion-details",

  /**
   * Progressively enhances a list of details/summary elements behave like an accordion
   */
  class AccordionDetails extends CustomElement {
    connectedCallback() {
      this.addEventListener("click", (e) => {
        const details = e.target.closest("details");
        if(!details) return;
        
        if (e.target.nodeName !== "SUMMARY") details.open = !details.open; // not only summary click should toggle visibility
        enQueue(()=>{
          this.querySelectorAll("details").forEach((element) => {
            element.open = details?.open && details === element;
          });
        },200)
        
      });
    }
  }
);

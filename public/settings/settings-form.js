import { Appearance, CustomElement, PurePWA } from "../assets/js/common.js";

customElements.define(
  "settings-form",

  class SettingsForm extends CustomElement {
    constructor() {
      super();

      const appearanceSettings = PurePWA.detectAppearanceSettings();

      this.state.appearance = localStorage.getItem("appearance");
      this.state.colorScheme = appearanceSettings.theme;
      this.state.useAnimations = localStorage.getItem("use-animations") || "0";
    }

    connectedCallback() {
      this.addEventListener("x-form-change", (e) => {
        switch (e.detail.name) {
          case "appearance":
            const appearanceSettings = PurePWA.detectAppearanceSettings();
            purePWA.appearance = e.detail.value;

            purePWA.colorScheme =
              purePWA.appearance === Appearance.System
                ? appearanceSettings.theme
                : purePWA.appearance;

            break;
          case "animation":
            purePWA.useAnimations = e.detail.value === "1" ? true : false;
            break;
        }
      });
    }
  }
);

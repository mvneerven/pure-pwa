import { hookEscapeKey, HTMLBuilder, RouterElement } from "../assets/js/common.js";

customElements.define(
  "image-carousel",

  class ImageCarousel extends RouterElement {
    get data() {
      return [
        {
          author: "Anjana C",
          src: "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg",
          description: "Green and Blue Peacock Feather"
        },
        {
          author: "Luis Ruiz",
          description: "Modern Architecture",
          src: "https://images.pexels.com/photos/1774931/pexels-photo-1774931.jpeg"
        },
        {
          author: "FPD Images",
          description: "Silhouette of a Woman Holding Baseball Bat",
          src: "https://images.pexels.com/photos/7613830/pexels-photo-7613830.jpeg"
        },

        {
          author: "Dg fotografo",
          src: "https://images.pexels.com/photos/1816692/pexels-photo-1816692.jpeg",
          description: "Photo of Woman Holding Flower"
        },
        {
          src: "https://images.pexels.com/photos/11181234/pexels-photo-11181234.jpeg",
          author: "Cpolpa",
          description: "Maple Leaves Floating on the Water"
        }
      ];
    }

    get routes() {
      return {
        "/beauty/image/": (path) => {
          return /*html*/ `<div class="full-screen show" style="background-image: url(${ImageCarousel.convertToPexelsUrl(
            path
          )})"></div>`;
        },
        "/beauty/": (path) => {
          hookEscapeKey(() => history.back());
          return /*html*/ `<section id="blog" class="carousel">${this.getImageCards()} </section>`;
        }
      };
    }

    // e.g. pexels-photo-7613830.jpeg -> https://images.pexels.com/photos/7613830/pexels-photo-7613830.jpeg
    static convertToPexelsUrl(path) {
      let base = path.split("-").pop().replace(".jpeg", "");
      return "https://images.pexels.com/photos/" + base + "/" + path;
    }

    getImageCards() {
      const builder = new HTMLBuilder();
      this.data.forEach((photo) => {
        builder.add(this.formatImage(photo));
      });
      return builder.toHTML();
    }

    formatImage(photo) {
      const path = "./image/" + new URL(photo.src).pathname.split("/").pop();
      const queryString = "?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
      return /*html*/ `<article>

      <h2>${photo.author}</h2>
      <figure class="fade-in card">
        <a href="${path}">
          <img alt="${photo.description}" src="${photo.src}${queryString}" />
        </a>
        <figcaption>
          ${photo.description}
        </figcaption>
      </figure>

    </article>`;
    }
  }
);

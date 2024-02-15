import {
  RouterElement,
  formatDate,
  hookEscapeKey,
  HTMLBuilder,
  enQueue
} from "../assets/js/common.js";

import { TMDB } from "./domain/tmdb.js";

const CARDS_IMG_SIZE = "w300_and_h450_bestv2/";
const DETAIL_IMG_SIZE = "w600_and_h900_bestv2/";

customElements.define(
  "movies-api",
  class MoviesApi extends RouterElement {
    constructor() {
      super();
      this.tmdb = new TMDB({
        url: this.settings.url,
        ...this.settings.tmdb
      });
    }

    get routes() {
      return {
        "/action/movie/": this.getMovie.bind(this),
        "/action/": this.getPopularMovies.bind(this)
      };
    }

    get useSkeleton() {
      return /*html*/ `<section class="cards">
        ${/*html*/ `<div class="skeleton card"></div>`.repeat(20)}
      </section>`;
    }

    connectedCallback() {
      super.connectedCallback();

      this.addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        
        if (card) {
          
          card.style = `view-transition-name: card`;
          card.querySelector(
            ":scope>span"
          ).style = `view-transition-name: title`;
        }
      });
    }

    async getPopularMovies() {
      const me = this;
      hookEscapeKey(() => history.back());
     
      const movies = await this.tmdb.getPopularMovies();

      return /*html*/ `<section class="cards" >${this.getCards(
        movies.results
      )}</section>`;
    }

    getCards(items) {
      const builder = new HTMLBuilder(),
        CDN = this.settings.tmdb.cdnBaseUrl + CARDS_IMG_SIZE;
      for (let item of items) {
        builder.add(
          /*html*/
          `<a href="${this.settings.url}movie/${item.id}" 
              title="${item.title}" 
              class="card fade-in" 
              style="--img: url('${CDN + item.backdrop_path}')">
              <span>${item.title}</span>
              <img class="not-in-view" loading="lazy" src="${this.tmdb.settings.cdnBaseUrl + DETAIL_IMG_SIZE + item.backdrop_path}" />
          </a>`
        );
      }      
      return builder.toHTML();
    }

    async getMovie(path) {
      const movie = await this.tmdb.getMovie(path),
        CDN = this.tmdb.settings.cdnBaseUrl + DETAIL_IMG_SIZE;

      return /*html*/ `<section class="movie-card" >
          <div class="image" style="--img: url('${
            CDN + movie.backdrop_path
          }')"></div>
          <div class="detail">
          <h2>${movie.title} (${formatDate(movie.release_date, "yyyy")})</h2>
            <div class="description">${movie.overview}</div>
          </div>
      </section>`;
    }
  }
);

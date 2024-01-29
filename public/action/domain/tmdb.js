import { apiRequest } from "../../assets/js/common.js";

export class TMDB {
  constructor(settings) {
    this.settings = settings;
  }
  /**
   * Get movie details from TMDB
   */
  async getMovie(movieId) {
    let url = this.settings.endPoint + "movie/" + movieId;
    return await apiRequest(url, "GET", {
      authorization: this.settings.authorization
    });
  }

  /**
   * Get most popular movies on TMDB
   */
  async getPopularMovies() {
    let url =
      this.settings.endPoint +
      "discover/movie?include_video=false&language=en-US&page=1&sort_by=popularity.desc";

    return await apiRequest(url, "GET", {
      authorization: this.settings.authorization
    });
  }
}

import { ApiRequest } from "../../assets/js/common.js";

export class TMDB {
  constructor(settings) {
    this.settings = settings;
    this.request = new ApiRequest(this.settings.endPoint, {
      authorization: this.settings.authorization
    });
  }
  /**
   * Get movie details from TMDB
   */
  async getMovie(movieId) {
    return await this.request.getData("movie/" + movieId);
  }

  /**
   * Get most popular movies on TMDB
   */
  async getPopularMovies() {
    return await this.request.getData(
      "discover/movie?include_video=false&language=en-US&page=1&sort_by=popularity.desc"
    );
  }
}

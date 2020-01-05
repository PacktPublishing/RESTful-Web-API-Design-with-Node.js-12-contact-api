import cors from "cors";

export default class CorsConfig {
  #rawWhitelist;
  #whitelist;
  #cors;

  /**
   *
   * @param {string} whitelist double semicolon separated list of URLs
   */
  constructor(whitelist) {
    this.#rawWhitelist = whitelist;
    this.#cors = cors;
  }

  setAsyncConfig() {
    if (this.#rawWhitelist) {
      this.#whitelist = this.#rawWhitelist.split(";;");

      const corsOptionsDelegate = (req, callback) => {
        const requestOrigin = req.header("Origin");
        const isIncluded = this.#whitelist.includes(requestOrigin);
        let corsOptions;

        if (isIncluded) {
          // reflect (enable) the requested origin in the CORS response
          corsOptions = { origin: true };
          // callback expects two parameters: error and options
          callback(null, corsOptions);
        } else {
          // disable CORS for this request
          corsOptions = { origin: false };
          // callback expects two parameters: error and options
          callback(new Error("Origin not allowed"), corsOptions);
        }
      };

      // returns a middleware function
      return this.#cors(corsOptionsDelegate);
    } else {
      // returns a middleware function
      return this.#cors();
    }
  }
}

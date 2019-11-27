import Express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import basicAuth from "express-basic-auth";

export class ServerConfig {
  #userAccounts = {
    admin: "supersecret2"
  };

  constructor({ port, middlewares, routers }) {
    this.app = Express();
    this.app.set("env", process.env.NODE_ENV);
    this.app.set("port", port);
    this.registerCORSMiddleware();
    this.registerHelmetMiddleware();
    this.registerBasicAuthMiddleware();
    this.registerJSONMiddleware();

    middlewares &&
      middlewares.forEach(mdlw => {
        this.registerMiddleware(mdlw);
      });

    this.app.get("/", (req, res, next) => {
      // const er = new Error("my bad");
      // er.statusCode = 501;
      // throw er;
      res.json({
        message: "Server working"
      });
    });

    routers &&
      routers.forEach(({ baseUrl, router }) => {
        this.registerRouter(baseUrl, router);
      });

    this.registerMiddleware(
      // catch 404 and forward to error handler
      function(req, res, next) {
        var err = new Error("Not Found");
        err.statusCode = 404;
        next(err);
      }
    );
    this.registerErrorHandlingMiddleware();
  }

  get port() {
    return this.app.get("port");
  }

  set port(number) {
    this.app.set("port", number);
  }

  /**
   * register any middleare
   * @param {*} middleware
   */
  registerMiddleware(middleware) {
    this.app.use(middleware);
    return this;
  }

  /**
   * register Express router
   * @param {*} router
   */
  registerRouter(baseUrl, router) {
    this.app.use(baseUrl, router);
    return this;
  }

  /**
   * register Express JSON middleware to handle requests with JSON body
   */
  registerJSONMiddleware() {
    this.registerMiddleware(Express.json());
    return this;
  }

  /**
   * register CORS middleware for cross origin requests
   */
  registerCORSMiddleware() {
    this.registerMiddleware(cors());
    return this;
  }

  /**
   * register Helmet middleware for Security HTTP headers
   */
  registerHelmetMiddleware() {
    this.app.use(helmet());
    return this;
  }

  /**
   * register Helmet middleware for Security HTTP headers
   */
  registerBasicAuthMiddleware() {
    this.registerMiddleware(
      basicAuth({
        users: this.#userAccounts,
        challenge: true
      })
    );
    return this;
  }

  /**
   * register the Express Error Handling middleware
   */
  registerErrorHandlingMiddleware() {
    this.app.get("env") === "development"
      ? this.registerMiddleware(
          ({ statusCode, message, stack }, req, res, next) => {
            res.status(statusCode);
            res.json({
              statusCode,
              message,
              stack
            });
          }
        )
      : this.registerMiddleware(({ statusCode, message }, req, res, next) => {
          res.status(statusCode);
          res.json({ statusCode, message });
        });
    return this;
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Listening on port: ${this.port}`);
    });
  }
}

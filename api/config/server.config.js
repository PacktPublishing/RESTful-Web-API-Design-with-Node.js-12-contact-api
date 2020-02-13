import Express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import paginate from "express-paginate";

import DbConfig from "./db.config";
import { ConfigService, CacheService } from "../services";
import { RateLimiterConfig } from ".";
import { AuthMiddleware } from "../middlewares";

export default class ServerConfig {
  constructor({ port, middlewares, routers }) {
    this.app = Express();
    this.app.set("env", ConfigService.NODE_ENV);
    this.app.set("port", port);
    this.registerCORSMiddleware()
      .registerHelmetMiddleware()
      .registerRateLimiter()
      .registerMorganMiddleware()
      .registerJwtPassportMiddleware()
      .registerJSONMiddleware()
      .registerExpressPaginateMiddleware();

    middlewares &&
      middlewares.forEach(mdlw => {
        this.registerMiddleware(mdlw);
      });

    this.app.get("/ping", (req, res, next) => {
      res.send("pong");
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
   * register Morgan middleware for request logging
   */
  registerMorganMiddleware() {
    this.registerMiddleware(morgan("combined"));
    return this;
  }

  /**
   * register Express Paginate middleware for pagianted data response
   */
  registerExpressPaginateMiddleware() {
    this.registerMiddleware(paginate.middleware(2, 100));
    return this;
  }

  /**
   * Register Rate Limiter middleware to prevent Denial of Service (DoS) attacks
   */
  registerRateLimiter() {
    // set global cache service
    global.redisCacheService = new CacheService({
      host: ConfigService.get("REDIS_HOST"),
      port: ConfigService.get("REDIS_PORT"),
      password: ConfigService.get("REDIS_PASSWORD")
    });

    const rateLimitConf = new RateLimiterConfig({
      client: global.redisCacheService.redisRateLimitClient,
      maxRequests: ConfigService.get("RATE_LIMIT_MAX_REQUESTS"),
      windowMs: ConfigService.get("RATE_LIMIT_WINDOW_MS")
    });

    const limiter = rateLimitConf.redisStoreLimiter;

    this.registerMiddleware(limiter);
    return this;
  }

  /**
   * register the Express Error Handling middleware
   */
  registerErrorHandlingMiddleware() {
    this.app.get("env") === "development"
      ? this.registerMiddleware(
          ({ statusCode = 500, message, stack }, req, res, next) => {
            res.status(statusCode);
            res.json({
              statusCode,
              message,
              stack
            });
          }
        )
      : this.registerMiddleware(
          ({ statusCode = 500, message }, req, res, next) => {
            res.status(statusCode);
            res.json({ statusCode, message });
          }
        );
    return this;
  }

  /**
   * register jwt Passport authentication middleware
   */
  registerJwtPassportMiddleware() {
    const authMdlw = new AuthMiddleware();
    const passportJwtMiddleware = authMdlw.registerJwtStrategy();
    this.registerMiddleware(passportJwtMiddleware);
    return this;
  }

  async listen() {
    try {
      const dbConf = new DbConfig("contactsdb", "images");
      await dbConf.connectDb();

      this.app.listen(this.port, () => {
        console.log(`Listening on port: ${this.port}`);
      });
    } catch (error) {
      console.error(`DB error: ${error.message}`);
    }
  }
}

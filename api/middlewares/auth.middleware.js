import passport from "passport";
import { ConfigService } from "../services";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models";

export default class AuthMiddleware {
  #configService;

  constructor() {
    this.#configService = ConfigService;
  }

  /**
   * Passport JWT strategy implementation to extract JWT token data and verify
   */
  registerJwtStrategy() {
    const authStrategy = new JwtStrategy(
      {
        secretOrKey: this.#configService.get("JWT_TOKEN_SECRET"),
        algorithms: ["HS256"],
        issuer: this.#configService.get("JWT_TOKEN_ISSUER"),
        ignoreExpiration: false,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer")
      },
      async (jwtPayload, done) => {
        const _id = jwtPayload.sub.toString();
        if (!_id) return done(null, false);

        try {
          let user = await User.findOne({ _id }).select({ credential: 0 });

          // set user on request object
          user ? done(null, user) : done(null, false);
        } catch (err) {
          done(err);
        }
      }
    );

    passport.use(authStrategy);
    return passport.initialize();
  }
}

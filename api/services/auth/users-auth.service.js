import jwt from "jsonwebtoken";
import PasswordService from "./password.service";
import ConfigService from "../config.service";
import { User } from "../../models";

export default class UserAuthService {
  #passwordService;
  #configService;

  constructor() {
    this.#passwordService = new PasswordService(10);
    this.#configService = ConfigService;
  }

  /**
   *
   * @param {*} user
   */
  async signUp(user) {
    if (!user) throw new Error("Please provide valid user");

    const usr = user;
    const hashedPassword = await this.#passwordService.hash(
      usr.credential.password
    );

    usr.credential.password = hashedPassword;

    const insertedUser = await new User(usr).save();
    const userPOJO = insertedUser.toObject();

    // console.log("==== USER ===== %o", userPOJO);

    return this.generateAccessToken(userPOJO);
  }

  /**
   *
   * @param {string} email
   * @param {string} password
   */
  async signIn(email, password) {
    const user = await User.findOne({ primaryEmailAddress: email });

    if (!user) return null;

    if (
      (await this.#passwordService.check(
        password,
        user.credential.password
      )) === true
    ) {
      return this.generateAccessToken(user.toObject());
    }

    return null;
  }

  /**
   *
   * @param {*} user
   */
  generateAccessToken(user) {
    "use strict";

    if (!user) throw new Error("Please enter valid user");

    let userData = null;

    // use block of code to forbid from upper-level method code
    {
      // nullify credential
      userData = { ...user, credential: null };

      // remove credential property
      delete userData.credential;

      // make immutable
      Object.freeze(userData);
    }

    const jwtPayload = {
      user: userData
    };

    console.log(
      "ISSUER",
      this.#configService.get("JWT_TOKEN_ISSUER"),
      typeof this.#configService.get("JWT_TOKEN_ISSUER")
    );

    const token = jwt.sign(
      jwtPayload,
      this.#configService.get("JWT_TOKEN_SECRET"),
      {
        algorithm: "HS256",
        issuer: this.#configService.get("JWT_TOKEN_ISSUER"),
        subject: userData._id.toString()
      }
    );

    return token;
  }
}

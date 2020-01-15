import UserAuthService from "../../services/auth/users-auth.service";

export default class AuthController {
  constructor() {
    this.userAuthService = new UserAuthService();
  }

  async signUp(req, res, next) {
    const userToken = await this.userAuthService.signUp(req.body);
    return res.json({
      token: userToken
    });
  }

  async signIn(req, res, next) {
    const { email, password } = req.body;
    const accessToken = await this.userAuthService.signIn(email, password);

    res.status(accessToken ? 200 : 401).json({
      ...(accessToken
        ? { token: accessToken }
        : { message: "Authentication failed" })
    });
  }
}

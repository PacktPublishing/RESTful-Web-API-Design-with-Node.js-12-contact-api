export class ConfigService {
  static NODE_ENV = process.env.NODE_ENV;
  static MONGO_USER = process.env.MONGO_USER;
  static MONGO_PASS = process.env.MONGO_PASS;
  static MONGO_HOST = process.env.MONGO_HOST;

  static get(name) {
    return process.env[name];
  }
}

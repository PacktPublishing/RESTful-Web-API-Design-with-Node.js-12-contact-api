import redis from "redis";

import { promisify } from "util";

export default class CacheService {
  #getContactsForPageField = page => `contacts#${page}`;
  #getContactField = contactId => `contact#${contactId}`;
  #getUserKey = userId => `user#${userId}`;
  #client;
  #asyncHget;
  #asyncHset;
  #asyncExpire;
  #asyncTTL;

  constructor(redisConfig) {
    this.#client = redis.createClient({
      host: redisConfig.host,
      port: redisConfig.port,
      auth_pass: redisConfig.password
    });

    this.#client.on("connect", () => {
      console.log("Connected to Redis caching server");
    });

    this.#client.on("error", console.error);

    // promisify Redis Node client API
    this.#asyncHget = promisify(this.#client.hget).bind(this.#client);
    this.#asyncHset = promisify(this.#client.hset).bind(this.#client);
    this.#asyncExpire = promisify(this.#client.expire).bind(this.#client);
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {number} page
   */
  async getContactsForPage(userId, page = 1) {
    const usId = this.#getUserKey(userId);
    const ctp = this.#getContactsForPageField(page);
    const contacts = await this.#asyncHget(usId, ctp);

    return contacts ? JSON.parse(contacts) : null;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   */
  async getContact(userId, contactId) {
    const usId = this.#getUserKey(userId);
    const ctId = this.#getContactField(contactId);
    const contact = await this.#asyncHget(usId, ctId);

    return contact ? JSON.parse(contact) : null;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {Array} contacts
   * @param {number} page
   */
  async storeContactsForPage(userId, contacts, page = 1) {
    const usId = this.#getUserKey(userId);

    const stored = await this.#asyncHset(
      usId,
      this.#getContactsForPageField(page),
      JSON.stringify(contacts)
    );
    // set auto expire after 1 day
    await this.#asyncExpire(usId, 60 * 60 * 24);

    return stored;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {*} data
   */
  async storeContact(userId, contactId, data) {
    const usId = this.#getUserKey(userId);
    const ctId = this.#getContactField(contactId);
    const stored = await this.#asyncHset(usId, ctId, JSON.stringify(data));

    // set auto expire after 1 minute
    await this.#asyncExpire(usId, 60);

    return stored;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   */
  async purgeCacheNow(userId) {
    const usId = this.#getUserKey(userId);
    return await this.#asyncExpire(usId, 0);
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {number} seconds
   */
  async purgeCache(userId, seconds) {
    const usId = this.#getUserKey(userId);
    return await this.#asyncExpire(usId, seconds);
  }

  get redisRateLimitClient() {
    return this.#client;
  }
}

export default class ContactUtil {
  /**
   *
   * @param {*} cacheService
   * @param {import("mongoose").Model} ContactModel
   * @param {import("mongodb").GridFSBucket} gfsBucket
   */
  constructor(cacheService, ContactModel, gfsBucket) {
    this.cacheService = cacheService;
    this.ContactModel = ContactModel;
    this.gfsBucket = gfsBucket;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   */
  async getContact(userId, contactId) {
    let cachedContact = await this.cacheService.getContact(userId, contactId);

    if (cachedContact) {
      console.log(
        `========= using contact cache =============== ${JSON.stringify(
          cachedContact
        )}`
      );
    }
    if (!cachedContact) {
      console.log("========= setting contact cache ===============");

      this.cacheService.purgeCacheNow(userId);

      cachedContact = await this.ContactModel.findOne({
        _id: contactId
      });

      this.cacheService.storeContact(userId, contactId, cachedContact);
    }

    return cachedContact;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {{ image: import("mongoose").Schema.Types.ObjectId; }} updateData
   */
  async updateContact(userId, contactId, updateData) {
    await this.cacheService.purgeCacheNow(userId);

    const updatedContact = await this.ContactModel.findOneAndUpdate(
      { _id: contactId },
      { ...updateData },
      { new: true }
    );

    console.log(
      "==== Updated to: ",
      JSON.stringify(updatedContact, null, 2),
      "\n\n\n"
    );

    this.cacheService.storeContact(userId, contactId, updatedContact);

    return updatedContact;
  }

  async removeExistingImage(imageObjectId, userId, contactId) {
    await this.cacheService.purgeCacheNow(userId);

    return new Promise((resolve, reject) => {
      this.gfsBucket.delete(imageObjectId, async err => {
        if (err) return reject(err);

        if (userId && contactId) {
          // remove reference to deleted image from contact
          const updated = await this.updateContact(userId, contactId, {
            image: null
          });

          return resolve(updated);
        } else {
          // orphan image
          return Promise.resolve();
        }
      });
    });
  }
}

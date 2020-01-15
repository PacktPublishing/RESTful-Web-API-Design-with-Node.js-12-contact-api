import mongoose from "mongoose";

import { Contact, User } from "../models";
import { fmtUtils, generateSelf, errorHandler } from "../utils";
import DbConfig from "../config/db.config";

import { ContactUtil } from "../utils";
import { CacheService } from ".";
import ConfigService from "./config.service";

export default class ContactsService {
  #contactModel = Contact;
  #cacheService;
  #contactUtil;
  #gfsBucket;

  constructor() {}

  /**
   * Set dependencies that require open connection to database
   */
  setAsyncDependencies() {
    this.#cacheService = global.redisCacheService;
    this.#gfsBucket = DbConfig.gfsBucket;

    this.#contactUtil = new ContactUtil(
      this.#cacheService,
      this.#contactModel,
      this.#gfsBucket
    );
  }

  /**
   *
   * @param {object[]} contacts
   * @param {string} url
   */
  generateLinkedContacts(contacts, url) {
    return {
      data: contacts.map(contact => ({
        data: contact,
        links: generateSelf({
          entity: contact,
          url
        })
      })),
      links: generateSelf({ url })
    };
  }

  /**
   *
   * @param {object[]} contacts
   */
  generateHTMLContacts(contacts) {
    const orderedContactsPOJOArray = fmtUtils.getOrderedContactsPOJOArrayFrom(
      contacts
    );

    return `
      ${fmtUtils.generateHTMLTable(
        `
          <tr>
          ${fmtUtils.generateHTMLTableHeaders(orderedContactsPOJOArray[0], "")}
          </tr>
          ${orderedContactsPOJOArray.reduce((acc, contact) => {
            return acc.concat(
              "\n",
              `
              <tr style="border: 1px solid black;">
                  ${fmtUtils.generateHTMLCells(contact)}
              </tr>
                 `
            );
          }, "")}
          `
      )}
  `;
  }

  /**
   *
   * @param {*} contacts
   */
  generateCSVContacts(contacts) {
    return fmtUtils.convertToCSV(contacts);
  }

  /**
   *
   * @param {*} contacts
   */
  generateTextContacts(contacts) {
    return contacts.reduce((acc, contact) => {
      return acc.concat(
        ",\n",
        JSON.stringify(contact, null, 4)
          .replace(/,/g, " ")
          .replace(/\{/g, "///#====================================\\ ")
          .replace(/\}/g, "\\====================================#///")
      );
    }, "");
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {*} filter
   * @param {*} fields
   * @param {number} offset page to query
   * @param {number} limit max number of documents per page
   * @param {import("express").NextFunction} next
   */
  async findContacts(userId, filter = {}, fields, offset, limit, next) {
    // check if contacts for that page are already cached
    const cachedContactsPage = await this.#cacheService.getContactsForPage(
      userId,
      offset
    );

    console.log(
      `\npage: ${offset}, requested contacts per page: ${limit}, cached contacts: ${
        cachedContactsPage && cachedContactsPage.docs
          ? cachedContactsPage.docs.length
          : "no cache"
      }`
    );

    if (cachedContactsPage && cachedContactsPage.docs.length === limit) {
      console.log("========= using cache for contacts page ===============");

      return cachedContactsPage;
    } else {
      console.log("========= setting cache for contacts page ===============");

      await this.#cacheService.purgeCacheNow(userId);

      const options = {
        limit,
        page: offset,
        populate: "image",
        select: fields
      };

      const {
        docs,
        totalDocs,
        page,
        totalPages,
        hasNextPage,
        nextPage,
        hasPrevPage,
        prevPage,
        pagingCounter
      } = await this.#contactModel.paginate(filter, options);

      if (offset > totalPages)
        return next(errorHandler("Page number does not exist", 422));

      const contactsForPage = {
        docs,
        totalDocs,
        page,
        totalPages,
        hasNextPage,
        nextPage,
        hasPrevPage,
        prevPage,
        pagingCounter
      };

      // cache data for that page
      await this.#cacheService.storeContactsForPage(
        userId,
        contactsForPage,
        offset
      );

      return contactsForPage;
    }
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {Express.Multer.File} file
   * @param {import("express").NextFunction} next
   */
  async attachContactImage(userId, contactId, file, next) {
    await this.#cacheService.purgeCacheNow(userId);

    // remove uploaded image = not be linked to contact
    if (!contactId || !isNaN(contactId)) {
      const orphanImageId = file.id;

      await this.#contactUtil.removeExistingImage(
        new mongoose.Types.ObjectId(orphanImageId)
      );
      return next(errorHandler("Please enter valid contact ID", 400));
    }

    const imageData = {
      image: file.id
    };

    // const contact = await contactsUtils.getContact(url, contactId, next);
    const contact = await this.#contactUtil.getContact(userId, contactId);

    // delete previous image if exists
    if (contact.image) {
      await this.#contactUtil.removeExistingImage(
        new mongoose.Types.ObjectId(contact.image._id),
        userId,
        contactId
      );
    }

    const updatedWithImage = await this.#contactUtil.updateContact(
      userId,
      contactId,
      imageData
    );

    return updatedWithImage;
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async getContactImage(userId, contactId, res, next) {
    if (!contactId)
      return next(errorHandler("Please enter valid contact ID", 400));
    if (!this.#gfsBucket) return next(errorHandler("No GridFS bucket"));

    try {
      const contact = await this.#contactUtil.getContact(userId, contactId);

      let imageId;
      contact.image
        ? (imageId = contact.image)
        : next(errorHandler("No image associated to this contact", 404));

      const imageObjectId = new mongoose.Types.ObjectId(imageId);
      const files = await this.#gfsBucket
        .find({ _id: imageObjectId })
        .toArray();

      if (!files || files.length === 0) {
        return next(errorHandler("no files exist", 404));
      }

      this.#gfsBucket.openDownloadStream(imageObjectId).pipe(res);
    } catch (error) {
      next(errorHandler(error.message));
    }
  }

  /**
   *
   * @param {import("mongoose").Schema.Types.ObjectId} userId
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {import("express").NextFunction} next
   */
  async deleteContactImage(userId, contactId, next) {
    await this.#cacheService.purgeCacheNow(userId);

    if (!contactId)
      return next(errorHandler("Please enter valid contact ID", 400));
    if (!this.#gfsBucket) return next(errorHandler("No GridFS bucket"));

    try {
      let imageId;

      // retrieve image id
      const contact = await this.#contactUtil.getContact(userId, contactId);

      contact.image
        ? (imageId = contact.image)
        : next(errorHandler("No image associated to this contact", 404));

      const removedImage = await this.#contactUtil.removeExistingImage(
        new mongoose.Types.ObjectId(imageId),
        userId,
        contactId
      );

      return removedImage;
    } catch (error) {
      next(errorHandler(error.message));
    }
  }

  /**
   * Create new contact and associate it to logged uqer
   * @param {*} userId
   * @param {*} contactData
   * @param {*} next
   */
  async postUserContact(userId, contactData, next) {
    const newContact = new Contact(contactData);
    const insertedContact = await newContact.save();

    const result = await User.updateOne(
      { _id: userId },
      {
        // $addToSet : operator to avoid duplicate values in array
        // can also use mongoose plugin https://www.npmjs.com/package/mongoose-unique-array
        $addToSet: { contacts: insertedContact._id }
      }
    ).select({
      firstName: 1,
      lastName: 1,
      primaryEmailAddress: 1,
      contacts: 1
    });

    return result.ok === 1 && result.nModified > 0;
  }

  /**
   *
   * @param {*} user
   * @param {*} contactId
   * @param {*} updateContactData
   * @param {*} next
   */
  async putUserContact(user, contactId, updateContactData, next) {
    // check contact id in logged user contacts
    const found = user.contacts.find(
      contact => contact.toString() === contactId
    );

    if (found) {
      const result = await Contact.updateOne(
        {
          _id: contactId
        },
        updateContactData
      );

      return result.ok === 1 && result.nModified > 0;
    }

    return false;
  }

  /**
   *
   * @param {*} user
   * @param {*} contactId
   * @param {*} next
   */
  async deleteUserContact(user, contactId, next) {
    // check contact id in logged user contacts
    const found = user.contacts.find(
      contact => contact.toString() === contactId
    );

    if (found) {
      const result = await Contact.deleteOne({
        _id: contactId
      });

      if (result.ok === 1 && result.deletedCount > 0) {
        // remove contact from user contacts
        user.contacts = user.contacts.filter(
          contact => contact.toString() !== contactId
        );

        const updated = await user.save();

        return Boolean(updated);
      }
    }

    return false;
  }
}

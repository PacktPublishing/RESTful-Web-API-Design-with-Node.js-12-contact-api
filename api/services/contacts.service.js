import mongoose from "mongoose";

import { Contact } from "../models";
import { fmtUtils, generateSelf, errorHandler } from "../utils";
import DbConfig from "../config/db.config";

import { contactsUtils } from "../utils";

export default class ContactsService {
  /**
   *
   * @param {object[]} contacts
   * @param {string} url
   */
  generateLinkedContacts(contacts, url) {
    return {
      data: contacts.map(contact => ({
        data: contact.toJSON(),
        links: generateSelf({
          entity: contact.toJSON(),
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
    return fmtUtils.convertToCSV(contacts.map(ct => ct.toObject()));
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
   * @param {*} filter
   * @param {*} fields
   * @param {number} offset
   * @param {number} limit
   * @param {string} url
   * @param {*} next
   */
  async findContacts(filter = {}, fields, offset, limit, next) {
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
    } = await Contact.paginate(filter, options);

    if (offset > totalPages)
      return next(errorHandler("Page number does not exist", 422));

    return {
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
  }

  /**
   * Attach uploaded image to specific contact
   * @param {string} url
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {Express.Multer.File} file
   * @param {NextFunction} next
   */
  async attachContactImage(url, contactId, file, next) {
    try {
      console.log(`\nContact ID: ${contactId} \n`);
      console.log(`\nFile ID: ${file.id} \n`);

      // remove uploaded image = not be linked to contact
      if (!contactId || !isNaN(contactId)) {
        console.log("\nDeleting orphan image \n");

        contactsUtils.removeExistingImage(url, `orphan__${file.id}`, next);
        return next(errorHandler("Please enter valid contact ID", 400));
      }

      const imageData = {
        image: file.id
      };

      const contact = await contactsUtils.getContact(url, contactId, next);

      // delete previous image if exists
      if (contact.image) {
        console.log("\nDeleting previous image \n");

        await contactsUtils.removeExistingImage(url, contactId, next);
      }

      console.log(
        `\nLinking uploaded image to contact ${JSON.stringify(imageData)} \n`
      );

      const contactUpdateResponse = await contactsUtils.updateContact(
        url,
        contactId,
        imageData,
        next
      );

      return contactUpdateResponse.message === "Contact updated"
        ? true
        : errorHandler(
            `Error Linking image to contact: ${contactUpdateResponse.data}`
          );
    } catch (error) {
      errorHandler(error.message);
    }
  }

  /**
   * Get image for specific contact
   * @param {string} url
   * @param {*} contactId
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async getContactImage(url, contactId, res, next) {
    if (!contactId)
      return next(errorHandler("Please enter valid contact ID", 400));
    if (!DbConfig.gfsBucket) return next(errorHandler("No GridFS bucket"));

    try {
      // retrieve filename
      const contact = await contactsUtils.getContact(url, contactId, next);

      let filename;
      contact.image
        ? (filename = contact.image.filename)
        : next(errorHandler("No image associated to this contact", 404));

      const files = await DbConfig.gfsBucket.find({ filename }).toArray();

      if (!files || files.length === 0) {
        return next(errorHandler("no files exist", 404));
      }

      DbConfig.gfsBucket.openDownloadStreamByName(filename).pipe(res);
    } catch (error) {
      next(errorHandler(error.message));
    }
  }

  /**
   *
   * @param {string} url
   * @param {import("mongoose").Schema.Types.ObjectId} contactId
   * @param {*} next
   */
  async deleteContactImage(url, contactId, next) {
    if (!contactId)
      return next(errorHandler("Please enter valid contact ID", 400));
    if (!DbConfig.gfsBucket) return next(errorHandler("No GridFS bucket"));

    try {
      let imageId;

      // delete orphan umages
      if (contactId.includes("orphan__")) {
        console.log("Deleting orphan image");

        imageId = contactId.split("__")[1];
      } else {
        // retrieve image id
        const contact = await contactsUtils.getContact(url, contactId, next);

        contact.image
          ? (imageId = contact.image._id)
          : next(errorHandler("No image associated to this contact", 404));
      }

      // need to return an explicit promise because of callback
      return new Promise((resolve, reject) => {
        DbConfig.gfsBucket.delete(
          new mongoose.Types.ObjectId(imageId),
          async err => {
            if (err) return reject(err);

            // remove reference to deleted image from contact
            await contactsUtils.updateContact(
              url,
              contactId,
              { image: null },
              next
            );

            resolve(true);
          }
        );
      });
    } catch (error) {
      next(errorHandler(error.message));
    }
  }
}
